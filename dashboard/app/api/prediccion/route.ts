import { calcularPrediccionApp } from "@/lib/prediccion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "Cuerpo inválido." }, { status: 400 });
  }

  const colonia = typeof body.colonia === "string" ? body.colonia.trim().slice(0, 80) : "";
  const municipio = typeof body.municipio === "string" ? body.municipio.trim().slice(0, 80) : "";

  if (colonia.length < 2) {
    return Response.json(
      { ok: false, error: "Escribe tu colonia para calcular la predicción." },
      { status: 400 },
    );
  }

  try {
    const resultado = await calcularPrediccionApp(colonia, municipio);
    return Response.json({ ok: true, resultado });
  } catch (err) {
    console.error("Error en POST /api/prediccion:", err);
    return Response.json({ ok: false, error: "No se pudo calcular la predicción." }, { status: 500 });
  }
}
