import { getAdminClient } from "@/lib/supabaseAdmin";
import { nombreBonito } from "@/lib/geo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HITS = new Map<string, number[]>();
function limitado(ip: string): boolean {
  const ahora = Date.now();
  const prev = (HITS.get(ip) ?? []).filter((t) => ahora - t < 10 * 60 * 1000);
  if (prev.length >= 6) {
    HITS.set(ip, prev);
    return true;
  }
  prev.push(ahora);
  HITS.set(ip, prev);
  return false;
}

function texto(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request): Promise<Response> {
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
  if (limitado(ip)) {
    return Response.json({ ok: false, error: "Publicaste muchos avisos seguidos. Espera un momento." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "Cuerpo inválido." }, { status: 400 });
  }

  const tipo = texto(body.tipo, 10);
  const mensaje = texto(body.mensaje, 300);
  const colonia = texto(body.colonia, 80);
  const municipio = texto(body.municipio, 80);
  const contacto = texto(body.contacto, 40);

  if (tipo !== "necesito" && tipo !== "ofrezco") {
    return Response.json({ ok: false, error: "Tipo inválido." }, { status: 400 });
  }
  if (mensaje.length < 5) {
    return Response.json({ ok: false, error: "Escribe un mensaje (al menos unas palabras)." }, { status: 400 });
  }
  if (colonia.length < 2) {
    return Response.json({ ok: false, error: "Indica tu colonia." }, { status: 400 });
  }

  try {
    const { error } = await getAdminClient().from("ayuda_mutua").insert({
      tipo,
      mensaje,
      colonia: nombreBonito(colonia),
      municipio: municipio ? nombreBonito(municipio) : null,
      contacto: contacto || null,
    });
    if (error) {
      console.error("Error guardando ayuda_mutua:", error);
      return Response.json({ ok: false, error: "No se pudo publicar." }, { status: 500 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Error en POST /api/ayuda:", err);
    return Response.json({ ok: false, error: "Error interno." }, { status: 500 });
  }
}
