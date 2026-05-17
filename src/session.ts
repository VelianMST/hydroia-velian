import type { Context, SessionFlavor } from "grammy";
import type { TipoReporte } from "./services/supabase.js";

export type FlujoUbicacion = "inicial" | "prediccion" | "reporte";

export type Conversation =
  | { type: "idle" }
  | { type: "esperando_colonia"; flujo: FlujoUbicacion }
  | { type: "esperando_municipio"; colonia: string; flujo: FlujoUbicacion }
  | { type: "reporte_tipo" }
  | { type: "reporte_descripcion"; tipoReporte: TipoReporte }
  | { type: "reporte_ubicacion"; tipoReporte: TipoReporte; descripcion: string }
  | { type: "borrar_confirmacion" };

export interface SessionData {
  conversation: Conversation;
}

/**
 * `vozTexto`: cuando un mensaje llega como nota de voz, el handler de voz lo
 * transcribe y guarda aquí el texto, para que TODO el ruteo (colonia,
 * municipio, /reportar, preguntas) funcione igual que con texto escrito.
 * `vozRespuesta`: indica que el usuario interactuó por voz, así las
 * respuestas clave también se contestan habladas (TTS).
 */
export type MyContext = Context &
  SessionFlavor<SessionData> & {
    vozTexto?: string;
    vozRespuesta?: boolean;
  };

export function initialSession(): SessionData {
  return { conversation: { type: "idle" } };
}

/** Texto efectivo del mensaje: transcripción de voz si la hay, si no el texto. */
export function obtenerTexto(ctx: MyContext): string {
  return (ctx.vozTexto ?? ctx.message?.text ?? "").trim();
}

