/*
 * HydroIA Velian — Módulo de monitoreo de calidad del agua (ESP32)
 * Premio Nacional Juvenil del Agua 2026
 *
 * Sensores:
 *   - Turbidez TS-300B (analógico)         -> NTU
 *   - TDS/Conductividad DFRobot Gravity     -> ppm (con compensación por temp.)
 *   - Temperatura DS18B20 (sumergible)      -> °C
 *
 * Envía las lecturas por WiFi (HTTP POST JSON) al servidor de HydroIA Velian
 * (endpoint /api/sensor) cada 5 minutos.
 *
 * ───────────────── LIBRERÍAS (Gestor de librerías de Arduino) ─────────────
 *   - "OneWire" (Paul Stoffregen)
 *   - "DallasTemperature" (Miles Burton)
 *   - "ArduinoJson" (Benoit Blanchon)
 *   WiFi.h y HTTPClient.h vienen con el core de ESP32.
 *
 * ───────────────── CONEXIONES (ESP32 DevKit v1) ───────────────────────────
 *   Turbidez TS-300B  señal -> GPIO34  (ADC1, solo entrada) *vía divisor*
 *   TDS DFRobot       señal -> GPIO35  (ADC1, solo entrada)
 *   DS18B20           datos -> GPIO4   (resistencia pull-up 4.7kΩ a 3V3)
 *   Todos: VCC -> 3V3 (o 5V según el módulo) y GND común.
 *
 *   IMPORTANTE divisor de voltaje en TURBIDEZ: el TS-300B entrega hasta ~4.5V
 *   y el ADC del ESP32 solo lee 0–3.3V. Pon un divisor (p. ej. R1=2kΩ del
 *   sensor a GPIO34 y R2=3.3kΩ de GPIO34 a GND) y ajusta DIVISOR_TURBIDEZ.
 *   Usa pines ADC1 (32–39): el ADC2 no funciona con WiFi encendido.
 * ──────────────────────────────────────────────────────────────────────────
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ===================== CONFIGURACIÓN (EDITA ESTO) =========================
const char* WIFI_SSID   = "TU_WIFI";
const char* WIFI_PASS   = "TU_PASSWORD";

// URL del servidor HydroIA Velian. Usa la IP local de la PC que corre el bot
// (no "localhost": el ESP32 está en otra máquina). Ej: http://192.168.1.50:3001
const char* SERVER_URL  = "http://192.168.1.50:3001/api/sensor";

const char* DEVICE_ID   = "esp32-hydroia-01";
const char* COLONIA     = "Lomas de San Miguel";

// Si configuraste SENSOR_API_KEY en el .env del bot, ponla aquí. Si no, deja "".
const char* API_KEY     = "";

const unsigned long INTERVALO_MS = 5UL * 60UL * 1000UL; // 5 minutos

// ===================== PINES Y CALIBRACIÓN ================================
const int PIN_TURBIDEZ = 34;
const int PIN_TDS      = 35;
const int PIN_DS18B20  = 4;

// Divisor de voltaje de la turbidez (Vreal = Vmedido * DIVISOR_TURBIDEZ).
// Con R1=2k y R2=3.3k -> factor ≈ (2+3.3)/3.3 ≈ 1.606. Ajústalo a tu divisor.
const float DIVISOR_TURBIDEZ = 1.606f;

const int   N_MUESTRAS = 30;     // promediado para estabilidad
const float VREF       = 3.3f;   // referencia ADC del ESP32

OneWire oneWire(PIN_DS18B20);
DallasTemperature ds18b20(&oneWire);

// ===================== LECTURA DE SENSORES ================================

// Promedio de lecturas del ADC en milivolts (analogReadMilliVolts ya viene
// calibrado de fábrica en el ESP32).
float leerVoltaje(int pin) {
  uint32_t suma = 0;
  for (int i = 0; i < N_MUESTRAS; i++) {
    suma += analogReadMilliVolts(pin);
    delay(5);
  }
  return (suma / (float)N_MUESTRAS) / 1000.0f; // a volts
}

// Turbidez TS-300B: curva típica (agua clara ~ máx voltaje). Devuelve NTU.
// Calibra con agua destilada (0 NTU) y una muestra patrón si puedes.
float leerTurbidezNTU() {
  float v = leerVoltaje(PIN_TURBIDEZ) * DIVISOR_TURBIDEZ;
  if (v > 4.2f) return 0.0f; // agua muy clara
  // Curva cuadrática estándar para sensores de turbidez tipo SEN0189/TS-300B
  float ntu = -1120.4f * v * v + 5742.3f * v - 4352.9f;
  if (ntu < 0) ntu = 0;
  if (ntu > 4000) ntu = 4000;
  return ntu;
}

// TDS DFRobot Gravity con compensación por temperatura. Devuelve ppm.
// (Incorpora la relación TDS_ppm ≈ EC × 0.5 citada en el documento.)
float leerTDSppm(float temperaturaC) {
  float v = leerVoltaje(PIN_TDS);
  float coef = 1.0f + 0.02f * (temperaturaC - 25.0f); // compensación
  float vc = v / coef;
  float tds = (133.42f * vc * vc * vc - 255.86f * vc * vc + 857.39f * vc) * 0.5f;
  if (tds < 0) tds = 0;
  if (tds > 5000) tds = 5000;
  return tds;
}

float leerTemperaturaC() {
  ds18b20.requestTemperatures();
  float t = ds18b20.getTempCByIndex(0);
  if (t == DEVICE_DISCONNECTED_C || t < -50 || t > 125) return 25.0f; // respaldo
  return t;
}

// ===================== WIFI / ENVÍO ======================================

void conectarWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.print("Conectando a WiFi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 40) {
    delay(500);
    Serial.print(".");
    intentos++;
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi OK, IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("No se pudo conectar a WiFi (se reintenta luego).");
  }
}

bool enviarLectura(float turbidez, float tds, float temp) {
  if (WiFi.status() != WL_CONNECTED) {
    conectarWiFi();
    if (WiFi.status() != WL_CONNECTED) return false;
  }

  JsonDocument doc;
  doc["dispositivo_id"] = DEVICE_ID;
  doc["turbidez_ntu"]   = round(turbidez * 100) / 100.0;
  doc["tds_ppm"]        = round(tds * 100) / 100.0;
  doc["temperatura_c"]  = round(temp * 100) / 100.0;
  doc["colonia"]        = COLONIA;

  String cuerpo;
  serializeJson(doc, cuerpo);

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  if (strlen(API_KEY) > 0) http.addHeader("x-api-key", API_KEY);
  http.setTimeout(10000);

  // Hasta 3 intentos
  int code = -1;
  for (int i = 0; i < 3; i++) {
    code = http.POST(cuerpo);
    if (code > 0 && code < 400) break;
    delay(1500);
  }
  Serial.printf("POST -> HTTP %d : %s\n", code, cuerpo.c_str());
  http.end();
  return code > 0 && code < 400;
}

// ===================== SETUP / LOOP ======================================

void setup() {
  Serial.begin(115200);
  delay(300);
  analogReadResolution(12);          // 0–4095
  analogSetAttenuation(ADC_11db);    // rango ~0–3.3V
  ds18b20.begin();
  conectarWiFi();
  Serial.println("HydroIA Velian — sensor iniciado.");
}

void loop() {
  float temp     = leerTemperaturaC();
  float turbidez = leerTurbidezNTU();
  float tds      = leerTDSppm(temp);

  Serial.printf("Turbidez: %.1f NTU | TDS: %.0f ppm | Temp: %.1f C\n",
                turbidez, tds, temp);

  enviarLectura(turbidez, tds, temp);

  delay(INTERVALO_MS);
}
