import { supabase, type Prediccion } from "../services/supabase.js";

export async function guardarPrediccion(
  pred: Omit<Prediccion, "id" | "fecha_calculo">,
): Promise<Prediccion> {
  const { data, error } = await supabase
    .from("predicciones")
    .insert(pred)
    .select()
    .single();
  if (error) throw error;
  return data as Prediccion;
}

export async function obtenerUltimaPorColonia(
  colonia: string,
): Promise<Prediccion | null> {
  const { data, error } = await supabase
    .from("predicciones")
    .select("*")
    .eq("colonia", colonia)
    .order("fecha_calculo", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as Prediccion | null) ?? null;
}
