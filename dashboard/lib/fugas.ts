import Anthropic from "@anthropic-ai/sdk";

/**
 * Cerebro del reporte de fugas: Claude Vision clasifica la severidad de la fuga
 * desde la foto, y mapeamos severidad → litros/día desperdiciados con rangos
 * documentados (1 gota/seg ≈ 30 L/día; chorro fino 250-350; medio 700-1000;
 * grueso/brote 1300-4500 L/día). Es ESTIMACIÓN, se comunica como tal.
 */

const MODEL = "claude-sonnet-4-5";

export type Severidad = "goteo" | "chorro" | "chorro_fuerte" | "brote" | "indeterminada";

export interface SeveridadInfo {
  id: Severidad;
  etiqueta: string;
  descripcion: string;
  litros_dia: number; // estimación puntual para mostrar
}

export const SEVERIDADES: Record<Severidad, SeveridadInfo> = {
  goteo: { id: "goteo", etiqueta: "Goteo o humedad", descripcion: "Gotea o escurre poco a poco", litros_dia: 30 },
  chorro: { id: "chorro", etiqueta: "Chorro pequeño", descripcion: "Sale un chorrito constante", litros_dia: 300 },
  chorro_fuerte: { id: "chorro_fuerte", etiqueta: "Chorro fuerte o encharcamiento", descripcion: "Sale con fuerza o ya hay charco", litros_dia: 850 },
  brote: { id: "brote", etiqueta: "Brote mayor o inundación", descripcion: "Brota mucha agua / inunda la calle", litros_dia: 3000 },
  indeterminada: { id: "indeterminada", etiqueta: "Sin determinar", descripcion: "No se pudo estimar el tamaño", litros_dia: 0 },
};

export function infoSeveridad(s: string): SeveridadInfo {
  return SEVERIDADES[(s as Severidad)] ?? SEVERIDADES.indeterminada;
}

export type MimeTypeImagen = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

export interface AnalisisFuga {
  es_fuga: boolean;
  severidad: Severidad;
  descripcion: string; // 1 frase de lo que se ve, para prellenar el reporte
}

const SYSTEM_PROMPT = `Eres un perito que analiza fotos de posibles FUGAS de agua en la vía pública o domicilios del Valle de México, para un reporte ciudadano que se enviará a la autoridad del agua.

Tu trabajo: con base SOLO en lo visible, decir si la foto muestra una fuga de agua y estimar su magnitud.

Niveles de severidad (elige el más cercano):
- "goteo": gotea o escurre poco a poco; humedad, mancha húmeda.
- "chorro": sale un chorrito constante pero delgado.
- "chorro_fuerte": el agua sale con fuerza, o ya hay encharcamiento/charco notable.
- "brote": brota mucha agua, inunda la calle, géiser, tubería rota mayor.
- "indeterminada": no se distingue agua/fuga, o la foto no permite juzgar.

Reglas:
- Solo te basas en lo VISIBLE. No inventes.
- Si no hay agua o fuga clara, es_fuga=false y severidad "indeterminada".
- La descripción: 1 sola oración, clara y útil para la autoridad (qué y dónde se ve), en español de México.

Formato de salida OBLIGATORIO: SOLO un objeto JSON válido, sin texto ni markdown alrededor:
{ "es_fuga": boolean, "severidad": "goteo"|"chorro"|"chorro_fuerte"|"brote"|"indeterminada", "descripcion": string }`;

const USER_PROMPT = `Analiza esta foto de una posible fuga de agua y devuelve únicamente el JSON.`;

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
    throw new Error("Respuesta de Claude sin JSON válido.");
  }
}

export async function analizarFugaConIA(
  imagenBase64: string,
  mimeType: MimeTypeImagen,
): Promise<AnalisisFuga> {
  const respuesta = await getClient().messages.create({
    model: MODEL,
    max_tokens: 400,
    temperature: 0.2,
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
    return { es_fuga: false, severidad: "indeterminada", descripcion: "No se pudo analizar la foto." };
  }
  const raw = extraerJson(bloque.text) as Record<string, unknown>;
  const sevValidas: Severidad[] = ["goteo", "chorro", "chorro_fuerte", "brote", "indeterminada"];
  const severidad = sevValidas.includes(raw.severidad as Severidad)
    ? (raw.severidad as Severidad)
    : "indeterminada";
  return {
    es_fuga: Boolean(raw.es_fuga),
    severidad,
    descripcion:
      typeof raw.descripcion === "string" && raw.descripcion.trim()
        ? raw.descripcion.trim()
        : "Posible fuga de agua reportada por la ciudadanía.",
  };
}
