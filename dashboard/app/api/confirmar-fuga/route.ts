import { getAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HITS = new Map<string, number[]>();
function limitado(ip: string): boolean {
  const ahora = Date.now();
  const prev = (HITS.get(ip) ?? []).filter((t) => ahora - t < 60 * 1000);
  if (prev.length >= 20) {
    HITS.set(ip, prev);
    return true;
  }
  prev.push(ahora);
  HITS.set(ip, prev);
  return false;
}

export async function POST(req: Request): Promise<Response> {
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
  if (limitado(ip)) {
    return Response.json({ ok: false, error: "Espera un momento." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "Cuerpo inválido." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const campo = body.tipo === "reparada" ? "reparada" : body.tipo === "sigue" ? "sigue" : "";
  if (!id || !campo) {
    return Response.json({ ok: false, error: "Datos inválidos." }, { status: 400 });
  }

  try {
    const { error } = await getAdminClient().rpc("incrementar_confirmacion", {
      p_id: id,
      p_campo: campo,
    });
    if (error) {
      console.error("Error en confirmar-fuga:", error);
      return Response.json({ ok: false, error: "No se pudo registrar." }, { status: 500 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Error en POST /api/confirmar-fuga:", err);
    return Response.json({ ok: false, error: "Error interno." }, { status: 500 });
  }
}
