import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ultimoDato } from "../repositories/datosAbiertosRepo.js";

/**
 * Nivel del Sistema Cutzamala para el modelo predictivo.
 *
 * Única fuente de verdad: la tabla `datos_abiertos` (la alimenta el servicio
 * de ingesta `datosAbiertos.ts` 1×/día desde CONAGUA/SINA o el ancla
 * documentada). Aquí solo se LEE, con cadena de respaldo NO frágil:
 *
 *   datos_abiertos (Supabase)  ->  ancla local (model/cutzamala_actual.json)
 *   ->  último valor del histórico  ->  valor por defecto documentado
 *
 * Nunca lanza, nunca bloquea.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODEL_DIR = join(__dirname, "..", "..", "model");
const ANCLA_PATH = join(MODEL_DIR, "cutzamala_actual.json");
const HISTORICO_PATH = join(MODEL_DIR, "cutzamala_historico.csv");

const DEFAULT_PCT = 50.0;

export interface NivelCutzamala {
  porcentaje: number;
  fecha: string;
  fuente: string;
  confiable: boolean;
}

let memoria: NivelCutzamala | null = null;

async function desdeDatosAbiertos(): Promise<NivelCutzamala | null> {
  try {
    const d = await ultimoDato("cutzamala_pct");
    if (d && typeof d.valor === "number" && d.valor > 0 && d.valor <= 100) {
      return {
        porcentaje: d.valor,
        fecha: d.fecha.slice(0, 10),
        fuente: d.fuente ?? "datos abiertos",
        confiable: d.confiable,
      };
    }
  } catch {
    /* sigue a respaldo local */
  }
  return null;
}

async function desdeAnclaLocal(): Promise<NivelCutzamala | null> {
  try {
    const j = JSON.parse(await readFile(ANCLA_PATH, "utf-8")) as {
      porcentaje?: number;
      fecha?: string;
      fuente?: string;
    };
    if (typeof j.porcentaje === "number" && j.porcentaje > 0 && j.porcentaje <= 100) {
      return {
        porcentaje: j.porcentaje,
        fecha: j.fecha ?? "ancla",
        fuente: j.fuente ?? "CONAGUA — ancla documentada (local)",
        confiable: true,
      };
    }
  } catch {
    /* sigue */
  }
  return null;
}

async function desdeHistorico(): Promise<NivelCutzamala | null> {
  try {
    const txt = await readFile(HISTORICO_PATH, "utf-8");
    const lineas = txt.trim().split("\n");
    if (lineas.length < 2) return null;
    const ult = lineas[lineas.length - 1].split(",");
    const pct = Number(ult[1]);
    if (Number.isFinite(pct)) {
      return {
        porcentaje: pct,
        fecha: ult[0] ?? "histórico",
        fuente: "Serie histórica Cutzamala (CONAGUA, reconstruida)",
        confiable: true,
      };
    }
  } catch {
    /* sigue */
  }
  return null;
}

/** Nivel del Cutzamala más confiable disponible. Nunca lanza. */
export async function obtenerNivelCutzamala(): Promise<NivelCutzamala> {
  memoria =
    (await desdeDatosAbiertos()) ??
    (await desdeAnclaLocal()) ??
    (await desdeHistorico()) ?? {
      porcentaje: DEFAULT_PCT,
      fecha: "n/d",
      fuente: "Valor por defecto documentado (sin dato disponible)",
      confiable: false,
    };
  return memoria;
}

export function nivelCutzamalaEnMemoria(): NivelCutzamala | null {
  return memoria;
}
