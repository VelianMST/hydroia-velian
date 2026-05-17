import {
  normalizarLugar,
  hash01,
  redondearCoord,
  type LugarNormalizado,
} from "../utils/geo.js";
import {
  COLONIAS_CURADAS,
  MUNICIPIOS_CENTROIDES,
  ESTADOS_CENTROIDES,
  VALLE_DE_MEXICO,
  type Coord,
} from "../data/geocatalogo.js";
import { obtenerGeocache, guardarGeocache } from "../repositories/geocacheRepo.js";

/**
 * Geocodificación robusta "automática pero NUNCA frágil".
 *
 * Cascada:
 *   1. Caché en Supabase (cada lugar se resuelve una sola vez en la historia)
 *   2. Catálogo curado (máxima precisión donde más se usa)
 *   3. Nominatim / OpenStreetMap (cobertura nacional, throttled y con timeout)
 *   4. Centroide del municipio  + desplazamiento DETERMINISTA por colonia
 *   5. Centroide del estado     + desplazamiento determinista
 *   6. Centro del Valle de México (último recurso) — NUNCA CDMX por defecto
 *
 * Nunca lanza. Nunca bloquea más de ~8 s. El desplazamiento es determinista
 * (hash del nombre) para que el marcador no "brinque" entre refrescos.
 */

export type FuenteGeo =
  | "cache"
  | "catalogo"
  | "nominatim"
  | "municipio"
  | "estado"
  | "valle";

export interface ResultadoGeo {
  lat: number;
  lng: number;
  fuente: FuenteGeo;
  lugar: LugarNormalizado;
}

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const UA =
  "HydroIA-Velian/1.0 (Premio Nacional Juvenil del Agua 2026; uso ciudadano sin fines de lucro)";
const TIMEOUT_MS = 8000;
const MIN_INTERVALO_MS = 1100; // política de uso de Nominatim: <= 1 req/seg

// Cola de 1 a la vez + respeto del intervalo mínimo entre llamadas a Nominatim.
let cadena: Promise<unknown> = Promise.resolve();
let ultimaLlamada = 0;

function enColaNominatim<T>(fn: () => Promise<T>): Promise<T> {
  const corrida = cadena.then(async () => {
    const espera = MIN_INTERVALO_MS - (Date.now() - ultimaLlamada);
    if (espera > 0) await new Promise((r) => setTimeout(r, espera));
    ultimaLlamada = Date.now();
    return fn();
  });
  cadena = corrida.then(
    () => undefined,
    () => undefined,
  );
  return corrida;
}

async function consultarNominatim(
  lugar: LugarNormalizado,
): Promise<Coord | null> {
  const partes = [
    lugar.coloniaDisplay,
    lugar.municipioDisplay,
    lugar.estado,
    "México",
  ].filter(Boolean);
  const q = partes.join(", ");

  return enColaNominatim(async () => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const url = `${NOMINATIM}?format=json&limit=1&countrycodes=mx&q=${encodeURIComponent(q)}`;
      const resp = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": UA, "Accept-Language": "es" },
      });
      if (!resp.ok) return null;
      const arr = (await resp.json()) as Array<{ lat?: string; lon?: string }>;
      if (!Array.isArray(arr) || arr.length === 0) return null;
      const lat = Number(arr[0].lat);
      const lng = Number(arr[0].lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      // México continental aprox. (filtro de cordura)
      if (lat < 14 || lat > 33 || lng < -118 || lng > -86) return null;
      return { lat, lng };
    } catch {
      return null;
    } finally {
      clearTimeout(t);
    }
  });
}

/** Desplazamiento determinista (±~1.5 km) para no apilar marcadores. */
function jitter(base: Coord, semilla: string): Coord {
  const a = hash01(semilla) * 2 * Math.PI;
  const r = 0.012 + hash01(semilla + "r") * 0.006; // ~1.3–2 km
  return {
    lat: redondearCoord(base.lat + Math.sin(a) * r),
    lng: redondearCoord(base.lng + Math.cos(a) * r),
  };
}

function fallbackCentroides(lugar: LugarNormalizado): {
  coord: Coord;
  fuente: FuenteGeo;
} {
  const muni = MUNICIPIOS_CENTROIDES[lugar.municipioNorm];
  if (muni) {
    return { coord: jitter(muni, lugar.coloniaNorm || lugar.municipioNorm), fuente: "municipio" };
  }
  const est = ESTADOS_CENTROIDES[lugar.estadoNorm];
  if (est) {
    return { coord: jitter(est, lugar.coloniaNorm || lugar.estadoNorm), fuente: "estado" };
  }
  return { coord: jitter(VALLE_DE_MEXICO, lugar.coloniaNorm || "valle"), fuente: "valle" };
}

export async function geocodificar(
  colonia: string,
  municipio: string | null | undefined,
  estado: string | null | undefined,
): Promise<ResultadoGeo> {
  const lugar = normalizarLugar(colonia, municipio, estado);

  // 1) Caché
  try {
    const hit = await obtenerGeocache(lugar.clave);
    if (hit) {
      return { lat: hit.lat, lng: hit.lng, fuente: "cache", lugar };
    }
  } catch {
    /* sigue */
  }

  // 2) Catálogo curado
  const cur = COLONIAS_CURADAS[`${lugar.coloniaNorm}|${lugar.municipioNorm}`];
  if (cur) {
    const lat = redondearCoord(cur.lat);
    const lng = redondearCoord(cur.lng);
    await guardarGeocache({ clave: lugar.clave, lat, lng, fuente: "catalogo" }).catch(
      () => {},
    );
    return { lat, lng, fuente: "catalogo", lugar };
  }

  // 3) Nominatim (solo si tenemos al menos colonia)
  if (lugar.coloniaNorm) {
    const nm = await consultarNominatim(lugar);
    if (nm) {
      const lat = redondearCoord(nm.lat);
      const lng = redondearCoord(nm.lng);
      await guardarGeocache({
        clave: lugar.clave,
        lat,
        lng,
        fuente: "nominatim",
      }).catch(() => {});
      return { lat, lng, fuente: "nominatim", lugar };
    }
  }

  // 4-6) Respaldo por centroide (determinista, nunca CDMX por defecto)
  const { coord, fuente } = fallbackCentroides(lugar);
  await guardarGeocache({
    clave: lugar.clave,
    lat: coord.lat,
    lng: coord.lng,
    fuente,
  }).catch(() => {});
  return { lat: coord.lat, lng: coord.lng, fuente, lugar };
}
