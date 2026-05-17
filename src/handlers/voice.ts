import type { MyContext } from "../session.js";
import { transcribir, vozDisponible } from "../services/voz.js";
import { enrutarTexto } from "./enrutador.js";
import { aleatorio, RESPUESTAS_NO_ENTENDIDAS } from "../utils/messages.js";

const MAX_BYTES = 20 * 1024 * 1024; // notas de voz: muy por debajo de esto

/**
 * Maneja notas de voz y audios: descarga el archivo de Telegram, lo
 * transcribe con Whisper y lo enruta EXACTAMENTE igual que un mensaje de
 * texto (colonia, municipio, /reportar, preguntas...). Marca vozRespuesta
 * para que las respuestas conversacionales también se contesten habladas.
 * No frágil: si la voz no está disponible o la transcripción falla, pide
 * que lo escriban.
 */
export async function handleVoice(ctx: MyContext): Promise<void> {
  const voice = ctx.message?.voice ?? ctx.message?.audio;
  if (!voice) return;

  if (!vozDisponible()) {
    await ctx
      .reply(
        "🎤 Por ahora no puedo procesar notas de voz. ¿Me lo escribes, por favor?",
      )
      .catch(() => {});
    return;
  }

  const aviso = await ctx.reply("🎧 Escuchando tu mensaje...");

  try {
    if (voice.file_size && voice.file_size > MAX_BYTES) {
      throw new Error("audio demasiado grande");
    }
    const file = await ctx.api.getFile(voice.file_id);
    if (!file.file_path) throw new Error("Telegram no dio la ruta del audio");

    const url = `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`descarga HTTP ${resp.status}`);
    const buffer = Buffer.from(await resp.arrayBuffer());

    const ext = file.file_path.split(".").pop()?.toLowerCase() || "ogg";
    const texto = await transcribir(buffer, `voz.${ext}`);

    if (!texto) {
      await ctx.reply(
        "No alcancé a entender el audio 😅. ¿Puedes repetirlo más claro o escribirlo?",
      );
      return;
    }

    // Eco de lo entendido (transparencia) + ruteo como si fuera texto + voz
    await ctx.reply(`🎤 Entendí: “${texto}”`);
    ctx.vozTexto = texto;
    ctx.vozRespuesta = true;
    await enrutarTexto(ctx);
  } catch (err) {
    console.error("Error procesando nota de voz:", err);
    await ctx.reply(aleatorio(RESPUESTAS_NO_ENTENDIDAS)).catch(() => {});
  } finally {
    try {
      await ctx.api.deleteMessage(aviso.chat.id, aviso.message_id);
    } catch {
      /* no crítico */
    }
  }
}
