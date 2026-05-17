/**
 * Normalización canónica de nombres de lugares (colonia/municipio/estado).
 *
 * IMPORTANTE: esta lógica está DUPLICADA, idéntica, en
 * `dashboard/lib/geo.ts`. Si cambias una, cambia la otra. (El bot y el
 * dashboard son proyectos separados y no comparten paquete.)
 *
 * - `normalizarNombre`: clave canónica para comparar/agrupar. Quita acentos,
 *   minúsculas, sin puntuación, espacios colapsados. Así "Himno Nacional",
 *   "himno  nacional" y "HIMNO NACIONAL" producen la MISMA clave.
 * - `nombreBonito`: forma legible para mostrar (Title Case, conserva acentos).
 */

export function normalizarNombre(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos (ñ -> n, á -> a)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ") // solo letras/números/espacios
    .replace(/\s+/g, " ")
    .trim();
}

const MINUSCULAS = new Set(["de", "del", "la", "las", "los", "y", "el"]);

export function nombreBonito(s: string): string {
  const limpio = s.replace(/\s+/g, " ").trim();
  if (!limpio) return "";
  return limpio
    .split(" ")
    .map((w, i) => {
      const lw = w.toLowerCase();
      if (i > 0 && MINUSCULAS.has(lw)) return lw;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

/** Normaliza el estado a una de las formas canónicas conocidas. */
export function normalizarEstado(s: string | null | undefined): string {
  const n = normalizarNombre(s ?? "");
  if (!n) return "México";
  if (
    n === "cdmx" ||
    n === "df" ||
    n.includes("ciudad de mexico") ||
    n === "distrito federal"
  ) {
    return "Ciudad de México";
  }
  if (
    n === "edomex" ||
    n === "mexico" ||
    n.includes("estado de mexico") ||
    n === "edo mex"
  ) {
    return "México";
  }
  return nombreBonito(s ?? "");
}

export interface LugarNormalizado {
  coloniaDisplay: string;
  coloniaNorm: string;
  municipioDisplay: string;
  municipioNorm: string;
  estado: string;
  estadoNorm: string;
  clave: string;
}

/** Construye la representación normalizada + clave de geocodificación. */
export function normalizarLugar(
  colonia: string,
  municipio: string | null | undefined,
  estado: string | null | undefined,
): LugarNormalizado {
  const coloniaDisplay = nombreBonito(colonia);
  const coloniaNorm = normalizarNombre(colonia);
  const municipioDisplay = municipio ? nombreBonito(municipio) : "";
  const municipioNorm = municipio ? normalizarNombre(municipio) : "";
  const estadoCanon = normalizarEstado(estado);
  const estadoNorm = normalizarNombre(estadoCanon);
  return {
    coloniaDisplay,
    coloniaNorm,
    municipioDisplay,
    municipioNorm,
    estado: estadoCanon,
    estadoNorm,
    clave: `${coloniaNorm}|${municipioNorm}|${estadoNorm}`,
  };
}

/** Hash determinista (FNV-1a) -> [0,1). Para desplazamiento estable. */
export function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // a [0,1)
  return ((h >>> 0) % 100000) / 100000;
}

/** Redondeo de coordenadas (privacidad: centroide aproximado, no domicilio). */
export function redondearCoord(n: number, decimales = 3): number {
  const f = 10 ** decimales;
  return Math.round(n * f) / f;
}
