/**
 * Catálogo geográfico curado de HydroIA Velian.
 *
 * - COLONIAS_CURADAS: colonias reales (foco Nicolás Romero, zona de mayor uso
 *   del proyecto) con coordenadas aproximadas de centroide. Clave:
 *   `${coloniaNorm}|${municipioNorm}` (ver utils/geo.ts).
 * - MUNICIPIOS_CENTROIDES: centroide de municipios del Valle de México +
 *   principales de México. Respaldo cuando no hay colonia exacta.
 * - ESTADOS_CENTROIDES: centroide de los 32 estados. Último respaldo.
 *
 * Las coordenadas son centroides aproximados (no domicilios) — privacidad por
 * diseño. Para colonias fuera del catálogo se usa Nominatim (OpenStreetMap)
 * en tiempo de ejecución y, si falla, el centroide de municipio/estado.
 */

export interface Coord {
  lat: number;
  lng: number;
}

// Nicolás Romero (Estado de México) y municipios del documento.
export const COLONIAS_CURADAS: Record<string, Coord> = {
  "centro|nicolas romero": { lat: 19.6325, lng: -99.3142 },
  "la colmena|nicolas romero": { lat: 19.6092, lng: -99.3035 },
  "progreso industrial|nicolas romero": { lat: 19.6315, lng: -99.3192 },
  "loma del rio|nicolas romero": { lat: 19.6248, lng: -99.3221 },
  "lomas de san miguel|nicolas romero": { lat: 19.6396, lng: -99.3214 },
  "san jose el vidrio|nicolas romero": { lat: 19.6451, lng: -99.31 },
  "santa maria magdalena cahuacan|nicolas romero": { lat: 19.671, lng: -99.342 },
  "san francisco magu|nicolas romero": { lat: 19.6602, lng: -99.3508 },
  "el trafico|nicolas romero": { lat: 19.6429, lng: -99.3132 },
  "10 de junio|nicolas romero": { lat: 19.6358, lng: -99.3087 },
  "5 de mayo|nicolas romero": { lat: 19.6281, lng: -99.3105 },
  "adolfo lopez mateos|nicolas romero": { lat: 19.6347, lng: -99.3056 },
  "independencia|nicolas romero": { lat: 19.6299, lng: -99.3168 },
  "hidalgo|nicolas romero": { lat: 19.6336, lng: -99.3119 },
  "veracruz|nicolas romero": { lat: 19.6271, lng: -99.3203 },
  "bosques del alba|nicolas romero": { lat: 19.6188, lng: -99.2967 },
  "la concepcion|nicolas romero": { lat: 19.6404, lng: -99.3267 },
  "vista hermosa|nicolas romero": { lat: 19.6225, lng: -99.3251 },
  "himno nacional|nicolas romero": { lat: 19.6362, lng: -99.3041 },
  "francisco sarabia|nicolas romero": { lat: 19.6433, lng: -99.3088 },
  "rio de luz|nicolas romero": { lat: 19.6157, lng: -99.2989 },
  "las maravillas|nicolas romero": { lat: 19.6478, lng: -99.3193 },
  "buenavista|nicolas romero": { lat: 19.6512, lng: -99.3155 },
  "colinas del sol|nicolas romero": { lat: 19.6203, lng: -99.3122 },
  "puerto escondido|nicolas romero": { lat: 19.6589, lng: -99.3271 },

  // Otros municipios del documento (1-2 colonias de referencia)
  "ciudad azteca|ecatepec": { lat: 19.6097, lng: -99.06 },
  "san cristobal|ecatepec": { lat: 19.5847, lng: -99.0476 },
  "el molinito|naucalpan": { lat: 19.481, lng: -99.241 },
  "san juan ixhuatepec|tlalnepantla": { lat: 19.5217, lng: -99.1361 },
  "san lorenzo|chimalhuacan": { lat: 19.4216, lng: -98.954 },
};

