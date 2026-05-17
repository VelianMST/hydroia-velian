// Centro del mapa del dashboard (Valle de México). Las coordenadas de cada
// reporte vienen RESUELTAS desde la base de datos (columnas lat/lng, que el
// bot calcula con geocodificación + caché). Esto solo es el centro inicial
// del mapa y un respaldo determinista si algún reporte viejo no tuviera
// coordenadas (no debería pasar tras el backfill).

import { hash01 } from "./geo";

export interface ColoniaCoord {
  lat: number;
  lng: number;
}

export const VALLE_CENTER: ColoniaCoord = { lat: 19.55, lng: -99.23 };

/** Respaldo determinista (estable entre refrescos, NO aleatorio). */
export function coordFallback(clave: string | null): ColoniaCoord {
  const semilla = (clave ?? "valle").toLowerCase();
  const ang = hash01(semilla) * 2 * Math.PI;
  const rad = 0.03 + hash01(semilla + "r") * 0.04;
  return {
    lat: Math.round((VALLE_CENTER.lat + Math.sin(ang) * rad) * 1000) / 1000,
    lng: Math.round((VALLE_CENTER.lng + Math.cos(ang) * rad) * 1000) / 1000,
  };
}
