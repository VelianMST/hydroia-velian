/**
 * Programas de tandeo / reducción de caudal ANUNCIADOS públicamente
 * (CONAGUA, SACMEX, CAEM). Información pública documentada y citada — no
 * inventada. Se usa como "historial de cortes anunciados" para cruzarlo con
 * los reportes ciudadanos (Matriz de innovación del documento).
 *
 * El job de ingesta intenta refrescar esta capa de forma best-effort; si no
 * hay una fuente abierta estable disponible, esta semilla curada y citada
 * sostiene el indicador (transparente: fuente y vigencia explícitas).
 *
 * `severidad`: 0–1 (intensidad del programa).
 * `fin`: null = vigente / sistémico documentado.
 */

export interface ProgramaTandeo {
  zonas: string[]; // municipios/alcaldías normalizados (ver utils/geo)
  inicio: string; // ISO
  fin: string | null; // ISO o null si vigente/sistémico
  severidad: number;
  descripcion: string;
  fuente: string;
}

/**
 * Zona REAL de cobertura del Sistema Cutzamala (CDMX + conurbados del Edomex).
 * Un programa "del Cutzamala" solo aplica a estos municipios/alcaldías — NO a
 * ciudades fuera del Valle de México (p. ej. Guadalajara o Monterrey).
 */
export const ZONA_CUTZAMALA: string[] = [
  // CDMX (alcaldías abastecidas por Cutzamala)
  "alvaro obregon",
  "azcapotzalco",
  "benito juarez",
  "coyoacan",
  "cuajimalpa",
  "cuauhtemoc",
  "gustavo a madero",
  "iztacalco",
  "iztapalapa",
  "magdalena contreras",
  "miguel hidalgo",
  "tlalpan",
  "venustiano carranza",
  // Estado de México (conurbados)
  "naucalpan",
  "tlalnepantla",
  "ecatepec",
  "nicolas romero",
  "atizapan de zaragoza",
  "cuautitlan izcalli",
  "tultitlan",
  "chimalhuacan",
  "huixquilucan",
  "coacalco",
  "nezahualcoyotl",
  "la paz",
  "tecamac",
];

export const PROGRAMAS_TANDEO: ProgramaTandeo[] = [
  {
    zonas: ZONA_CUTZAMALA,
    inicio: "2023-10-01",
    fin: null,
    severidad: 0.7,
    descripcion:
      "Reducción de caudal del Sistema Cutzamala por bajo almacenamiento; afecta zonas abastecidas por Cutzamala en CDMX y Edomex.",
    fuente: "CONAGUA — anuncios de reducción de caudal Cutzamala 2023–2024",
  },
  {
    zonas: [
      "alvaro obregon",
      "azcapotzalco",
      "benito juarez",
      "coyoacan",
      "cuajimalpa",
      "gustavo a madero",
      "iztapalapa",
      "magdalena contreras",
      "miguel hidalgo",
      "tlalpan",
    ],
    inicio: "2024-01-29",
    fin: "2024-09-30",
    severidad: 0.85,
    descripcion:
      "Programa emergente de tandeo de SACMEX en alcaldías de CDMX abastecidas por el Cutzamala durante el estiaje 2024.",
    fuente: "SACMEX — Programa emergente de tandeo 2024 (prensa nacional)",
  },
  {
    zonas: [
      "naucalpan",
      "tlalnepantla",
      "ecatepec",
      "nicolas romero",
      "atizapan de zaragoza",
      "cuautitlan izcalli",
      "tultitlan",
      "chimalhuacan",
    ],
    inicio: "2023-06-01",
    fin: null,
    severidad: 0.8,
    descripcion:
      "Tandeos sistemáticos en municipios conurbados del Estado de México por reducción del Cutzamala y sobreexplotación del acuífero (CAEM/organismos operadores).",
    fuente: "CAEM / organismos operadores municipales — comunicados 2023–2025",
  },
];