// Centroides de municipios (Valle de México + principales de México).
export const MUNICIPIOS_CENTROIDES: Record<string, Coord> = {
  "nicolas romero": { lat: 19.6322, lng: -99.3142 },
  "ecatepec": { lat: 19.6097, lng: -99.06 },
  "ecatepec de morelos": { lat: 19.6097, lng: -99.06 },
  "naucalpan": { lat: 19.4783, lng: -99.237 },
  "naucalpan de juarez": { lat: 19.4783, lng: -99.237 },
  "tlalnepantla": { lat: 19.54, lng: -99.195 },
  "tlalnepantla de baz": { lat: 19.54, lng: -99.195 },
  "chimalhuacan": { lat: 19.4216, lng: -98.954 },
  "tecamac": { lat: 19.7167, lng: -98.9686 },
  "cuautitlan izcalli": { lat: 19.646, lng: -99.212 },
  "atizapan de zaragoza": { lat: 19.557, lng: -99.254 },
  "tultitlan": { lat: 19.645, lng: -99.169 },
  "coacalco": { lat: 19.632, lng: -99.111 },
  "coacalco de berriozabal": { lat: 19.632, lng: -99.111 },
  "nezahualcoyotl": { lat: 19.4003, lng: -99.0145 },
  "chalco": { lat: 19.2647, lng: -98.8975 },
  "ixtapaluca": { lat: 19.3186, lng: -98.882 },
  "valle de chalco": { lat: 19.292, lng: -98.956 },
  "valle de chalco solidaridad": { lat: 19.292, lng: -98.956 },
  "la paz": { lat: 19.3623, lng: -98.949 },
  "huixquilucan": { lat: 19.361, lng: -99.352 },
  "toluca": { lat: 19.2926, lng: -99.657 },
  "metepec": { lat: 19.254, lng: -99.604 },
  "texcoco": { lat: 19.516, lng: -98.883 },
  "cuautitlan": { lat: 19.67, lng: -99.179 },
  "tepotzotlan": { lat: 19.716, lng: -99.223 },
  "zumpango": { lat: 19.795, lng: -99.099 },
  "tultepec": { lat: 19.685, lng: -99.128 },
  "melchor ocampo": { lat: 19.708, lng: -99.145 },
  "atenco": { lat: 19.5425, lng: -98.9123 },
  "acolman": { lat: 19.6336, lng: -98.9123 },

  // Alcaldías CDMX
  "alvaro obregon": { lat: 19.359, lng: -99.203 },
  "azcapotzalco": { lat: 19.484, lng: -99.184 },
  "benito juarez": { lat: 19.3726, lng: -99.1558 },
  "coyoacan": { lat: 19.3499, lng: -99.1619 },
  "cuajimalpa": { lat: 19.359, lng: -99.299 },
  "cuajimalpa de morelos": { lat: 19.359, lng: -99.299 },
  "cuauhtemoc": { lat: 19.445, lng: -99.147 },
  "gustavo a madero": { lat: 19.484, lng: -99.113 },
  "iztacalco": { lat: 19.3953, lng: -99.0975 },
  "iztapalapa": { lat: 19.3574, lng: -99.0892 },
  "magdalena contreras": { lat: 19.332, lng: -99.242 },
  "la magdalena contreras": { lat: 19.332, lng: -99.242 },
  "miguel hidalgo": { lat: 19.428, lng: -99.19 },
  "milpa alta": { lat: 19.192, lng: -99.023 },
  "tlahuac": { lat: 19.287, lng: -99.005 },
  "tlalpan": { lat: 19.2934, lng: -99.1665 },
  "venustiano carranza": { lat: 19.444, lng: -99.1 },
  "xochimilco": { lat: 19.2576, lng: -99.1037 },

  // Principales ciudades/municipios de México (cortesía nacional)
  "guadalajara": { lat: 20.6767, lng: -103.3475 },
  "monterrey": { lat: 25.6866, lng: -100.3161 },
  "puebla": { lat: 19.0414, lng: -98.2063 },
  "queretaro": { lat: 20.5888, lng: -100.3899 },
  "leon": { lat: 21.1219, lng: -101.6833 },
  "tijuana": { lat: 32.5149, lng: -117.0382 },
  "merida": { lat: 20.9674, lng: -89.5926 },
  "cancun": { lat: 21.1619, lng: -86.8515 },
  "aguascalientes": { lat: 21.8853, lng: -102.2916 },
  "san luis potosi": { lat: 22.1565, lng: -100.9855 },
  "morelia": { lat: 19.7008, lng: -101.1844 },
  "culiacan": { lat: 24.8091, lng: -107.394 },
  "hermosillo": { lat: 29.0729, lng: -110.9559 },
  "saltillo": { lat: 25.4232, lng: -101.0053 },
  "veracruz": { lat: 19.1738, lng: -96.1342 },
  "villahermosa": { lat: 17.9892, lng: -92.9475 },
  "tuxtla gutierrez": { lat: 16.7516, lng: -93.1161 },
  "oaxaca": { lat: 17.0732, lng: -96.7266 },
  "oaxaca de juarez": { lat: 17.0732, lng: -96.7266 },
  "chihuahua": { lat: 28.6353, lng: -106.0889 },
  "durango": { lat: 24.0277, lng: -104.6532 },
  "cuernavaca": { lat: 18.9242, lng: -99.2216 },
  "pachuca": { lat: 20.1011, lng: -98.7591 },
  "pachuca de soto": { lat: 20.1011, lng: -98.7591 },
};

