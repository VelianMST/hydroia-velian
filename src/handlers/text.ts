import type { MyContext } from "../session.js";
import { crearOActualizarUsuario, obtenerUsuario } from "../repositories/usuariosRepo.js";
import { responderTexto } from "../services/claudeText.js";
import { handleReportarMensaje } from "./reportar.js";
import { handleBorrarMensaje } from "./privacy.js";
import { handleColoniaMensaje, handleMunicipioMensaje } from "./ubicacion.js";
import { pedirMunicipio } from "./ubicacionPrompt.js";
import { aleatorio, RESPUESTAS_NO_ENTENDIDAS } from "../utils/messages.js";

const PALABRAS_COLONIA = [
  "vivo en",
  "soy de",
  "mi colonia es",
  "mi colonia",
  "vivo por",
  "estoy en la colonia",
];

function extraerColoniaDesdeTexto(texto: string): string | null {
  const limpio = texto.trim();
  const lower = limpio.toLowerCase();
  for (const clave of PALABRAS_COLONIA) {
    const idx = lower.indexOf(clave);
    if (idx !== -1) {
      const trozo = limpio.slice(idx + clave.length).trim();
      const sin = trozo.replace(/^[:,\s]+/, "").replace(/[.!?]+$/, "");
      if (sin.length >= 2 && sin.length <= 80) return sin;
    }
  }
  return null;
}

export async function handleText(ctx: MyContext): Promise<void> {
  try {
    const texto = ctx.message?.text;
    const chatId = ctx.chat?.id;
    if (!texto || !chatId) return;

    const conv = ctx.session.conversation;

    if (conv.type === "esperando_colonia") {
      await handleColoniaMensaje(ctx);
      return;
    }
    if (conv.type === "esperando_municipio") {
      await handleMunicipioMensaje(ctx);
      return;
    }
    if (conv.type === "reporte_tipo" || conv.type === "reporte_descripcion") {
      await handleReportarMensaje(ctx);
      return;
    }
    if (conv.type === "borrar_confirmacion") {
      await handleBorrarMensaje(ctx);
      return;
    }

    // Fuera de flujo: si escribe "vivo en X", arranca captura colonia+municipio
    const coloniaDetectada = extraerColoniaDesdeTexto(texto);
    if (coloniaDetectada) {
      await ctx.reply(`📍 Anoté tu colonia: *${coloniaDetectada}*.`, {
        parse_mode: "Markdown",
      });
      await pedirMunicipio(ctx, coloniaDetectada, "inicial");
      return;
    }

    const usuario = await obtenerUsuario(chatId);
    if (!usuario) {
      await crearOActualizarUsuario(chatId, { consentimiento: false });
    }

    const respuesta = await responderTexto(texto);
    await ctx.reply(respuesta);
  } catch (err) {
    console.error("Error en handler de texto:", err);
    await ctx.reply(aleatorio(RESPUESTAS_NO_ENTENDIDAS)).catch(() => {});
  }
}
