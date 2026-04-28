import type { MyContext } from "../session.js";
import {
  actualizarColonia,
  crearOActualizarUsuario,
  obtenerUsuario,
} from "../repositories/usuariosRepo.js";
import { responderTexto } from "../services/claudeText.js";
import { handleReportarMensaje } from "./reportar.js";
import { handlePrediccionMensaje } from "./prediccion.js";
import { handleBorrarMensaje } from "./privacy.js";

const PALABRAS_COLONIA = [
  "vivo en",
  "soy de",
  "colonia",
  "vivo por",
  "estoy en la",
  "mi colonia",
];

function extraerColoniaDesdeTexto(texto: string): string | null {
  const limpio = texto.trim();
  const lower = limpio.toLowerCase();
  for (const clave of PALABRAS_COLONIA) {
    const idx = lower.indexOf(clave);
    if (idx !== -1) {
      const trozo = limpio.slice(idx + clave.length).trim();
      const sinPuntuacion = trozo.replace(/^[:,\s]+/, "").replace(/[.!?]+$/, "");
      if (sinPuntuacion.length >= 2 && sinPuntuacion.length <= 80) {
        return sinPuntuacion;
      }
    }
  }
  return null;
}

function pareceSoloColonia(texto: string): boolean {
  const t = texto.trim();
  return t.length >= 2 && t.length <= 60 && !/^[\/]/.test(t) && !/[.?!]$/.test(t);
}

export async function handleText(ctx: MyContext): Promise<void> {
  try {
    const texto = ctx.message?.text;
    const chatId = ctx.chat?.id;
    if (!texto || !chatId) return;

    const conv = ctx.session.conversation;

    if (conv.type === "reporte_tipo" || conv.type === "reporte_descripcion") {
      await handleReportarMensaje(ctx);
      return;
    }

    if (conv.type === "borrar_confirmacion") {
      await handleBorrarMensaje(ctx);
      return;
    }

    if (conv.type === "esperando_colonia_para_prediccion") {
      await handlePrediccionMensaje(ctx);
      return;
    }

    if (conv.type === "esperando_colonia_inicial") {
      const colonia = pareceSoloColonia(texto)
        ? texto.trim()
        : extraerColoniaDesdeTexto(texto);
      if (colonia) {
        await actualizarColonia(chatId, colonia);
        ctx.session.conversation = { type: "idle" };
        await ctx.reply(
          `✅ Listo, registré que vives en *${colonia}*. Si me equivoqué, vuelve a escribirme con "vivo en [colonia]".\n\nYa puedes usar /prediccion, /reportar o mandarme una foto del agua.`,
          { parse_mode: "Markdown" },
        );
        return;
      }
      await ctx.reply(
        "Solo necesito el nombre de la colonia. Escríbelo tal cual, por ejemplo: *Lomas de San Miguel*.",
        { parse_mode: "Markdown" },
      );
      return;
    }

    const coloniaDetectada = extraerColoniaDesdeTexto(texto);
    if (coloniaDetectada) {
      await actualizarColonia(chatId, coloniaDetectada);
      await ctx.reply(
        `📍 Anotado: ${coloniaDetectada}. Si te equivocaste, vuelve a escribirme.`,
      );
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
    await ctx
      .reply(
        "Tuve un problema procesando tu mensaje. Usa /ayuda para ver lo que sé hacer.",
      )
      .catch(() => {});
  }
}
