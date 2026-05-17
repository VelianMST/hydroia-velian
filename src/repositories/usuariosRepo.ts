import { supabase, type Usuario } from "../services/supabase.js";
import { geocodificar } from "../services/geocoding.js";

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

/**
 * Registra colonia + municipio + estado del usuario: normaliza, geocodifica
 * (caché → catálogo → Nominatim → centroide) y guarda todo, incluido el
 * centroide resuelto. Devuelve también de dónde salió la coordenada.
 */
export async function registrarUbicacionUsuario(
  id: number,
  colonia: string,
  municipio: string | null,
  estado: string | null,
): Promise<{ usuario: Usuario; fuente: string; municipioDisplay: string }> {
  const geo = await geocodificar(colonia, municipio, estado);
  const usuario = await crearOActualizarUsuario(id, {
    colonia: geo.lugar.coloniaDisplay,
    colonia_norm: geo.lugar.coloniaNorm,
    municipio: geo.lugar.municipioDisplay || null,
    estado: geo.lugar.estado,
    lat: geo.lat,
    lng: geo.lng,
    consentimiento: true,
  });
  return { usuario, fuente: geo.fuente, municipioDisplay: geo.lugar.municipioDisplay };
}

export async function borrarUsuario(id: number): Promise<void> {
  const { error } = await supabase.from("usuarios").delete().eq("id", id);
  if (error) throw error;
}
