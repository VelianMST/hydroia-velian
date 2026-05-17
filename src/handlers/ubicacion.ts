import type { MyContext } from "../session.js";
import { registrarUbicacionUsuario } from "../repositories/usuariosRepo.js";
import { pedirMunicipio } from "./ubicacionPrompt.js";
import { entregarPrediccion } from "./prediccion.js";
import { iniciarTipoReporte } from "./reportar.js";

/** El usuario respondió la colonia (estado esperando_colonia). */
export async function handleColoniaMensaje(ctx: MyContext): Promise<void> {
  const conv = ctx.session.conversation;
  if (conv.type !== "esperando_colonia") return;
  const texto = (ctx.message?.text ?? "").trim();
  if (texto.length < 2 || texto.length > 80 || texto.startsWith("/")) {
    await ctx.reply(
      "Necesito solo el nombre de la colonia, por ejemplo: *Lomas de San Miguel*.",
      { parse_mode: "Markdown" },
    );
    return;
  }
  await pedirMunicipio(ctx, texto, conv.flujo);
}

/** El usuario respondió el municipio (estado esperando_municipio). */
export async function handleMunicipioMensaje(ctx: MyContext): Promise<void> {
  const conv = ctx.session.conversation;
  if (conv.type !== "esperando_municipio") return;
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const raw = (ctx.message?.text ?? "").trim();
  if (raw.length < 2 || raw.startsWith("/")) {
    await ctx.reply("Dime el municipio o alcaldía, por favor.");
    return;
  }

  let municipio = raw;
  let estado: string | null = null;
  if (raw.includes(",")) {
    const [m, e] = raw.split(",");
    municipio = m.trim();
    estado = e?.trim() || null;
  }

  let fuente = "centroide";
  let muniDisplay = municipio;
  try {
    const r = await registrarUbicacionUsuario(chatId, conv.colonia, municipio, estado);
    fuente = r.fuente;
    muniDisplay = r.municipioDisplay || municipio;
  } catch (err) {
    console.error("Error registrando ubicación:", err);
    ctx.session.conversation = { type: "idle" };
    await ctx
      .reply("Tuve un problema guardando tu ubicación. Intenta de nuevo en un momento.", {
        reply_markup: { remove_keyboard: true },
      })
      .catch(() => {});
    return;
  }

  const precisa = fuente === "catalogo" || fuente === "nominatim" || fuente === "cache";
  const nota = precisa
    ? ""
    : "\n\n_(Ubiqué tu colonia de forma aproximada dentro de tu municipio; si el punto del mapa no es exacto, no afecta tus reportes ni tu predicción.)_";

  if (conv.flujo === "prediccion") {
    ctx.session.conversation = { type: "idle" };
    await ctx.reply(`✅ Listo: *${conv.colonia}*, ${muniDisplay}.`, {
      parse_mode: "Markdown",
      reply_markup: { remove_keyboard: true },
    });
    await entregarPrediccion(ctx, conv.colonia);
    return;
  }

  if (conv.flujo === "reporte") {
    await ctx.reply(`✅ Registré *${conv.colonia}*, ${muniDisplay}.${nota}`, {
      parse_mode: "Markdown",
      reply_markup: { remove_keyboard: true },
    });
    await iniciarTipoReporte(ctx);
    return;
  }

  ctx.session.conversation = { type: "idle" };
  await ctx.reply(
    `✅ Listo, registré que vives en *${conv.colonia}*, ${muniDisplay}.${nota}\n\nYa puedes usar /prediccion, /reportar o mandarme una foto del agua. Si me equivoqué, escribe /start de nuevo.`,
    { parse_mode: "Markdown", reply_markup: { remove_keyboard: true } },
  );
}
