import { supabase, type Diagnostico } from "../services/supabase.js";

export async function guardarDiagnostico(
  diag: Omit<Diagnostico, "id" | "fecha">,
): Promise<Diagnostico> {
  const { data, error } = await supabase
    .from("diagnosticos")
    .insert(diag)
    .select()
    .single();
  if (error) throw error;
  return data as Diagnostico;
}

export async function listarPorUsuario(
  usuarioId: number,
  limite = 20,
): Promise<Diagnostico[]> {
  const { data, error } = await supabase
    .from("diagnosticos")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("fecha", { ascending: false })
    .limit(limite);
  if (error) throw error;
  return (data ?? []) as Diagnostico[];
}

export async function borrarPorUsuario(usuarioId: number): Promise<void> {
  const { error } = await supabase
    .from("diagnosticos")
    .delete()
    .eq("usuario_id", usuarioId);
  if (error) throw error;
}
