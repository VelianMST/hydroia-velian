// Coordenadas aproximadas (centroide) de colonias comunes del Valle de México.
// Si llega un reporte sin lat/lng exactas, lo ubicamos en el centro de su colonia.

export interface ColoniaCoord {
  lat: number;
  lng: number;
}

const COLONIAS_BASE: Record<string, ColoniaCoord> = {
  // Nicolás Romero (Estado de México)
  "lomas de san miguel": { lat: 19.6396, lng: -99.3214 },
  "san francisco magú": { lat: 19.6602, lng: -99.3508 },
  "san jose el vidrio": { lat: 19.6451, lng: -99.31 },
  "san josé el vidrio": { lat: 19.6451, lng: -99.31 },
  "santa maría magdalena cahuacán": { lat: 19.671, lng: -99.342 },
  "progreso industrial": { lat: 19.6315, lng: -99.3192 },
  "loma del río": { lat: 19.6248, lng: -99.3221 },
  "santa rosa": { lat: 19.6322, lng: -99.319 },
  "el tráfico": { lat: 19.6429, lng: -99.3132 },
  "centro nicolás romero": { lat: 19.6325, lng: -99.3142 },

  // CDMX (algunas grandes)
  centro: { lat: 19.4326, lng: -99.1332 },
  roma: { lat: 19.4194, lng: -99.158 },
  condesa: { lat: 19.4106, lng: -99.1762 },
  coyoacán: { lat: 19.3499, lng: -99.1619 },
  iztapalapa: { lat: 19.3574, lng: -99.0892 },
  tlalpan: { lat: 19.2934, lng: -99.1665 },
  xochimilco: { lat: 19.2576, lng: -99.1037 },
  azcapotzalco: { lat: 19.4839, lng: -99.184 },
};

const VALLE_DE_MEXICO_CENTER: ColoniaCoord = { lat: 19.4326, lng: -99.1332 };

export function coordParaColonia(colonia: string | null): ColoniaCoord {
  if (!colonia) return VALLE_DE_MEXICO_CENTER;
  const key = colonia.trim().toLowerCase();
  if (COLONIAS_BASE[key]) return COLONIAS_BASE[key];
  for (const [k, v] of Object.entries(COLONIAS_BASE)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  // Pequeño jitter alrededor del centro del Valle para no apilar todo en un punto
  const jitter = () => (Math.random() - 0.5) * 0.05;
  return {
    lat: VALLE_DE_MEXICO_CENTER.lat + jitter(),
    lng: VALLE_DE_MEXICO_CENTER.lng + jitter(),
  };
}

export const VALLE_CENTER = VALLE_DE_MEXICO_CENTER;
