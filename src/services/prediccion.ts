import { contarTandeosRecientes } from "../repositories/reportesRepo.js";
import { guardarPrediccion } from "../repositories/prediccionesRepo.js";

export interface ResultadoPrediccion {
  probabilidad: number;
  mensaje: string;
  factor_principal: string;
}

const VENTANA_HORAS = 72;
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

function nivelDescriptivo(p: number): string {
  if (p < 0.35) return "baja";
  if (p < 0.65) return "media";
  return "alta";
}

function recomendacionPara(p: number): string {
  if (p < 0.35) {
    return "Aprovecha que la probabilidad es baja para hacer pendientes que requieren agua, pero mantén un mínimo de reserva.";
  }
  if (p < 0.65) {
    return "Llena cubetas y garrafones por si baja la presión. Evita lavadoras o riego en estos días.";
  }
  return "Llena tinaco, cubetas y garrafones cuanto antes. Es muy probable que se vaya el agua en las próximas horas.";
}

export async function calcularPrediccion(colonia: string): Promise<ResultadoPrediccion> {
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

  const probabilidad = Math.max(0, Math.min(1, contribBase + contribReportes + contribTemporal));

  let factor_principal: string;
  if (contribReportes >= contribTemporal && contribReportes >= contribBase) {
    factor_principal =
      reportesRecientes > 0
        ? `${reportesRecientes} reporte(s) ciudadano(s) de tandeo en ${colonia} en los últimos ${DIAS_HISTORICOS} días`
        : `Pocos reportes recientes en ${colonia}`;
  } else if (contribTemporal >= contribBase) {
    factor_principal = `Día y hora actuales (factor temporal del Valle de México)`;
  } else {
    factor_principal = `Probabilidad base histórica de cortes en la zona`;
  }

  const nivel = nivelDescriptivo(probabilidad);
  const mensaje = `Probabilidad ${nivel} de corte de agua en ${colonia} en las próximas ${VENTANA_HORAS} horas.`;

  await guardarPrediccion({
    colonia,
    probabilidad_corte: probabilidad,
    ventana_horas: VENTANA_HORAS,
  }).catch((err) => {
    console.error("No se pudo guardar la predicción:", err);
  });

  return { probabilidad, mensaje, factor_principal };
}

export function ventanaHoras(): number {
  return VENTANA_HORAS;
}

export { nivelDescriptivo, recomendacionPara };
