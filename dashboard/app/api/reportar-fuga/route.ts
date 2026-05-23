import { getAdminClient } from "@/lib/supabaseAdmin";
import { reverseGeocodeApp } from "@/lib/geocode";
import { normalizarNombre, nombreBonito } from "@/lib/geo";
import { analizarFugaConIA, infoSeveridad, type MimeTypeImagen } from "@/lib/fugas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

const MIMES: MimeTypeImagen[] = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const HITS = new Map<string, number[]>();
function limitado(ip: string): boolean {
  const ahora = Date.now();
  const prev = (HITS.get(ip) ?? []).filter((t) => ahora - t < 10 * 60 * 1000);
  if (prev.length >= 8) {
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
      { ok: false, error: "Demasiados reportes seguidos. Espera unos minutos." },
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
  const mimeType = (typeof body.mimeType === "string" ? body.mimeType : "image/jpeg") as MimeTypeImagen;
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  const nota = typeof body.descripcion === "string" ? body.descripcion.trim().slice(0, 300) : "";

  const coma = imagen.indexOf(",");
  if (imagen.startsWith("data:") && coma !== -1) imagen = imagen.slice(coma + 1);

  if (!imagen || imagen.length < 100) {
    return Response.json({ ok: false, error: "La foto es obligatoria para reportar una fuga." }, { status: 400 });
  }
  if (!MIMES.includes(mimeType)) {
    return Response.json({ ok: false, error: "Formato de imagen no soportado." }, { status: 400 });
  }
  if (imagen.length > 6_500_000) {
    return Response.json({ ok: false, error: "La foto es muy pesada. Tómala de nuevo." }, { status: 413 });
  }
  if (
    !Number.isFinite(lat) || !Number.isFinite(lng) ||
    lat < 14 || lat > 33 || lng < -118 || lng > -86
  ) {
    return Response.json(
      { ok: false, error: "Necesito la ubicación exacta de la fuga (activa el GPS o pon el pin)." },
      { status: 400 },
    );
  }

  try {
    // 1) IA clasifica la severidad y describe la fuga
    const analisis = await analizarFugaConIA(imagen, mimeType);
    const sev = infoSeveridad(analisis.severidad);

    // 2) Reverse-geocoding: colonia/municipio/estado desde el GPS
    const lugar = await reverseGeocodeApp(lat, lng);
    const colonia = lugar.colonia || "Ubicación exacta (sin colonia)";
    const municipio = lugar.municipio || "";
    const estado = lugar.estado || "";

    // 3) Subir la foto a Storage (service_role)
    const admin = getAdminClient();
    const buffer = Buffer.from(imagen, "base64");
    const ext = mimeType.split("/")[1] ?? "jpg";
    const filename = `fuga-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    let foto_url: string | null = null;
    const up = await admin.storage.from("fugas").upload(filename, buffer, {
      contentType: mimeType,
      upsert: false,
    });
    if (up.error) {
      console.error("Error subiendo foto de fuga:", up.error);
    } else {
      foto_url = admin.storage.from("fugas").getPublicUrl(filename).data.publicUrl;
    }

    // 4) Guardar el reporte (anónimo, ubicación EXACTA porque es vía pública)
    const descripcion = nota || analisis.descripcion;
    const { data, error } = await admin
      .from("reportes")
      .insert({
        usuario_id: null,
        tipo: "fuga",
        descripcion,
        colonia: nombreBonito(colonia),
        colonia_norm: normalizarNombre(colonia),
        municipio: municipio ? nombreBonito(municipio) : null,
        estado_geo: estado || null,
        lat,
        lng,
        latitud: lat,
        longitud: lng,
        severidad: sev.id,
        litros_dia: sev.litros_dia,
        foto_url,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error guardando fuga:", error);
      return Response.json({ ok: false, error: "No se pudo guardar el reporte." }, { status: 500 });
    }

    return Response.json({
      ok: true,
      reporte: {
        id: data?.id,
        es_fuga: analisis.es_fuga,
        severidad: sev.id,
        severidad_etiqueta: sev.etiqueta,
        litros_dia: sev.litros_dia,
        descripcion,
        colonia: nombreBonito(colonia),
        municipio: municipio ? nombreBonito(municipio) : "",
        estado,
        lat,
        lng,
        foto_url,
      },
    });
  } catch (err) {
    console.error("Error en POST /api/reportar-fuga:", err);
    return Response.json({ ok: false, error: "Error interno. Intenta de nuevo." }, { status: 500 });
  }
}
