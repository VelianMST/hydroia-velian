import { responderGota, type MensajeChat } from "@/lib/asistente";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Rate-limit best-effort (las llamadas a Claude cuestan).
const HITS = new Map<string, number[]>();
const VENTANA_MS = 10 * 60 * 1000;
const MAX = 20;
function limitado(ip: string): boolean {
  const ahora = Date.now();
  const prev = (HITS.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  if (prev.length >= MAX) {
    HITS.set(ip, prev);
    return true;
  }
  prev.push(ahora);
  HITS.set(ip, prev);
  return false;
}

const MAX_MENSAJES = 12;
const MAX_LARGO = 1500;

export async function POST(req: Request): Promise<Response> {
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
  if (limitado(ip)) {
    return Response.json(
      { ok: false, error: "Estás preguntando muy seguido. Espera un momento e intenta de nuevo." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "Cuerpo inválido." }, { status: 400 });
  }

  const crudo = Array.isArray(body.mensajes) ? body.mensajes : [];
  const mensajes: MensajeChat[] = crudo
    .filter(
      (m): m is MensajeChat =>
        !!m &&
        typeof m === "object" &&
        (((m as MensajeChat).role === "user") || ((m as MensajeChat).role === "assistant")) &&
        typeof (m as MensajeChat).content === "string",
    )
    .slice(-MAX_MENSAJES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_LARGO) }));

  if (mensajes.length === 0 || mensajes[mensajes.length - 1].role !== "user") {
    return Response.json({ ok: false, error: "Escribe tu pregunta." }, { status: 400 });
  }

  try {
    const respuesta = await responderGota(mensajes);
    return Response.json({ ok: true, respuesta });
  } catch (err) {
    console.error("Error en POST /api/asistente:", err);
    return Response.json(
      { ok: false, error: "No pude responder ahora. Intenta de nuevo en un momento." },
      { status: 500 },
    );
  }
}
