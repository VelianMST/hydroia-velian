import { getAdminClient } from "@/lib/supabaseAdmin";
import { geocodificarApp } from "@/lib/geocode";
import { normalizarNombre, nombreBonito } from "@/lib/geo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIPOS = ["fuga", "tandeo", "mala_calidad"] as const;
type Tipo = (typeof TIPOS)[number];

// Rate-limit best-effort en memoria (se reinicia en cada cold start del
// servidor, suficiente para frenar spam casual en la demo).
const HITS = new Map<string, number[]>();
const VENTANA_MS = 10 * 60 * 1000;
const MAX_POR_VENTANA = 6;

function limitado(ip: string): boolean {
  const ahora = Date.now();
  const previos = (HITS.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  if (previos.length >= MAX_POR_VENTANA) {
    HITS.set(ip, previos);
    return true;
  }
  previos.push(ahora);
  HITS.set(ip, previos);
  return false;
}

function texto(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request): Promise<Response> {
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
  if (limitado(ip)) {
    return Response.json(
      { ok: false, error: "Demasiados reportes seguidos. Intenta de nuevo en unos minutos." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "Cuerpo inválido." }, { status: 400 });
  }

  const tipo = texto(body.tipo, 20) as Tipo;
  const descripcion = texto(body.descripcion, 500);
  const colonia = texto(body.colonia, 80);
  const municipio = texto(body.municipio, 80);
  const estado = texto(body.estado, 40) || "México";

  if (!TIPOS.includes(tipo)) {
    return Response.json({ ok: false, error: "Tipo de reporte inválido." }, { status: 400 });
  }
  if (descripcion.length < 5) {
    return Response.json(
      { ok: false, error: "Describe brevemente qué pasa (al menos unas palabras)." },
      { status: 400 },
    );
  }
  if (colonia.length < 2) {
    return Response.json(
      { ok: false, error: "Necesito tu colonia para ubicar el reporte en el mapa." },
      { status: 400 },
    );
  }
  if (municipio.length < 2) {
    return Response.json(
      { ok: false, error: "Necesito tu municipio o alcaldía." },
      { status: 400 },
    );
  }

  try {
    const geo = await geocodificarApp(colonia, municipio, estado);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("reportes")
      .insert({
        usuario_id: null, // reporte anónimo desde la app (más privado que el bot)
        tipo,
        descripcion,
        colonia: nombreBonito(colonia),
        colonia_norm: normalizarNombre(colonia),
        municipio: nombreBonito(municipio),
        estado_geo: estado,
        lat: geo.lat,
        lng: geo.lng,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error guardando reporte (app):", error);
      return Response.json(
        { ok: false, error: "No se pudo guardar tu reporte. Intenta de nuevo." },
        { status: 500 },
      );
    }

    return Response.json({ ok: true, id: data?.id, fuente: geo.fuente });
  } catch (err) {
    console.error("Error en POST /api/reportar:", err);
    return Response.json({ ok: false, error: "Error interno." }, { status: 500 });
  }
}
