/**
 * Normalización de nombres de lugares — ESPEJO EXACTO de
 * `src/utils/geo.ts` del bot. Si cambias una, cambia la otra.
 * (Bot y dashboard son proyectos separados; no comparten paquete.)
 */

export function normalizarNombre(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
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

/** Hash determinista (FNV-1a) -> [0,1). Para desplazamiento estable. */
export function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}
