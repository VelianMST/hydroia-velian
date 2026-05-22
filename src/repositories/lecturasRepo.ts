import { supabase, type LecturaSensor } from "../services/supabase.js";

export async function ultimaLectura(
  dispositivoId?: string,
): Promise<LecturaSensor | null> {
  let q = supabase
    .from("lecturas_sensor")
    .select("*")
    .order("fecha", { ascending: false })
    .limit(1);
  if (dispositivoId) q = q.eq("dispositivo_id", dispositivoId);
  const { data, error } = await q.maybeSingle();
  if (error) {
    console.error("lecturas_sensor lectura:", error.message);
    return null;
  }
  return (data as LecturaSensor | null) ?? null;
}

export async function ultimasLecturas(limite = 30): Promise<LecturaSensor[]> {
  const { data, error } = await supabase
    .from("lecturas_sensor")
    .select("*")
    .order("fecha", { ascending: false })
    .limit(limite);
  if (error) {
    console.error("lecturas_sensor historial:", error.message);
    return [];
  }
  return (data ?? []) as LecturaSensor[];
}
