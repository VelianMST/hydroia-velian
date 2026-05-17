import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local",
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

export interface ReportePublico {
  id: string;
  tipo: "fuga" | "tandeo" | "mala_calidad";
  colonia: string | null;
  colonia_norm: string | null;
  municipio: string | null;
  lat: number | null;
  lng: number | null;
  descripcion: string;
  fecha: string;
}

export interface DiagnosticoPublico {
  nivel_riesgo: string;
  fecha: string;
}

export interface UsuarioPublico {
  colonia: string | null;
}

export interface DatoAbiertoPublico {
  indicador: string;
  valor: number | null;
  texto: string | null;
  fuente: string | null;
  confiable: boolean;
  fecha: string;
}
