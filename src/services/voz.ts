import OpenAI, { toFile } from "openai";
import { config } from "../config.js";

/**
 * Voz: transcripción (STT, Whisper/gpt-4o-transcribe) y síntesis (TTS,
 * gpt-4o-mini-tts) con OpenAI. Diseño NO frágil: si no hay API key o algo
 * falla, devuelve null y el bot sigue funcionando (pide que escriban).
 */

const client = config.openaiApiKey
  ? new OpenAI({ apiKey: config.openaiApiKey, timeout: 30000, maxRetries: 2 })
  : null;

export function vozDisponible(): boolean {
  return client !== null;
}

const MODELO_STT = "gpt-4o-transcribe"; // máxima precisión
const MODELO_TTS = "gpt-4o-mini-tts";
const VOZ = "nova"; // voz natural en español
const MAX_TTS_CHARS = 650;

/** Transcribe una nota de voz (OGG/Opus de Telegram) a texto en español. */
export async function transcribir(
  audio: Buffer,
  nombre = "voz.ogg",
): Promise<string | null> {
  if (!client) return null;
  try {
    const archivo = await toFile(audio, nombre);
    const r = await client.audio.transcriptions.create({
      file: archivo,
      model: MODELO_STT,
      language: "es",
    });
    const texto = (r.text ?? "").trim();
    return texto.length > 0 ? texto : null;
  } catch (err) {
    console.error("Transcripción de voz falló:", err);
    return null;
  }
}

function limpiarParaVoz(texto: string): string {
  return texto
    .replace(/[*_`#]/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/https?:\/\/\S+/g, "")
    .trim()
    .slice(0, MAX_TTS_CHARS);
}

/** Sintetiza texto a voz (Ogg/Opus, listo para Telegram sendVoice). */
export async function sintetizar(texto: string): Promise<Buffer | null> {
  if (!client) return null;
  const limpio = limpiarParaVoz(texto);
  if (!limpio) return null;
  try {
    const r = await client.audio.speech.create({
      model: MODELO_TTS,
      voice: VOZ,
      input: limpio,
      response_format: "opus",
      instructions:
        "Habla en español de México, tono cercano, claro y tranquilo, como un asistente ciudadano del agua.",
    });
    const ab = await r.arrayBuffer();
    return Buffer.from(ab);
  } catch (err) {
    console.error("Síntesis de voz falló:", err);
    return null;
  }
}
