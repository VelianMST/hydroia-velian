import { Keyboard } from "grammy";
import type { MyContext, FlujoUbicacion } from "../session.js";
import { MUNICIPIOS_SUGERIDOS } from "../data/geocatalogo.js";

// Módulo "hoja": solo depende de session y del catálogo. Lo usan
// prediccion.ts, reportar.ts y ubicacion.ts sin crear ciclos de import.

export function tecladoMunicipios(): Keyboard {
  const kb = new Keyboard();
  for (const m of MUNICIPIOS_SUGERIDOS) kb.text(m).row();
  return kb.resized().oneTime();
}

export async function pedirColonia(
  ctx: MyContext,
  flujo: FlujoUbicacion,
): Promise<void> {
  ctx.session.conversation = { type: "esperando_colonia", flujo };
  await ctx.reply(
    "📍 ¿En qué *colonia* vives? Solo el nombre de la colonia, no la dirección exacta.",
    { parse_mode: "Markdown", reply_markup: { remove_keyboard: true } },
  );
}

export async function pedirMunicipio(
  ctx: MyContext,
  colonia: string,
  flujo: FlujoUbicacion,
): Promise<void> {
  ctx.session.conversation = { type: "esperando_municipio", colonia, flujo };
  await ctx.reply(
    "¿En qué *municipio o alcaldía*? Toca una opción, o escríbelo (si no es Estado de México, pon también el estado, por ejemplo: _Zapopan, Jalisco_).",
    { parse_mode: "Markdown", reply_markup: tecladoMunicipios() },
  );
}
