# Módulo de hardware ESP32 — HydroIA Velian

Sensor IoT de bajo costo que mide **turbidez, sólidos disueltos (TDS) y
temperatura** del agua y los envía por WiFi al servidor de HydroIA Velian
(endpoint `POST /api/sensor`) cada 5 minutos. Sustenta el **Objetivo 6 / Fase
6** del documento del proyecto.

## Lista de materiales (BOM) — costo objetivo < $1,500 MXN

| Componente | Aprox. (MXN) |
|---|---|
| ESP32 DevKit v1 (WiFi) | $180 |
| Sensor de turbidez TS-300B | $190 |
| Sensor TDS DFRobot Gravity (SEN0244) | $320 |
| Sensor de temperatura DS18B20 sumergible | $90 |
| Resistencias (4.7 kΩ pull-up + divisor 2 kΩ/3.3 kΩ) | $20 |
| Protoboard + jumpers + cable USB | $150 |
| **Total aprox.** | **≈ $950 MXN** |

> Holgura amplia bajo los $1,500 del documento.

## Conexiones (ESP32 DevKit v1)

```
TS-300B (turbidez)   señal ─[divisor 2kΩ/3.3kΩ]→ GPIO34   VCC→5V   GND→GND
TDS DFRobot Gravity  señal ───────────────────→ GPIO35   VCC→3V3  GND→GND
DS18B20 (temperatura) datos ──────────────────→ GPIO4    VCC→3V3  GND→GND
                      (resistencia 4.7kΩ entre datos y 3V3)
```

**Por qué el divisor en turbidez:** el TS-300B entrega hasta ~4.5 V y el ADC
del ESP32 solo lee 0–3.3 V. El divisor baja el voltaje; el firmware lo
reconstruye con `DIVISOR_TURBIDEZ` (ajústalo a tus resistencias).

**Por qué GPIO 34/35:** son del ADC1. El ADC2 del ESP32 **no funciona con el
WiFi encendido**, así que los sensores analógicos van en ADC1 (pines 32–39).

```
        ┌──────── ESP32 ────────┐
 5V ───►│ VIN              GPIO34│◄── turbidez (vía divisor)
 3V3 ──►│ 3V3              GPIO35│◄── TDS
 GND ──►│ GND              GPIO4 │◄── DS18B20 (+ pull-up 4.7kΩ a 3V3)
        └───────────────────────┘
```

## Cómo cargarlo

### Opción A — Arduino IDE (recomendada, más fácil)
1. Instala el **soporte ESP32**: Preferencias → URLs de gestor de tarjetas →
   `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   → Gestor de tarjetas → instala "esp32".
2. Gestor de librerías → instala: **OneWire**, **DallasTemperature**, **ArduinoJson**.
3. Abre `hydroia_sensor/hydroia_sensor.ino`.
4. Edita la sección **CONFIGURACIÓN**: `WIFI_SSID`, `WIFI_PASS`, `SERVER_URL`
   (la **IP local** de la PC que corre el bot, no `localhost`), `DEVICE_ID`,
   `COLONIA` y `API_KEY` (si la activaste en el `.env`).
5. Tarjeta: "ESP32 Dev Module". Selecciona el puerto y pulsa **Subir**.
6. Abre el Monitor Serie a **115200 baudios** para ver las lecturas.

### Opción B — PlatformIO (VS Code)
1. Instala la extensión **PlatformIO**.
2. Abre la carpeta `firmware/`. El `platformio.ini` ya trae las dependencias.
3. Edita la configuración en el `.ino` igual que arriba.
4. **Build** → **Upload** → **Monitor**.

## Cómo probar sin terminar el hardware

Mientras conectas el circuito, puedes ver el flujo completo (servidor →
Supabase → dashboard → bot) con el **simulador**:

```bash
npx tsx scripts/simular_sensor.ts
```

Manda lecturas realistas a `/api/sensor`. Aparecen en el panel **Sensor IoT**
del dashboard y en el comando `/sensor` del bot.

## Calibración (opcional, mejora la precisión)

- **Turbidez:** mide el voltaje en agua destilada (0 NTU) y ajusta el umbral
  de "agua clara" / la curva si tu sensor difiere.
- **TDS:** usa una solución de calibración conocida (p. ej. 707 ppm) y ajusta
  el factor si hace falta. El firmware ya compensa por temperatura.

## Seguridad

Si defines `SENSOR_API_KEY` en el `.env` del bot, el endpoint exigirá el
encabezado `x-api-key`. Pon esa misma key en `API_KEY` del firmware. Si lo
dejas vacío, el endpoint acepta sin llave (modo desarrollo).
