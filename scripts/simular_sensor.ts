/**
 * Simulador del sensor ESP32 — manda lecturas realistas a /api/sensor para
 * demostrar el flujo completo (servidor → Supabase → dashboard → bot /sensor)
 * SIN tener el hardware físico conectado.
 *
 * Uso (con el bot/servidor corriendo en otra terminal):
 *   npx tsx scripts/simular_sensor.ts            # 20 lecturas, cada 3 s
 *   npx tsx scripts/simular_sensor.ts 50 1       # 50 lecturas, cada 1 s
 */
import { config } from "../src/config.js";

const N = Number(process.argv[2] ?? 20);
const INTERVALO_S = Number(process.argv[3] ?? 3);
const URL = `http://localhost:${config.port}/api/sensor`;
const DEVICE_ID = "esp32-sim-01";
const COLONIA = "Lomas de San Miguel";

function rango(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

// Genera una lectura realista; ~1 de cada 6 simula agua "mala" (evento).
function generarLectura() {
  const mala = Math.random() < 0.17;
  return {
    dispositivo_id: DEVICE_ID,
    turbidez_ntu: mala ? rango(60, 350) : rango(0.5, 6),
    tds_ppm: mala ? rango(700, 1300) : rango(150, 400),
    temperatura_c: rango(18, 24),
    colonia: COLONIA,
  };
}

async function enviar(lectura: ReturnType<typeof generarLectura>): Promise<boolean> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (config.sensorApiKey) headers["x-api-key"] = config.sensorApiKey;
    const resp = await fetch(URL, {
      method: "POST",
      headers,
      body: JSON.stringify(lectura),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  console.log(`📡 Simulando sensor → ${URL}  (${N} lecturas, cada ${INTERVALO_S}s)`);
  let ok = 0;
  for (let i = 0; i < N; i++) {
    const l = generarLectura();
    const enviado = await enviar(l);
    if (enviado) ok++;
    console.log(
      `${enviado ? "✅" : "❌"} turbidez=${l.turbidez_ntu} NTU · TDS=${l.tds_ppm} ppm · ${l.temperatura_c}°C`,
    );
    if (i < N - 1) await new Promise((r) => setTimeout(r, INTERVALO_S * 1000));
  }
  console.log(`\nListo: ${ok}/${N} lecturas enviadas. Revisa el dashboard y /sensor.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Simulador falló:", err);
  process.exit(1);
});
