import { contarTandeosRecientes } from "../repositories/reportesRepo.js";

/**
 * Heurística interpretable de respaldo. Solo se usa si el modelo de regresión
 * logística no está disponible (archivo ausente o corrupto). Se conserva por
 * transparencia: el bot nunca deja de responder y el modo degradado queda
 * registrado en consola.
 */

const DIAS_HISTORICOS = 7;
const UMBRAL_REPORTES = 5;
const BASE = 0.4;

function factorDia(dia: number): number {
  if (dia === 1 || dia === 2) return 0.85;
  if (dia === 0 || dia === 3) return 0.55;
  return 0.35;
}

function factorHora(hora: number): number {
  if (hora >= 4 && hora <= 8) return 0.9;
  if (hora >= 18 && hora <= 22) return 0.7;
  return 0.4;
}

export interface SalidaHeuristica {
  probabilidad: number;
  factor_principal: string;
}

export async function prediccionHeuristica(
  colonia: string,
): Promise<SalidaHeuristica> {
  const ahora = new Date();
  const dia = ahora.getDay();
  const hora = ahora.getHours();

  const reportesRecientes = await contarTandeosRecientes(colonia, DIAS_HISTORICOS);
  const reportesNorm = Math.min(reportesRecientes / UMBRAL_REPORTES, 1);

  const fDia = factorDia(dia);
  const fHora = factorHora(hora);
  const factorTemporal = fDia * 0.7 + fHora * 0.3;

  const contribBase = 0.2 * BASE;
  const contribReportes = 0.5 * reportesNorm;
  const contribTemporal = 0.3 * factorTemporal;

  const probabilidad = Math.max(
    0,
    Math.min(1, contribBase + contribReportes + contribTemporal),
  );

  let factor_principal: string;
  if (contribReportes >= contribTemporal && contribReportes >= contribBase) {
    factor_principal =
      reportesRecientes > 0
        ? `${reportesRecientes} reporte(s) ciudadano(s) de tandeo en ${colonia} en los últimos ${DIAS_HISTORICOS} días`
        : `Pocos reportes recientes en ${colonia}`;
  } else if (contribTemporal >= contribBase) {
    factor_principal = "Día y hora actuales (factor temporal del Valle de México)";
  } else {
    factor_principal = "Probabilidad base histórica de cortes en la zona";
  }

  return { probabilidad, factor_principal };
}