// Centroides de los 32 estados (último respaldo).
export const ESTADOS_CENTROIDES: Record<string, Coord> = {
  "aguascalientes": { lat: 21.88, lng: -102.29 },
  "baja california": { lat: 30.37, lng: -115.18 },
  "baja california sur": { lat: 25.59, lng: -111.79 },
  "campeche": { lat: 18.86, lng: -90.32 },
  "coahuila": { lat: 27.31, lng: -102.4 },
  "coahuila de zaragoza": { lat: 27.31, lng: -102.4 },
  "colima": { lat: 19.16, lng: -104.0 },
  "chiapas": { lat: 16.41, lng: -92.43 },
  "chihuahua": { lat: 28.63, lng: -106.07 },
  "ciudad de mexico": { lat: 19.43, lng: -99.13 },
  "durango": { lat: 24.79, lng: -104.66 },
  "guanajuato": { lat: 20.92, lng: -101.09 },
  "guerrero": { lat: 17.55, lng: -99.5 },
  "hidalgo": { lat: 20.49, lng: -98.76 },
  "jalisco": { lat: 20.59, lng: -103.55 },
  "mexico": { lat: 19.36, lng: -99.74 },
  "michoacan": { lat: 19.57, lng: -101.71 },
  "michoacan de ocampo": { lat: 19.57, lng: -101.71 },
  "morelos": { lat: 18.68, lng: -99.1 },
  "nayarit": { lat: 21.75, lng: -104.85 },
  "nuevo leon": { lat: 25.59, lng: -99.99 },
  "oaxaca": { lat: 17.07, lng: -96.72 },
  "puebla": { lat: 19.04, lng: -98.2 },
  "queretaro": { lat: 20.59, lng: -100.39 },
  "quintana roo": { lat: 19.59, lng: -88.07 },
  "san luis potosi": { lat: 22.15, lng: -100.98 },
  "sinaloa": { lat: 25.17, lng: -107.48 },
  "sonora": { lat: 29.3, lng: -110.33 },
  "tabasco": { lat: 17.84, lng: -92.62 },
  "tamaulipas": { lat: 24.27, lng: -98.84 },
  "tlaxcala": { lat: 19.45, lng: -98.2 },
  "veracruz": { lat: 19.18, lng: -96.14 },
  "veracruz de ignacio de la llave": { lat: 19.18, lng: -96.14 },
  "yucatan": { lat: 20.71, lng: -89.09 },
  "zacatecas": { lat: 22.77, lng: -102.58 },
};

// Centro del Valle de México (centro del mapa del dashboard, NO un respaldo
// de ubicación de colonias).
export const VALLE_DE_MEXICO: Coord = { lat: 19.55, lng: -99.23 };

// Lista de municipios sugeridos en el teclado del bot (los del documento).
export const MUNICIPIOS_SUGERIDOS = [
  "Nicolás Romero",
  "Ecatepec",
  "Naucalpan",
  "Tlalnepantla",
  "Chimalhuacán",
] as const;
