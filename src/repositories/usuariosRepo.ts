import { supabase, type Usuario } from "../services/supabase.js";

export async function crearOActualizarUsuario(
  id: number,
  datos: Partial<Omit<Usuario, "id" | "fecha_alta">> = {},
): Promise<Usuario> {
  const payload = {
    id,
    ...datos,
    fecha_ultimo_contacto: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("usuarios")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data as Usuario;
}

export async function obtenerUsuario(id: number): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Usuario | null) ?? null;
}

export async function actualizarColonia(
  id: number,
  colonia: string,
): Promise<Usuario> {
  return crearOActualizarUsuario(id, { colonia, consentimiento: true });
}

export async function borrarUsuario(id: number): Promise<void> {
  const { error } = await supabase.from("usuarios").delete().eq("id", id);
  if (error) throw error;
}
