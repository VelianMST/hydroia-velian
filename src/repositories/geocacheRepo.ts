import { supabase } from "../services/supabase.js";

export interface GeoCacheRow {
  clave: string;
  lat: number;
  lng: number;
  fuente: string;
}

export async function obtenerGeocache(
  clave: string,
): Promise<GeoCacheRow | null> {
  const { data, error } = await supabase
    .from("geocache")
    .select("clave, lat, lng, fuente")
    .eq("clave", clave)
    .maybeSingle();
  if (error) {
    console.error("geocache lectura falló:", error.message);
    return null;
  }
  return (data as GeoCacheRow | null) ?? null;
}

export async function guardarGeocache(row: GeoCacheRow): Promise<void> {
  const { error } = await supabase
    .from("geocache")
    .upsert({ ...row, fecha: new Date().toISOString() }, { onConflict: "clave" });
  if (error) console.error("geocache escritura falló:", error.message);
}
