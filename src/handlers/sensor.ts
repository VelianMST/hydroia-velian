import type { MyContext } from "../session.js";
import { ultimaLectura } from "../repositories/lecturasRepo.js";
import type { LecturaSensor } from "../services/supabase.js";

function evalTurbidez(ntu: number): string {
  if (ntu <= 5) return "✅ aceptable";
  if (ntu <= 50) return "⚠️ turbia";
  return "🚨 muy turbia";
}

function evalTds(ppm: number): string {
  // Guía OMS: agua de buena calidad < 300 ppm; > 1000 ppm no recomendable.
  if (ppm <= 300) return "✅ buena";
  if (ppm <= 600) return "🟡 regular";
  if (ppm <= 1000) return "⚠️ alta";
  return "🚨 no recomendable";
}

function formatear(l: LecturaSensor): string {
  return [
    `📡 *Última lectura del sensor* \`${l.dispositivo_id}\``,
    l.colonia ? `📍 ${l.colonia}` : "",
    "",
    `💧 *Turbidez:* ${l.turbidez_ntu} NTU (${evalTurbidez(l.turbidez_ntu)})`,
    `🧪 *TDS:* ${Math.round(l.tds_ppm)} ppm (${evalTds(l.tds_ppm)})`,
    `🌡️ *Temperatura:* ${l.temperatura_c} °C`,
    "",
    `_Medición ${new Date(l.fecha).toLocaleString("es-MX")}._`,
    "_Tamizaje preliminar, no sustituye análisis de laboratorio._",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function handleSensor(ctx: MyContext): Promise<void> {
  try {
    // /sensor [id_dispositivo]
    const texto = ctx.message?.text ?? "";
    const partes = texto.trim().split(/\s+/);
    const id = partes.length > 1 ? partes.slice(1).join(" ") : undefined;

    const l = await ultimaLectura(id);
    if (!l) {
      await ctx.reply(
        "Aún no hay lecturas del sensor IoT. Cuando un dispositivo HydroIA esté midiendo, aquí verás turbidez, TDS y temperatura en tiempo real. 📡",
      );
      return;
    }
    await ctx.reply(formatear(l), { parse_mode: "Markdown" });
  } catch (err) {
    console.error("Error en /sensor:", err);
    await ctx.reply("No pude consultar el sensor. Intenta en un momento.").catch(() => {});
  }
}
