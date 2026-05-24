import Anthropic from "@anthropic-ai/sdk";

/**
 * Lectura del medidor de agua con Claude Vision (OCR). Lee el total en m³ del
 * medidor doméstico. No guarda nada: el historial vive en el navegador del
 * usuario (privado). Funciona con medidor normal, sin sensores caros.
 */

const MODEL = "claude-sonnet-4-5";

export type MimeTypeImagen = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

export interface LecturaMedidor {
  leido: boolean;
  lectura: number | null; // total en m³
  nota: string;
}

const SYSTEM_PROMPT = `Eres un sistema de lectura de medidores de agua domésticos (México). Lees la fotografía de un medidor y devuelves la lectura TOTAL acumulada en metros cúbicos (m³).

Cómo leer:
- En medidores de rodillos (odómetro), los dígitos NEGROS o blancos sobre fondo negro son los m³ (enteros). Los dígitos o carátulas ROJAS son litros/decimales: ignóralos para el total en m³ (puedes incluirlos como decimal solo si es muy claro).
- Lee todos los dígitos enteros de izquierda a derecha como un solo número.
- Si la foto está borrosa, cortada, no muestra un medidor, o no puedes leer los dígitos con seguridad, leido=false y lectura=null.

No inventes. Si dudas, leido=false.

Formato OBLIGATORIO: SOLO un JSON válido, sin texto ni markdown alrededor:
{ "leido": boolean, "lectura": number|null, "nota": string }
- "nota": 1 frase corta (qué leíste o por qué no se pudo), en español de México.`;

const USER_PROMPT = `Lee este medidor de agua y devuelve únicamente el JSON con la lectura total en m³.`;

let cliente: Anthropic | null = null;
function getClient(): Anthropic {
  if (cliente) return cliente;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Falta ANTHROPIC_API_KEY (variable solo de servidor).");
  cliente = new Anthropic({ apiKey, maxRetries: 2 });
  return cliente;
}

function extraerJson(texto: string): unknown {
  const limpio = texto.trim();
  try {
    return JSON.parse(limpio);
  } catch {
    const i = limpio.indexOf("{");
    const f = limpio.lastIndexOf("}");
    if (i !== -1 && f !== -1 && f > i) return JSON.parse(limpio.slice(i, f + 1));
    throw new Error("Respuesta sin JSON válido.");
  }
}

export async function leerMedidorConIA(
  imagenBase64: string,
  mimeType: MimeTypeImagen,
): Promise<LecturaMedidor> {
  const respuesta = await getClient().messages.create({
    model: MODEL,
    max_tokens: 300,
    temperature: 0.1,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mimeType, data: imagenBase64 } },
          { type: "text", text: USER_PROMPT },
        ],
      },
    ],
  });
  const bloque = respuesta.content.find((b) => b.type === "text");
  if (!bloque || bloque.type !== "text") {
    return { leido: false, lectura: null, nota: "No se pudo procesar la imagen." };
  }
  const raw = extraerJson(bloque.text) as Record<string, unknown>;
  const lectura = typeof raw.lectura === "number" && Number.isFinite(raw.lectura) ? raw.lectura : null;
  return {
    leido: Boolean(raw.leido) && lectura != null,
    lectura,
    nota: typeof raw.nota === "string" ? raw.nota : "",
  };
}
