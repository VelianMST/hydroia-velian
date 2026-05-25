import { generarConsejos, type ResumenConsumo } from "@/lib/medidorConsejos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const HITS = new Map<string, number[]>();
function limitado(ip: string): boolean {
  const ahora = Date.now();
  const prev = (HITS.get(ip) ?? []).filter((t) => ahora - t < 10 * 60 * 1000);
  if (prev.length >= 15) {
    HITS.set(ip, prev);
    return true;
  }
  prev.push(ahora);
  HITS.set(ip, prev);
  return false;
}

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

export async function POST(req: Request): Promise<Response> {
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
  if (limitado(ip)) {
    return Response.json({ ok: false, error: "Espera un momento e intenta de nuevo." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "Cuerpo inválido." }, { status: 400 });
  }

  const tend = body.tendencia;
  const resumen: ResumenConsumo = {
    promedioLitrosDia: Math.round(num(body.promedioLitrosDia)),
    ultimoLitrosDia: Math.round(num(body.ultimoLitrosDia)),
    personas: typeof body.personas === "number" && body.personas > 0 ? Math.round(body.personas) : null,
    litrosPorPersona:
      typeof body.litrosPorPersona === "number" && body.litrosPorPersona > 0
        ? Math.round(body.litrosPorPersona)
        : null,
    tendencia: tend === "subiendo" || tend === "bajando" ? tend : "estable",
    anomalia: Boolean(body.anomalia),
    numLecturas: Math.max(1, Math.round(num(body.numLecturas))),
  };

  if (resumen.promedioLitrosDia <= 0) {
    return Response.json(
      { ok: false, error: "Necesito al menos 2 lecturas para darte consejos sobre tu consumo." },
      { status: 400 },
    );
  }

  try {
    const consejos = await generarConsejos(resumen);
    return Response.json({ ok: true, consejos });
  } catch (err) {
    console.error("Error en POST /api/medidor-consejos:", err);
    return Response.json({ ok: false, error: "No pude generar recomendaciones. Intenta de nuevo." }, { status: 500 });
  }
}
