import { normalizarNombre } from "./geo";
import { coordFallback } from "./colonias";

/**
 * Geocodificación del lado servidor para los reportes hechos en la app.
 * Versión compacta de la del bot: Nominatim (OpenStreetMap) con timeout y
 * filtro de cordura, y si falla, un centroide DETERMINISTA dentro del Valle de
 * México (nunca apila marcadores, nunca cae por defecto en el Zócalo).
 * Privacidad: redondeamos a 3 decimales (~100 m), nunca el punto exacto.
 */

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const UA =
  "HydroIA-Velian-App/1.0 (Premio Nacional Juvenil del Agua 2026; uso ciudadano sin fines de lucro)";
const TIMEOUT_MS = 8000;

export type FuenteGeo = "nominatim" | "fallback";
export interface GeoResult {
  lat: number;
  lng: number;
  fuente: FuenteGeo;
}

function redondear(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export async function geocodificarApp(
  colonia: string,
  municipio: string,
  estado: string,
): Promise<GeoResult> {
  const q = [colonia, municipio, estado, "México"].filter(Boolean).join(", ");

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const url = `${NOMINATIM}?format=json&limit=1&countrycodes=mx&q=${encodeURIComponent(q)}`;
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": UA, "Accept-Language": "es" },
    });
    clearTimeout(t);
    if (resp.ok) {
      const arr = (await resp.json()) as Array<{ lat?: string; lon?: string }>;
      if (Array.isArray(arr) && arr.length > 0) {
        const lat = Number(arr[0].lat);
        const lng = Number(arr[0].lon);
        // Filtro de cordura: México continental aprox.
        if (
          Number.isFinite(lat) &&
          Number.isFinite(lng) &&
          lat >= 14 &&
          lat <= 33 &&
          lng >= -118 &&
          lng <= -86
        ) {
          return { lat: redondear(lat), lng: redondear(lng), fuente: "nominatim" };
        }
      }
    }
  } catch {
    /* cae al respaldo determinista */
  }

  const fb = coordFallback(`${normalizarNombre(colonia)}|${normalizarNombre(municipio)}`);
  return { lat: fb.lat, lng: fb.lng, fuente: "fallback" };
}

export interface LugarInverso {
  colonia: string;
  municipio: string;
  estado: string;
}

/**
 * Reverse-geocoding: de coordenadas exactas (GPS de la fuga) saca colonia,
 * municipio y estado, para no pedírselos al usuario. Si falla, regresa vacíos
 * (el reporte igual se guarda con las coordenadas exactas).
 */
export async function reverseGeocodeApp(lat: number, lng: number): Promise<LugarInverso> {
  const vacio: LugarInverso = { colonia: "", municipio: "", estado: "" };
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": UA, "Accept-Language": "es" },
    });
    clearTimeout(t);
    if (!resp.ok) return vacio;
    const data = (await resp.json()) as { address?: Record<string, string> };
    const a = data.address ?? {};
    const colonia = a.neighbourhood || a.suburb || a.quarter || a.residential || a.hamlet || "";
    const municipio =
      a.city || a.town || a.municipality || a.village || a.county || a.city_district || "";
    const estado = a.state || "";
    return { colonia, municipio, estado };
  } catch {
    return vacio;
  }
}
