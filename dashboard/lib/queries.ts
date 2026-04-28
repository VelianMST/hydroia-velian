import { supabase, type ReportePublico, type DiagnosticoPublico } from "./supabase";

export async function obtenerReportes(): Promise<ReportePublico[]> {
  const { data, error } = await supabase
    .from("reportes")
    .select("id, tipo, colonia, descripcion, fecha")
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

export async function obtenerEstadisticas(): Promise<Estadisticas> {
  const [reportes, diagnosticos, reportesColonias] = await Promise.all([
    supabase.from("reportes").select("id", { count: "exact", head: true }),
    supabase.from("diagnosticos").select("id", { count: "exact", head: true }),
    supabase.from("reportes").select("colonia"),
  ]);

  if (reportes.error) throw reportes.error;
  if (diagnosticos.error) throw diagnosticos.error;
  if (reportesColonias.error) throw reportesColonias.error;

  const colonias = new Set<string>();
  for (const fila of reportesColonias.data ?? []) {
    if (fila.colonia) colonias.add(fila.colonia.trim().toLowerCase());
  }

  // Familias activas: aproximamos como número de colonias distintas con reportes
  // (no exponemos cuenta de usuarios para preservar privacidad).
  const familiasActivas = colonias.size;

  return {
    totalReportes: reportes.count ?? 0,
    familiasActivas,
    diagnosticos: diagnosticos.count ?? 0,
    coloniasCubiertas: colonias.size,
  };
}

export interface ReportesPorColonia {
  colonia: string;
  total: number;
}

export async function obtenerReportesPorColonia(
  reportes?: ReportePublico[],
): Promise<ReportesPorColonia[]> {
  const lista = reportes ?? (await obtenerReportes());
  const cuentas = new Map<string, number>();
  for (const r of lista) {
    const c = (r.colonia ?? "Sin colonia").trim() || "Sin colonia";
    cuentas.set(c, (cuentas.get(c) ?? 0) + 1);
  }
  return Array.from(cuentas.entries())
    .map(([colonia, total]) => ({ colonia, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
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
