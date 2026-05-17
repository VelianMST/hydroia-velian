import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * Capa robusta del nivel del Sistema Cutzamala.
 *
 * Diseño "automático pero NUNCA frágil": intenta refrescar el dato desde una
 * fuente pública (CONAGUA/SINA) como máximo una vez al día, pero la predicción
 * nunca se bloquea ni truena por ello. Cadena de respaldo:
 *
 *   fetch remoto (best-effort)  ->  caché local (model/cutzamala_actual.json)
 *   ->  último valor del histórico  ->  valor por defecto documentado
 *
 * El valor del caché es un dato público real (boletín semanal de CONAGUA) y
 * se puede actualizar a mano editando model/cutzamala_actual.json. El nivel
 * del Cutzamala cambia con resolución semanal, por eso no tiene sentido
 * consultarlo más de una vez al día.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODEL_DIR = join(__dirname, "..", "..", "model");
const CACHE_PATH = join(MODEL_DIR, "cutzamala_actual.json");
const HISTORICO_PATH = join(MODEL_DIR, "cutzamala_historico.csv");

const DEFAULT_PCT = 50.0;
const REFRESCO_MS = 24 * 60 * 60 * 1000; // 1 vez al día
const FETCH_TIMEOUT_MS = 8000;

export interface NivelCutzamala {
  porcentaje: number;
  fecha: string;
  fuente: string;
  confiable: boolean;
}

interface CacheArchivo {
  porcentaje: number;
  fecha: string;
  fuente: string;
  actualizado_por?: string;
  ultimo_intento_remoto?: string;
  nota?: string;
}

let memoria: NivelCutzamala | null = null;

async function leerCache(): Promise<CacheArchivo | null> {
  try {
    const txt = await readFile(CACHE_PATH, "utf-8");
    const j = JSON.parse(txt) as CacheArchivo;
    if (typeof j.porcentaje === "number" && j.porcentaje > 0 && j.porcentaje <= 100) {
      return j;
    }
    return null;
  } catch {
    return null;
  }
}

async function escribirCache(c: CacheArchivo): Promise<void> {
  try {
    await writeFile(CACHE_PATH, JSON.stringify(c, null, 2) + "\n", "utf-8");
  } catch (err) {
    console.error("No se pudo escribir el caché de Cutzamala:", err);
  }
}

async function ultimoDelHistorico(): Promise<number | null> {
  try {
    const txt = await readFile(HISTORICO_PATH, "utf-8");
    const lineas = txt.trim().split("\n");
    if (lineas.length < 2) return null;
    const ultima = lineas[lineas.length - 1].split(",");
    const pct = Number(ultima[1]);
    return Number.isFinite(pct) ? pct : null;
  } catch {
    return null;
  }
}

/**
 * Intenta leer el dato desde SINA/CONAGUA. Devuelve null ante cualquier
 * problema (nunca lanza). Suma las tres presas del Sistema Cutzamala
 * (Valle de Bravo, Villa Victoria, El Bosque) si la fuente lo permite.
 */
async function intentarFetchRemoto(): Promise<number | null> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(
      "https://sina.conagua.gob.mx/sina/almacenamientoPrincipalesPresas.php",
      {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "application/json,text/plain,*/*",
        },
      },
    );
    if (!resp.ok) return null;
    const texto = await resp.text();
    let datos: unknown;
    try {
      datos = JSON.parse(texto);
    } catch {
      return null; // la fuente devolvió HTML/redirect: no es fiable hoy
    }
    if (!Array.isArray(datos)) return null;

    const presasCutzamala = ["valle de bravo", "villa victoria", "el bosque"];
    let almacenado = 0;
    let capacidad = 0;
    for (const fila of datos as Array<Record<string, unknown>>) {
      const nombre = String(
        fila.nombreoficial ?? fila.nombrecomun ?? fila.nombre ?? "",
      ).toLowerCase();
      if (presasCutzamala.some((p) => nombre.includes(p))) {
        const alm = Number(fila.almacenaactual ?? fila.almacena ?? 0);
        const cap = Number(fila.namoalmac ?? fila.capacidad ?? 0);
        if (Number.isFinite(alm) && Number.isFinite(cap) && cap > 0) {
          almacenado += alm;
          capacidad += cap;
        }
      }
    }
    if (capacidad <= 0) return null;
    const pct = (almacenado / capacidad) * 100;
    if (pct > 0 && pct <= 100) return Math.round(pct * 100) / 100;
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function tocaRefrescar(cache: CacheArchivo | null): boolean {
  if (!cache?.ultimo_intento_remoto) return true;
  const ultimo = new Date(cache.ultimo_intento_remoto).getTime();
  if (!Number.isFinite(ultimo)) return true;
  return Date.now() - ultimo > REFRESCO_MS;
}

/**
 * Devuelve el nivel del Cutzamala más confiable disponible AHORA, sin bloquear
 * la predicción más de lo necesario y sin lanzar nunca.
 */
export async function obtenerNivelCutzamala(): Promise<NivelCutzamala> {
  const cache = await leerCache();

  // Refresco remoto best-effort (como máximo 1/día). Si falla, seguimos.
  if (tocaRefrescar(cache)) {
    const remoto = await intentarFetchRemoto();
    const ahora = new Date().toISOString();
    if (remoto !== null) {
      const nuevo: CacheArchivo = {
        porcentaje: remoto,
        fecha: ahora.slice(0, 10),
        fuente: "CONAGUA/SINA (lectura automática)",
        actualizado_por: "auto",
        ultimo_intento_remoto: ahora,
        nota: cache?.nota,
      };
      await escribirCache(nuevo);
      memoria = {
        porcentaje: remoto,
        fecha: nuevo.fecha,
        fuente: nuevo.fuente,
        confiable: true,
      };
      return memoria;
    }
    // Falló el fetch: registramos el intento pero conservamos el valor manual.
    if (cache) {
      await escribirCache({ ...cache, ultimo_intento_remoto: ahora });
    }
  }

  if (cache) {
    memoria = {
      porcentaje: cache.porcentaje,
      fecha: cache.fecha,
      fuente: cache.fuente,
      confiable: true,
    };
    return memoria;
  }

  const hist = await ultimoDelHistorico();
  if (hist !== null) {
    memoria = {
      porcentaje: hist,
      fecha: "histórico",
      fuente: "Serie histórica Cutzamala (CONAGUA, reconstruida)",
      confiable: true,
    };
    return memoria;
  }

  memoria = {
    porcentaje: DEFAULT_PCT,
    fecha: "n/d",
    fuente: "Valor por defecto documentado (sin dato disponible)",
    confiable: false,
  };
  return memoria;
}

/** Último valor ya resuelto en esta ejecución (sin tocar disco/red). */
export function nivelCutzamalaEnMemoria(): NivelCutzamala | null {
  return memoria;
}
