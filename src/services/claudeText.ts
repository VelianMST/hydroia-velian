import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";

const client = new Anthropic({ apiKey: config.anthropicApiKey, maxRetries: 3 });
const MODEL = "claude-sonnet-4-5";

const SYSTEM_PROMPT = `Eres HydroIA Velian, un asistente conversacional ciudadano sobre la crisis del agua en el Valle de México (CDMX y Estado de México).

Tu tono: español de México, cercano, respetuoso. Tutea al usuario.
Tu alcance: tandeos, calidad del agua doméstica, reportes ciudadanos de fugas, ahorro de agua, contexto del ODS 6 de la ONU.
Tu límite: si te preguntan algo fuera de agua, responde brevemente que solo puedes ayudar con temas de agua y sugiere /ayuda.

Reglas:
- Mensajes cortos, máximo 4 oraciones.
- Usa máximo 1 emoji por respuesta (💧 🚰 ⚠️ ✅ 📍).
- No inventes datos científicos. Si no sabes algo, dilo y sugiere consultar a la autoridad local (Conagua, Sacmex u organismo operador municipal).
- Recuérdale al usuario los comandos disponibles cuando sea natural: /reportar, /prediccion, /borrar, /ayuda.`;

export async function responderTexto(mensajeUsuario: string): Promise<string> {
  const respuesta = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    temperature: 0.5,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: mensajeUsuario }],
  });

  const bloque = respuesta.content.find((b) => b.type === "text");
  if (!bloque || bloque.type !== "text") {
    return "No pude generar una respuesta. Prueba con /ayuda para ver lo que sé hacer.";
  }
  return bloque.text.trim();
}
