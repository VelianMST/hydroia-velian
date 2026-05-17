import { createClient } from "@supabase/supabase-js";
import { config } from "../config.js";

export interface Usuario {
  id: number;
  colonia: string | null;
  colonia_norm: string | null;
  municipio: string | null;
  estado: string | null;
  lat: number | null;
  lng: number | null;
  consentimiento: boolean;
  fecha_alta: string;
  fecha_ultimo_contacto: string | null;
  tamano_familia: number | null;
}

export interface Diagnostico {
  id: string;
  usuario_id: number;
  nivel_riesgo: string;
  color_observado: string;
  turbidez_aparente: string;
  sedimentos_visibles: boolean;
  diagnostico: string;
  recomendacion: string;
  fecha: string;
}

export type TipoReporte = "fuga" | "tandeo" | "mala_calidad";

export interface Reporte {
  id: string;
  usuario_id: number;
  tipo: TipoReporte;
  colonia: string | null;
  colonia_norm: string | null;
  municipio: string | null;
  estado_geo: string | null;
  latitud: number | null;
  longitud: number | null;
  lat: number | null;
  lng: number | null;
  descripcion: string;
  fecha: string;
  estado: "abierto" | "atendido";
}

export interface LecturaSensor {
  id: string;
  dispositivo_id: string;
  turbidez_ntu: number;
  tds_ppm: number;
  temperatura_c: number;
  colonia: string | null;
  fecha: string;
}

export interface Prediccion {
  id: string;
  colonia: string;
  probabilidad_corte: number;
  ventana_horas: number;
  fecha_calculo: string;
}

export const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
  auth: { persistSession: false },
});
