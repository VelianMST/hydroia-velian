import { Keyboard } from "grammy";
import type { MyContext } from "../session.js";
import { obtenerTexto } from "../session.js";
import type { TipoReporte } from "../services/supabase.js";
import { crearReporte } from "../repositories/reportesRepo.js";
import { obtenerUsuario } from "../repositories/usuariosRepo.js";
import { geocodificar } from "../services/geocoding.js";
import { pedirColonia } from "./ubicacionPrompt.js";
import { aleatorio, AGRADECIMIENTOS_REPORTE } from "../utils/messages.js";

const ETIQUETAS_TIPO: Record<TipoReporte, string> = {
  fuga: "Fuga",
  tandeo: "Tandeo prolongado",
  mala_calidad: "Mala calidad",
};

function teclaTipo(): Keyboard {
  return new Keyboard()
    .text("1) Fuga")
    .row()
    .text("2) Tandeo prolongado")
    .row()
    .text("3) Mala calidad")
    .resized()
    .oneTime();
}

function teclaUbicacion(): Keyboard {
  return new Keyboard()
    .requestLocation("📍 Compartir ubicación")
    .row()
    .text("Saltar ubicación")
    .resized()
    .oneTime();
}

function parsearTipo(texto: string): TipoReporte | null {
  const t = texto.toLowerCase().trim();
  if (t.startsWith("1") || t.includes("fuga")) return "fuga";
  if (t.startsWith("2") || t.includes("tandeo")) return "tandeo";
  if (t.startsWith("3") || t.includes("calidad")) return "mala_calidad";
  return null;
}

/** Inicia la pregunta del tipo de reporte (usuario ya tiene ubicación). */
export async function iniciarTipoReporte(ctx: MyContext): Promise<void> {
  ctx.session.conversation = { type: "reporte_tipo" };
  await ctx.reply(
    "Vamos a registrar tu reporte ⚠️\n\n¿Qué quieres reportar?\n1) Fuga\n2) Tandeo prolongado\n3) Mala calidad",
    { reply_markup: teclaTipo() },
  );
}

export async function handleReportarComando(ctx: MyContext): Promise<void> {
  try {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const usuario = await obtenerUsuario(chatId);
    if (!usuario?.colonia || !usuario?.municipio) {
      await ctx.reply(
        "Antes de reportar necesito saber dónde vives (una sola vez).",
      );
      await pedirColonia(ctx, "reporte");
      return;
    }
    await iniciarTipoReporte(ctx);
  } catch (err) {
    console.error("Error en /reportar:", err);
  }
}

export async function handleReportarMensaje(ctx: MyContext): Promise<void> {
  const conv = ctx.session.conversation;
  const texto = obtenerTexto(ctx);
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  if (conv.type === "reporte_tipo") {
    const tipo = parsearTipo(texto);
    if (!tipo) {
      await ctx.reply("No entendí. Elige 1, 2 o 3.", { reply_markup: teclaTipo() });
      return;
    }
    ctx.session.conversation = { type: "reporte_descripcion", tipoReporte: tipo };
    await ctx.reply(
      `Anotado: *${ETIQUETAS_TIPO[tipo]}*. Cuéntame brevemente qué está pasando (1-2 oraciones).`,
      { parse_mode: "Markdown", reply_markup: { remove_keyboard: true } },
    );
    return;
  }

  if (conv.type === "reporte_descripcion") {
    const descripcion = texto.trim();
    if (descripcion.length < 5) {
      await ctx.reply(
        "Necesito un poquito más de detalle. ¿Puedes describirlo en una oración?",
      );
      return;
    }
    ctx.session.conversation = {
      type: "reporte_ubicacion",
      tipoReporte: conv.tipoReporte,
      descripcion,
    };
    await ctx.reply(
      "Si quieres, comparte tu ubicación con el botón de abajo (opcional). Si prefieres no, toca *Saltar ubicación* — tu reporte se ubicará por tu colonia.",
      { parse_mode: "Markdown", reply_markup: teclaUbicacion() },
    );
    return;
  }
}

export async function handleReportarUbicacion(ctx: MyContext): Promise<void> {
  const conv = ctx.session.conversation;
  if (conv.type !== "reporte_ubicacion") return;
  const loc = ctx.message?.location;
  const latitud = loc ? Math.round(loc.latitude * 100) / 100 : null;
  const longitud = loc ? Math.round(loc.longitude * 100) / 100 : null;
  await finalizarReporte(ctx, conv.tipoReporte, conv.descripcion, latitud, longitud);
}

export async function handleReportarSaltarUbicacion(ctx: MyContext): Promise<void> {
  const conv = ctx.session.conversation;
  if (conv.type !== "reporte_ubicacion") return;
  await finalizarReporte(ctx, conv.tipoReporte, conv.descripcion, null, null);
}

async function finalizarReporte(
  ctx: MyContext,
  tipo: TipoReporte,
  descripcion: string,
  latitud: number | null,
  longitud: number | null,
): Promise<void> {
  try {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const usuario = await obtenerUsuario(chatId);

    // Centroide del reporte = geocodificación de la colonia+municipio del
    // usuario (privacidad: nunca el GPS exacto). Usa la caché si ya existe.
    const geo = await geocodificar(
      usuario?.colonia ?? "",
      usuario?.municipio ?? null,
      usuario?.estado ?? null,
    );

    await crearReporte({
      usuario_id: chatId,
      tipo,
      descripcion,
      colonia: geo.lugar.coloniaDisplay || usuario?.colonia || null,
      colonia_norm: geo.lugar.coloniaNorm || null,
      municipio: geo.lugar.municipioDisplay || usuario?.municipio || null,
      estado_geo: geo.lugar.estado || usuario?.estado || null,
      lat: geo.lat,
      lng: geo.lng,
      latitud,
      longitud,
    });

    ctx.session.conversation = { type: "idle" };
    const agradecimiento = aleatorio(AGRADECIMIENTOS_REPORTE);
    await ctx.reply(
      `${agradecimiento}\n\nAparecerá en el mapa público en cuanto se actualice.`,
      { reply_markup: { remove_keyboard: true } },
    );
  } catch (err) {
    console.error("Error al guardar reporte:", err);
    ctx.session.conversation = { type: "idle" };
    await ctx
      .reply("No pude guardar tu reporte. Intenta de nuevo en un momento.", {
        reply_markup: { remove_keyboard: true },
      })
      .catch(() => {});
  }
}
