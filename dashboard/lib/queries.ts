import { supabase, type ReportePublico, type DiagnosticoPublico } from "./supabase";
import { normalizarNombre, nombreBonito } from "./geo";

const COLS_REPORTE =
  "id, tipo, colonia, colonia_norm, municipio, lat, lng, descripcion, fecha";

export async function obtenerReportes(): Promise<ReportePublico[]> {
  const { data, error } = await supabase
    .from("reportes")
    .select(COLS_REPORTE)
    .order("fecha", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as ReportePublico[];
}

export async function obtenerDiagnosticos(): Promise<DiagnosticoPublico[]> {
  const { data, error } = await supabase
    .from("diagnosticos")
    .select("nivel_riesgo, fecha")
    .order("fecha", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as DiagnosticoPublico[];
}

export interface Estadisticas {
  totalReportes: number;
  familiasActivas: number;
  diagnosticos: number;
  coloniasCubiertas: number;
}

/** Clave canónica de una colonia para agrupar sin duplicados. */
function claveColonia(r: { colonia_norm: string | null; colonia: string | null }): string {
  const n = (r.colonia_norm ?? "").trim() || normalizarNombre(r.colonia ?? "");
  return n || "sin colonia";
}

export async function obtenerEstadisticas(): Promise<Estadisticas> {
  const [reportes, diagnosticos, filas] = await Promise.all([
    supabase.from("reportes").select("id", { count: "exact", head: true }),
    supabase.from("diagnosticos").select("id", { count: "exact", head: true }),
    supabase.from("reportes").select("colonia, colonia_norm, municipio"),
  ]);

  if (reportes.error) throw reportes.error;
  if (diagnosticos.error) throw diagnosticos.error;
  if (filas.error) throw filas.error;

  // Colonia única = colonia_norm + municipio normalizado (desambigua colonias
  // con el mismo nombre en municipios distintos).
  const colonias = new Set<string>();
  for (const f of filas.data ?? []) {
    const cn = claveColonia(f);
    if (cn === "sin colonia") continue;
    const mn = normalizarNombre((f.municipio as string | null) ?? "");
    colonias.add(`${cn}|${mn}`);
  }

  return {
    totalReportes: reportes.count ?? 0,
    familiasActivas: colonias.size,
    diagnosticos: diagnosticos.count ?? 0,
    coloniasCubiertas: colonias.size,
  };
}

export interface ReportesPorColonia {
  colonia: string;
  total: number;
}

/** Agrupación canónica (sin duplicados por mayúsculas/acentos/espacios). */
export function agruparReportesPorColonia(
  lista: ReportePublico[],
): ReportesPorColonia[] {
  const cuentas = new Map<string, { etiqueta: string; total: number }>();
  for (const r of lista) {
    const cn = claveColonia(r);
    const mn = normalizarNombre(r.municipio ?? "");
    const clave = `${cn}|${mn}`;
    const etiqueta =
      (r.colonia ? nombreBonito(r.colonia) : "Sin colonia") +
      (r.municipio ? `, ${nombreBonito(r.municipio)}` : "");
    const prev = cuentas.get(clave);
    if (prev) prev.total += 1;
    else cuentas.set(clave, { etiqueta, total: 1 });
  }
  return Array.from(cuentas.values())
    .map((v) => ({ colonia: v.etiqueta, total: v.total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
}

export async function obtenerReportesPorColonia(
  reportes?: ReportePublico[],
): Promise<ReportesPorColonia[]> {
  return agruparReportesPorColonia(reportes ?? (await obtenerReportes()));
}

export interface DistribucionRiesgo {
  nivel: string;
  total: number;
}

export async function obtenerDistribucionRiesgo(
  diagnosticos?: DiagnosticoPublico[],
): Promise<DistribucionRiesgo[]> {
  const lista = diagnosticos ?? (await obtenerDiagnosticos());
  const cuentas = new Map<string, number>();
  for (const d of lista) {
    const n = (d.nivel_riesgo || "indeterminado").trim();
    cuentas.set(n, (cuentas.get(n) ?? 0) + 1);
  }
  return Array.from(cuentas.entries()).map(([nivel, total]) => ({ nivel, total }));
}
