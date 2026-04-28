import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";

const client = new Anthropic({ apiKey: config.anthropicApiKey });

const MODEL = "claude-sonnet-4-5";

export type NivelRiesgo = "bajo" | "medio" | "alto" | "indeterminado";
export type Turbidez =
  | "clara"
  | "ligeramente turbia"
  | "turbia"
  | "muy turbia"
  | "indeterminada";

export interface DiagnosticoAgua {
  nivel_riesgo: NivelRiesgo;
  color_observado: string;
  turbidez_aparente: Turbidez;
  sedimentos_visibles: boolean;
  diagnostico: string;
  recomendacion: string;
  advertencia: string | null;
}

export type MimeTypeImagen = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

const SYSTEM_PROMPT = `Eres un experto en calidad del agua doméstica del Valle de México (CDMX y Estado de México). Tu trabajo es analizar fotografías de agua que sale de tinacos, llaves, cisternas o tomas domiciliarias y emitir un diagnóstico preliminar de tamizaje visual.

Conoces los problemas típicos del Valle de México: tandeos, agua amarillenta o café por óxido en tuberías, sedimentos de tinaco mal lavado, turbidez por azolve, olor o color asociado a contaminación cruzada con drenaje, y posibles indicios de presencia de hierro, manganeso, materia orgánica o sólidos suspendidos.

Reglas de tu análisis:
- Solo dictaminas con base en lo VISIBLE en la foto. No inventes datos químicos ni microbiológicos.
- Eres cauteloso: ante la duda, sube el nivel de riesgo, no lo bajes.
- Hablas en español de México, tono cercano, claro, sin tecnicismos innecesarios.
- Tuteas al usuario.
- NUNCA recomiendas beber el agua si no es totalmente clara.
- Si la foto está borrosa, demasiado oscura, no muestra agua, o no permite juzgar, devuelves nivel_riesgo "indeterminado".

Formato de salida OBLIGATORIO: SOLO un objeto JSON válido, sin texto antes ni después, sin bloques de código markdown, sin comentarios. Esquema exacto:
{
  "nivel_riesgo": "bajo" | "medio" | "alto" | "indeterminado",
  "color_observado": string,
  "turbidez_aparente": "clara" | "ligeramente turbia" | "turbia" | "muy turbia" | "indeterminada",
  "sedimentos_visibles": boolean,
  "diagnostico": string,
  "recomendacion": string,
  "advertencia": string | null
}

- "diagnostico": 1 a 2 oraciones explicando qué se observa.
- "recomendacion": 1 a 2 oraciones con acciones concretas para el usuario.
- "advertencia": si nivel_riesgo es "alto", una advertencia clara y directa; en cualquier otro caso, null.`;

const USER_PROMPT = `Analiza esta foto de agua doméstica del Valle de México y devuelve únicamente el JSON con tu diagnóstico, siguiendo el esquema indicado.`;

function extraerJson(texto: string): unknown {
  const limpio = texto.trim();
  try {
    return JSON.parse(limpio);
  } catch {
    const inicio = limpio.indexOf("{");
    const fin = limpio.lastIndexOf("}");
    if (inicio !== -1 && fin !== -1 && fin > inicio) {
      const fragmento = limpio.slice(inicio, fin + 1);
      return JSON.parse(fragmento);
    }
    throw new Error("La respuesta de Claude no contiene un JSON válido.");
  }
}

function normalizarDiagnostico(raw: unknown): DiagnosticoAgua {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Respuesta de Claude no es un objeto.");
  }
  const r = raw as Record<string, unknown>;

  const nivelesValidos: NivelRiesgo[] = ["bajo", "medio", "alto", "indeterminado"];
  const turbidezValida: Turbidez[] = [
    "clara",
    "ligeramente turbia",
    "turbia",
    "muy turbia",
    "indeterminada",
  ];

  const nivel_riesgo = nivelesValidos.includes(r.nivel_riesgo as NivelRiesgo)
    ? (r.nivel_riesgo as NivelRiesgo)
    : "indeterminado";

  const turbidez_aparente = turbidezValida.includes(r.turbidez_aparente as Turbidez)
    ? (r.turbidez_aparente as Turbidez)
    : "indeterminada";

  return {
    nivel_riesgo,
    color_observado: typeof r.color_observado === "string" ? r.color_observado : "no determinado",
    turbidez_aparente,
    sedimentos_visibles: Boolean(r.sedimentos_visibles),
    diagnostico:
      typeof r.diagnostico === "string"
        ? r.diagnostico
        : "No fue posible generar un diagnóstico claro.",
    recomendacion:
      typeof r.recomendacion === "string"
        ? r.recomendacion
        : "Manda otra foto con mejor iluminación, por favor.",
    advertencia:
      typeof r.advertencia === "string" && r.advertencia.trim() !== "" ? r.advertencia : null,
  };
}

export async function analizarAguaConIA(
  imagenBase64: string,
  mimeType: MimeTypeImagen,
): Promise<DiagnosticoAgua> {
  const respuesta = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    temperature: 0.3,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType,
              data: imagenBase64,
            },
          },
          {
            type: "text",
            text: USER_PROMPT,
          },
        ],
      },
    ],
  });

  const bloqueTexto = respuesta.content.find((b) => b.type === "text");
  if (!bloqueTexto || bloqueTexto.type !== "text") {
    throw new Error("Claude no devolvió contenido de texto.");
  }

  const json = extraerJson(bloqueTexto.text);
  return normalizarDiagnostico(json);
}
