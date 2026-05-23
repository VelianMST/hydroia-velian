import { analizarAguaConIA, type MimeTypeImagen } from "@/lib/vision";
import { getAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MIMES: MimeTypeImagen[] = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Rate-limit best-effort: las llamadas a Claude Vision cuestan, frenamos abuso.
const HITS = new Map<string, number[]>();
const VENTANA_MS = 10 * 60 * 1000;
const MAX = 8;
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

export async function POST(req: Request): Promise<Response> {
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
  if (limitado(ip)) {
    return Response.json(
      { ok: false, error: "Demasiadas fotos seguidas. Intenta de nuevo en unos minutos." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "Cuerpo inválido." }, { status: 400 });
  }

  let imagen = typeof body.imagen === "string" ? body.imagen : "";
  const mimeType = (typeof body.mimeType === "string" ? body.mimeType : "") as MimeTypeImagen;

  // Acepta tanto base64 puro como data URL (data:image/...;base64,XXXX)
  const coma = imagen.indexOf(",");
  if (imagen.startsWith("data:") && coma !== -1) imagen = imagen.slice(coma + 1);

  if (!imagen || imagen.length < 100) {
    return Response.json({ ok: false, error: "No recibí una imagen válida." }, { status: 400 });
  }
  if (!MIMES.includes(mimeType)) {
    return Response.json(
      { ok: false, error: "Formato no soportado (usa JPG, PNG, WEBP o GIF)." },
      { status: 400 },
    );
  }
  // ~6.5 MB en base64 (≈ 4.8 MB de imagen). El cliente ya la reduce antes.
  if (imagen.length > 6_500_000) {
    return Response.json(
      { ok: false, error: "La imagen es muy pesada. Toma la foto de nuevo." },
      { status: 413 },
    );
  }

  try {
    const diag = await analizarAguaConIA(imagen, mimeType);

    // Guardado best-effort para que cuente en el KPI "Diagnósticos realizados".
    // Anónimo (usuario_id null). Si falla, no rompemos la respuesta al usuario.
    try {
      await getAdminClient()
        .from("diagnosticos")
        .insert({
          usuario_id: null,
          nivel_riesgo: diag.nivel_riesgo,
          color_observado: diag.color_observado,
          turbidez_aparente: diag.turbidez_aparente,
          sedimentos_visibles: diag.sedimentos_visibles,
          diagnostico: diag.diagnostico,
          recomendacion: diag.recomendacion,
        });
    } catch (e) {
      console.error("No se pudo guardar el diagnóstico (no crítico):", e);
    }

    return Response.json({ ok: true, diagnostico: diag });
  } catch (err) {
    console.error("Error en POST /api/diagnostico:", err);
    return Response.json(
      { ok: false, error: "No se pudo analizar la foto. Intenta con otra imagen." },
      { status: 500 },
    );
  }
}
