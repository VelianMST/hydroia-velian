import Anthropic from "@anthropic-ai/sdk";

/**
 * Coach de ahorro de agua: recibe el RESUMEN del consumo real del usuario
 * (calculado de sus lecturas del medidor) y genera recomendaciones
 * PERSONALIZADAS y priorizadas con Claude. Stateless (no guarda nada).
 */

const MODEL = "claude-sonnet-4-5";

export interface ResumenConsumo {
  promedioLitrosDia: number;
  ultimoLitrosDia: number;
  personas: number | null;
  litrosPorPersona: number | null;
  tendencia: "subiendo" | "bajando" | "estable";
  anomalia: boolean;
  numLecturas: number;
}

const SYSTEM_PROMPT = `Eres un coach de ahorro de agua de HydroIA Velian. Recibes el RESUMEN del consumo REAL de una familia (medido con su medidor) y das recomendaciones PERSONALIZADAS para optimizar su uso de agua. Apóyate en los números que te dan.

Conocimiento base:
- Promedio nacional ≈ 250 litros por persona al día. Por encima de eso hay margen de ahorro.
- Los mayores consumos en casa: regadera/baño, WC, lavadora y riego.
- Una llave goteando tira ~30 L/día; un WC que "corre" hasta 200 L/día.
- Acciones de alto impacto: baño de menos de 5 min, cerrar la llave al enjabonarse, lavadora a carga
  completa, reutilizar aguas grises (lavadora/regadera) para WC y riego, recoger el agua fría de la
  regadera, regar temprano/de noche, cosechar agua de lluvia.

Reglas:
- Da de 3 a 4 consejos CONCRETOS y PRIORIZADOS (del de mayor ahorro al menor).
- Cuando puedas, estima cuántos litros ahorraría cada acción.
- Si hay anomalía/posible fuga, el PRIMER consejo es revisar fugas (llaves, WC, tinaco).
- Si su consumo por persona ya es bajo (≤150 L), felicítalo y da 1-2 tips finos.
- Tono cálido, motivador y claro; español de México; tutea.
- TEXTO PLANO, sin markdown (nada de # ni **). Usa guiones (-) para la lista.
- Eres orientación con base en sus datos, no una factura ni un peritaje. No inventes cifras del usuario.`;

let cliente: Anthropic | null = null;
function getClient(): Anthropic {
  if (cliente) return cliente;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Falta ANTHROPIC_API_KEY (variable solo de servidor).");
  cliente = new Anthropic({ apiKey, maxRetries: 2 });
  return cliente;
}

export async function generarConsejos(r: ResumenConsumo): Promise<string> {
  const partes = [
    `Consumo promedio: ${r.promedioLitrosDia} litros al día (de toda la casa).`,
    `Consumo más reciente: ${r.ultimoLitrosDia} litros al día.`,
    r.personas ? `Personas en casa: ${r.personas}.` : "Personas en casa: no indicado.",
    r.litrosPorPersona != null
      ? `Eso da ~${r.litrosPorPersona} litros por persona al día (promedio nacional ≈ 250).`
      : "",
    `Tendencia reciente: ${r.tendencia}.`,
    r.anomalia ? "ALERTA: el consumo subió de golpe (posible fuga)." : "",
    `Lecturas registradas: ${r.numLecturas}.`,
  ].filter(Boolean).join("\n");

  const respuesta = await getClient().messages.create({
    model: MODEL,
    max_tokens: 600,
    temperature: 0.4,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: `Este es el resumen de mi consumo de agua:\n${partes}\n\nDame recomendaciones personalizadas para ahorrar agua.`,
      },
    ],
  });
  const bloque = respuesta.content.find((b) => b.type === "text");
  return bloque && bloque.type === "text"
    ? bloque.text.trim()
    : "No pude generar recomendaciones ahora. Intenta de nuevo.";
}
