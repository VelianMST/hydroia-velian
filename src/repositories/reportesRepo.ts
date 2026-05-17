import { supabase, type Reporte, type TipoReporte } from "../services/supabase.js";
import { normalizarNombre } from "../utils/geo.js";

export type NuevoReporte = Pick<
  Reporte,
  "usuario_id" | "tipo" | "descripcion"
> &
  Partial<
    Pick<
      Reporte,
      | "colonia"
      | "colonia_norm"
      | "municipio"
      | "estado_geo"
      | "latitud"
      | "longitud"
      | "lat"
      | "lng"
      | "estado"
    >
  >;

export async function crearReporte(reporte: NuevoReporte): Promise<Reporte> {
  const { data, error } = await supabase
    .from("reportes")
    .insert(reporte)
    .select()
    .single();
  if (error) throw error;
  return data as Reporte;
}

export async function listarRecientes(limite = 50): Promise<Reporte[]> {
  const { data, error } = await supabase
    .from("reportes")
    .select("*")
    .order("fecha", { ascending: false })
    .limit(limite);
  if (error) throw error;
  return (data ?? []) as Reporte[];
}

export async function listarPorColonia(
  coloniaNorm: string,
  desde?: Date,
): Promise<Reporte[]> {
  let q = supabase
    .from("reportes")
    .select("*")
    .eq("colonia_norm", normalizarNombre(coloniaNorm));
  if (desde) q = q.gte("fecha", desde.toISOString());
  const { data, error } = await q.order("fecha", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Reporte[];
}

export async function contarTandeosRecientes(
  colonia: string,
  dias: number,
): Promise<number> {
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
  const { count, error } = await supabase
    .from("reportes")
    .select("*", { count: "exact", head: true })
    .eq("colonia_norm", normalizarNombre(colonia))
    .eq("tipo", "tandeo" satisfies TipoReporte)
    .gte("fecha", desde.toISOString());
  if (error) throw error;
  return count ?? 0;
}

export type ReportePublicoFila = Pick<
  Reporte,
  "id" | "tipo" | "colonia" | "colonia_norm" | "municipio" | "lat" | "lng" | "descripcion" | "fecha"
>;

export async function listarPublicos(limite = 500): Promise<ReportePublicoFila[]> {
  const { data, error } = await supabase
    .from("reportes")
    .select("id, tipo, colonia, colonia_norm, municipio, lat, lng, descripcion, fecha")
    .order("fecha", { ascending: false })
    .limit(limite);
  if (error) throw error;
  return (data ?? []) as ReportePublicoFila[];
}

export async function borrarPorUsuario(usuarioId: number): Promise<void> {
  const { error } = await supabase
    .from("reportes")
    .delete()
    .eq("usuario_id", usuarioId);
  if (error) throw error;
}
