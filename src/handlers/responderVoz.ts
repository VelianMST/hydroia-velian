import { InputFile } from "grammy";
import type { MyContext } from "../session.js";
import { sintetizar } from "../services/voz.js";

/**
 * Si el usuario interactuó por voz (ctx.vozRespuesta), además del texto el
 * bot contesta con una nota de voz (TTS). No frágil: si la síntesis falla,
 * simplemente no manda audio (el texto ya se envió).
 */
export async function enviarVoz(ctx: MyContext, texto: string): Promise<void> {
  if (!ctx.vozRespuesta) return;
  try {
    const buf = await sintetizar(texto);
    if (buf) {
      await ctx.replyWithVoice(new InputFile(buf, "hydroia.ogg"));
    }
  } catch (err) {
    console.error("No se pudo enviar la respuesta en voz:", err);
  }
}
