import type { Context, SessionFlavor } from "grammy";
import type { TipoReporte } from "./services/supabase.js";

export type Conversation =
  | { type: "idle" }
  | { type: "esperando_colonia_inicial" }
  | { type: "esperando_colonia_para_prediccion" }
  | { type: "reporte_tipo" }
  | { type: "reporte_descripcion"; tipoReporte: TipoReporte }
  | { type: "reporte_ubicacion"; tipoReporte: TipoReporte; descripcion: string }
  | { type: "borrar_confirmacion" };

export interface SessionData {
  conversation: Conversation;
}

export type MyContext = Context & SessionFlavor<SessionData>;

export function initialSession(): SessionData {
  return { conversation: { type: "idle" } };
}
