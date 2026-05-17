/**
 * Backfill de geolocalización para datos ya existentes en Supabase.
 *
 * Recorre `usuarios` y `reportes`, normaliza el nombre de la colonia y
 * resuelve coordenadas con la MISMA cascada del bot (caché → catálogo →
 * Nominatim → centroide). Rellena colonia_norm, municipio, estado(_geo),
 * lat y lng. Idempotente: la caché evita repetir geocodificaciones; se puede
 * volver a correr sin problema.
 *
 * Uso (desde la raíz del proyecto, con el .env configurado):
 *   npx tsx scripts/backfill_geo.ts
 */
import { supabase } from "../src/services/supabase.js";
import { geocodificar } from "../src/services/geocoding.js";

interface UsuarioRow {
  id: number;
  colonia: string | null;
  municipio: string | null;
  estado: string | null;
}

interface ReporteRow {
  id: string;
  usuario_id: number | null;
  colonia: string | null;
  municipio: string | null;
}

async function backfillUsuarios(): Promise<Map<number, UsuarioRow>> {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, colonia, municipio, estado");
  if (error) throw error;
  const filas = (data ?? []) as UsuarioRow[];
  const mapa = new Map<number, UsuarioRow>();

  let ok = 0;
  for (const u of filas) {
    mapa.set(u.id, u);
    if (!u.colonia) continue;
    const geo = await geocodificar(u.colonia, u.municipio, u.estado);
    const { error: e } = await supabase
      .from("usuarios")
      .update({
        colonia: geo.lugar.coloniaDisplay,
        colonia_norm: geo.lugar.coloniaNorm,
        municipio: geo.lugar.municipioDisplay || u.municipio,
        estado: geo.lugar.estado,
        lat: geo.lat,
        lng: geo.lng,
      })
      .eq("id", u.id);
    if (e) console.error(`  usuario ${u.id}: ${e.message}`);
    else {
      ok++;
      console.log(
        `  usuario ${u.id}: ${geo.lugar.coloniaDisplay}, ${geo.lugar.municipioDisplay || "?"} [${geo.fuente}]`,
      );
    }
  }
  console.log(`Usuarios: ${ok}/${filas.length} actualizados.`);
  return mapa;
}

async function backfillReportes(usuarios: Map<number, UsuarioRow>): Promise<void> {
  const { data, error } = await supabase
    .from("reportes")
    .select("id, usuario_id, colonia, municipio");
  if (error) throw error;
  const filas = (data ?? []) as ReporteRow[];

  let ok = 0;
  for (const r of filas) {
    const u = r.usuario_id != null ? usuarios.get(r.usuario_id) : undefined;
    const colonia = r.colonia ?? u?.colonia ?? null;
    const municipio = r.municipio ?? u?.municipio ?? null;
    const estado = u?.estado ?? null;
    if (!colonia) continue;

    const geo = await geocodificar(colonia, municipio, estado);
    const { error: e } = await supabase
      .from("reportes")
      .update({
        colonia: geo.lugar.coloniaDisplay,
        colonia_norm: geo.lugar.coloniaNorm,
        municipio: geo.lugar.municipioDisplay || municipio,
        estado_geo: geo.lugar.estado,
        lat: geo.lat,
        lng: geo.lng,
      })
      .eq("id", r.id);
    if (e) console.error(`  reporte ${r.id}: ${e.message}`);
    else {
      ok++;
      console.log(
        `  reporte ${r.id}: ${geo.lugar.coloniaDisplay}, ${geo.lugar.municipioDisplay || "?"} [${geo.fuente}]`,
      );
    }
  }
  console.log(`Reportes: ${ok}/${filas.length} actualizados.`);
}

async function main(): Promise<void> {
  console.log("== Backfill de geolocalización HydroIA Velian ==");
  const usuarios = await backfillUsuarios();
  await backfillReportes(usuarios);
  console.log("✅ Backfill terminado.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Backfill falló:", err);
  process.exit(1);
});
