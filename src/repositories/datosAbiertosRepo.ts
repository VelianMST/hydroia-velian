import { supabase, type DatoAbierto } from "../services/supabase.js";

export type NuevoDato = {
  indicador: string;
  valor?: number | null;
  texto?: string | null;
  fuente?: string | null;
  confiable?: boolean;
};

export async function guardarDato(d: NuevoDato): Promise<void> {
  const { error } = await supabase.from("datos_abiertos").insert({
    indicador: d.indicador,
    valor: d.valor ?? null,
    texto: d.texto ?? null,
    fuente: d.fuente ?? null,
    confiable: d.confiable ?? true,
  });
  if (error) console.error(`datos_abiertos insert (${d.indicador}):`, error.message);
}

export async function ultimoDato(indicador: string): Promise<DatoAbierto | null> {
  const { data, error } = await supabase
    .from("datos_abiertos")
    .select("*")
    .eq("indicador", indicador)
    .order("fecha", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error(`datos_abiertos lectura (${indicador}):`, error.message);
    return null;
  }
  return (data as DatoAbierto | null) ?? null;
}

export async function historial(
  indicador: string,
  limite = 60,
): Promise<DatoAbierto[]> {
  const { data, error } = await supabase
    .from("datos_abiertos")
    .select("*")
    .eq("indicador", indicador)
    .order("fecha", { ascending: false })
    .limit(limite);
  if (error) {
    console.error(`datos_abiertos historial (${indicador}):`, error.message);
    return [];
  }
  return (data ?? []) as DatoAbierto[];
}
