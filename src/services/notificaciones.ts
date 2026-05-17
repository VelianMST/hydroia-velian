import cron from "node-cron";
import type { Bot } from "grammy";
import { supabase } from "./supabase.js";
import { calcularPrediccion } from "./prediccion.js";
import type { MyContext } from "../session.js";

const CRON_EXPR = "0 */6 * * *"; // cada 6 horas en punto
const UMBRAL_ALERTA = 0.7;
const COOLDOWN_MS = 18 * 60 * 60 * 1000; // 18 h sin reenviar al mismo usuario

const ultimaAlertaPorUsuario = new Map<number, number>();

interface UsuarioConColonia {
  id: number;
  colonia: string;
}

async function obtenerUsuariosConColonia(): Promise<UsuarioConColonia[]> {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, colonia")
    .not("colonia", "is", null);
  if (error) throw error;
  return ((data ?? []) as Array<{ id: number; colonia: string | null }>)
    .filter((u): u is UsuarioConColonia => typeof u.colonia === "string" && u.colonia.length > 0);
}

async function ciclo(bot: Bot<MyContext>): Promise<void> {
  const ahora = Date.now();
  const usuarios = await obtenerUsuariosConColonia();
  if (usuarios.length === 0) return;

  // Agrupa para calcular predicción una sola vez por colonia
  const colonias = Array.from(
    new Set(usuarios.map((u) => u.colonia.trim().toLowerCase())),
  );

  const probPorColonia = new Map<string, number>();
  for (const c of colonias) {
    try {
      const r = await calcularPrediccion(c);
      probPorColonia.set(c, r.probabilidad);
    } catch (err) {
      console.error(`Error calculando predicción para ${c}:`, err);
    }
  }

  for (const u of usuarios) {
    const key = u.colonia.trim().toLowerCase();
    const prob = probPorColonia.get(key);
    if (prob === undefined || prob < UMBRAL_ALERTA) continue;

    const ultima = ultimaAlertaPorUsuario.get(u.id) ?? 0;
    if (ahora - ultima < COOLDOWN_MS) continue;

    const porcentaje = Math.round(prob * 100);
    const mensaje =
      `⚠️ *Alerta de tandeo*\n\n` +
      `Hay *${porcentaje}%* de probabilidad de que se vaya el agua en *${u.colonia}* en las próximas 72 horas.\n\n` +
      `Te recomiendo llenar tinacos, cubetas y garrafones hoy. Para detalles, escribe /prediccion.\n\n` +
      `_Aviso automático de HydroIA Velian._`;

    try {
      await bot.api.sendMessage(u.id, mensaje, { parse_mode: "Markdown" });
      ultimaAlertaPorUsuario.set(u.id, ahora);
    } catch (err) {
      console.error(`No se pudo enviar alerta a ${u.id}:`, err);
    }
  }
}

export function iniciarNotificaciones(bot: Bot<MyContext>): void {
  cron.schedule(
    CRON_EXPR,
    () => {
      ciclo(bot).catch((err) => console.error("Ciclo de notificaciones falló:", err));
    },
    { timezone: "America/Mexico_City" },
  );
}
