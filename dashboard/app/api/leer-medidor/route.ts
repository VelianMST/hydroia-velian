import { leerMedidorConIA, type MimeTypeImagen } from "@/lib/medidor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MIMES: MimeTypeImagen[] = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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

export async function POST(req: Request): Promise<Response> {
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
  if (limitado(ip)) {
    return Response.json({ ok: false, error: "Demasiadas lecturas seguidas. Espera un momento." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "Cuerpo inválido." }, { status: 400 });
  }

  let imagen = typeof body.imagen === "string" ? body.imagen : "";
  const mimeType = (typeof body.mimeType === "string" ? body.mimeType : "image/jpeg") as MimeTypeImagen;
  const coma = imagen.indexOf(",");
  if (imagen.startsWith("data:") && coma !== -1) imagen = imagen.slice(coma + 1);

  if (!imagen || imagen.length < 100) {
    return Response.json({ ok: false, error: "No recibí una imagen válida." }, { status: 400 });
  }
  if (!MIMES.includes(mimeType)) {
    return Response.json({ ok: false, error: "Formato de imagen no soportado." }, { status: 400 });
  }
  if (imagen.length > 6_500_000) {
    return Response.json({ ok: false, error: "La imagen es muy pesada. Tómala de nuevo." }, { status: 413 });
  }

  try {
    const r = await leerMedidorConIA(imagen, mimeType);
    return Response.json({ ok: true, ...r });
  } catch (err) {
    console.error("Error en POST /api/leer-medidor:", err);
    return Response.json({ ok: false, error: "No se pudo leer el medidor. Intenta de nuevo." }, { status: 500 });
  }
}
