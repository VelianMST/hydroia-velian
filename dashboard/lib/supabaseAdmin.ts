import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con la llave service_role. SOLO debe importarse desde
 * código de servidor (API routes). Omite RLS, por eso nunca debe llegar al
 * navegador ni usar el prefijo NEXT_PUBLIC. Se crea de forma perezosa para que
 * el build no falle si las variables aún no están configuradas.
 */
let cliente: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (cliente) return cliente;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Faltan SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY (variables solo de servidor).",
    );
  }
  cliente = createClient(url, serviceKey, { auth: { persistSession: false } });
  return cliente;
}
