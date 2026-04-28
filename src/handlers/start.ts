import type { MyContext } from "../session.js";
import { crearOActualizarUsuario } from "../repositories/usuariosRepo.js";

const WELCOME_MESSAGE = `¡Hola! 💧 Soy *HydroIA Velian*, tu asistente ciudadano frente a la crisis hídrica del Valle de México.

Te puedo ayudar con tres cosas:

🚰 *Predicción de tandeos* — te aviso cuándo podría irse el agua en tu colonia.
💧 *Diagnóstico de calidad del agua* — mándame una foto y te digo qué veo.
⚠️ *Reporte de fugas* — recopilamos reportes ciudadanos para visibilizarlos.

Este proyecto está alineado con el *ODS 6* de la ONU: agua limpia y saneamiento para todas las personas.

*Privacidad*
Para proteger tus datos: solo guardo tu colonia (no tu dirección exacta), no comparto info personal y puedes pedirme que borre todo con /borrar.

📍 ¿En qué colonia vives? Solo necesito el nombre de la colonia, no la dirección exacta.`;

export async function handleStart(ctx: MyContext): Promise<void> {
  try {
    const chatId = ctx.chat?.id;
    if (chatId) {
      await crearOActualizarUsuario(chatId, { consentimiento: false });
    }
    ctx.session.conversation = { type: "esperando_colonia_inicial" };
    await ctx.reply(WELCOME_MESSAGE, { parse_mode: "Markdown" });
  } catch (err) {
    console.error("Error en /start:", err);
    await ctx
      .reply("Tuve un problema al iniciar. Intenta de nuevo en un momento.")
      .catch(() => {});
  }
}
