import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { contarTandeosRecientes } from "../repositories/reportesRepo.js";
import { guardarPrediccion } from "../repositories/prediccionesRepo.js";
import { obtenerNivelCutzamala } from "./cutzamala.js";
import { prediccionHeuristica } from "./prediccionHeuristica.js";

/**
 * Predicción de tandeos con el modelo de regresión logística entrenado en
 * scikit-learn (ver carpeta /model). El bot hace solo la inferencia leyendo
 * model/modelo_tandeos.json (sin Python en producción). Si el modelo no está
 * disponible, cae de forma transparente a una heurística interpretable.
 */

export interface ResultadoPrediccion {
  probabilidad: number;
  mensaje: string;
  factor_principal: string;
}

const VENTANA_HORAS = 72;

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODEL_DIR = join(__dirname, "..", "..", "model");

interface ModeloJSON {
  features: string[];
  scaler_mean: number[];
  scaler_scale: number[];
  coef: number[];
  intercept: number;
  metricas: { auc_roc_test: number };
}

interface ColoniasJSON {
  riesgo_municipios: Record<string, number>;
  colonia_a_municipio: Record<string, string>;
  riesgo_default: number;
}

let modeloPromesa: Promise<ModeloJSON | null> | null = null;
let coloniasPromesa: Promise<ColoniasJSON | null> | null = null;

function cargarModelo(): Promise<ModeloJSON | null> {
  if (!modeloPromesa) {
    modeloPromesa = readFile(join(MODEL_DIR, "modelo_tandeos.json"), "utf-8")
      .then((t) => JSON.parse(t) as ModeloJSON)
      .catch((err) => {
        console.error("Modelo predictivo no disponible, uso heurística:", err);
        return null;
      });
  }
  return modeloPromesa;
}

function cargarColonias(): Promise<ColoniasJSON | null> {
  if (!coloniasPromesa) {
    coloniasPromesa = readFile(join(MODEL_DIR, "colonias_riesgo.json"), "utf-8")
      .then((t) => JSON.parse(t) as ColoniasJSON)
      .catch(() => null);
  }
  return coloniasPromesa;
}

function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function resolverRiesgoMunicipio(
  colonia: string,
  cat: ColoniasJSON | null,
): { riesgo: number; conocida: boolean } {
  if (!cat) return { riesgo: 0.6, conocida: false };
  const n = normalizar(colonia);

  // 1) coincidencia exacta de colonia
  for (const [col, muni] of Object.entries(cat.colonia_a_municipio)) {
    if (normalizar(col) === n) {
      return { riesgo: cat.riesgo_municipios[muni] ?? cat.riesgo_default, conocida: true };
    }
  }
  // 2) el texto del usuario menciona un municipio conocido
  for (const [muni, riesgo] of Object.entries(cat.riesgo_municipios)) {
    if (n.includes(normalizar(muni.replace(/\(.*\)/, "")).trim())) {
      return { riesgo, conocida: true };
    }
  }
  // 3) coincidencia parcial de nombre de colonia
  for (const [col, muni] of Object.entries(cat.colonia_a_municipio)) {
    const nc = normalizar(col);
    if (n.includes(nc) || nc.includes(n)) {
      return { riesgo: cat.riesgo_municipios[muni] ?? cat.riesgo_default, conocida: true };
    }
  }
  return { riesgo: cat.riesgo_default, conocida: false };
}

function partesMexico(): { dow: number; hora: number; mes: number } {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    month: "numeric",
    hour: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const p = Object.fromEntries(
    f.formatToParts(new Date()).map((x) => [x.type, x.value]),
  );
  const mapaPy: Record<string, number> = {
    Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
  };
  const dow = mapaPy[p.weekday as string] ?? 0;
  const hora = Number(p.hour) % 24;
  const mes = Number(p.month);
  return { dow, hora, mes };
}

function sigmoide(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function nivelDescriptivo(p: number): string {
  if (p < 0.35) return "baja";
  if (p < 0.65) return "media";
  return "alta";
}

export function recomendacionPara(p: number): string {
  if (p < 0.35) {
    return "Aprovecha que la probabilidad es baja para hacer pendientes que requieren agua, pero mantén un mínimo de reserva.";
  }
  if (p < 0.65) {
    return "Llena cubetas y garrafones por si baja la presión. Evita lavadoras o riego en estos días.";
  }
  return "Llena tinaco, cubetas y garrafones cuanto antes. Es muy probable que se vaya el agua en las próximas horas.";
}

export function ventanaHoras(): number {
  return VENTANA_HORAS;
}

function explicarFactor(
  features: string[],
  contribuciones: number[],
  ctx: { cutzamalaPct: number; reportes: number; colonia: string },
): string {
  // Mayor empuje POSITIVO al riesgo entre variables interpretables.
  const idx = (name: string) => features.indexOf(name);
  const candidatos: Array<{ etiqueta: string; valor: number }> = [
    {
      etiqueta: `nivel bajo del Sistema Cutzamala (${ctx.cutzamalaPct}% de almacenamiento)`,
      valor: contribuciones[idx("cutzamala_pct")] ?? -Infinity,
    },
    {
      etiqueta: `zona de alta incidencia histórica de tandeos (${ctx.colonia})`,
      valor: contribuciones[idx("riesgo_municipio")] ?? -Infinity,
    },
    {
      etiqueta:
        ctx.reportes > 0
          ? `${ctx.reportes} reporte(s) ciudadano(s) de tandeo recientes en ${ctx.colonia}`
          : "reportes ciudadanos recientes",
      valor: contribuciones[idx("reportes_7d")] ?? -Infinity,
    },
    {
      etiqueta: "temporada y estacionalidad del Valle de México",
      valor:
        (contribuciones[idx("mes_sin")] ?? 0) +
        (contribuciones[idx("mes_cos")] ?? 0),
    },
    {
      etiqueta: "día y hora de mayor incidencia",
      valor:
        (contribuciones[idx("dow_sin")] ?? 0) +
        (contribuciones[idx("dow_cos")] ?? 0) +
        (contribuciones[idx("hora_sin")] ?? 0) +
        (contribuciones[idx("hora_cos")] ?? 0),
    },
  ];
  candidatos.sort((a, b) => b.valor - a.valor);
  return candidatos[0].valor > 0
    ? candidatos[0].etiqueta
    : "combinación de factores moderados (sin un detonante dominante)";
}

export async function calcularPrediccion(
  colonia: string,
): Promise<ResultadoPrediccion> {
  const modelo = await cargarModelo();

  // ---- Respaldo transparente: heurística si no hay modelo ----
  if (!modelo) {
    const h = await prediccionHeuristica(colonia);
    const mensaje = `Probabilidad ${nivelDescriptivo(h.probabilidad)} de corte de agua en ${colonia} en las próximas ${VENTANA_HORAS} horas.`;
    await guardarPrediccion({
      colonia,
      probabilidad_corte: h.probabilidad,
      ventana_horas: VENTANA_HORAS,
    }).catch((err) => console.error("No se pudo guardar la predicción:", err));
    return { probabilidad: h.probabilidad, mensaje, factor_principal: h.factor_principal };
  }

  // ---- Inferencia con el modelo de regresión logística ----
  const cat = await cargarColonias();
  const { riesgo } = resolverRiesgoMunicipio(colonia, cat);
  const nivelCutz = await obtenerNivelCutzamala();
  const reportes7d = await contarTandeosRecientes(colonia, 7).catch(() => 0);
  const { dow, hora, mes } = partesMexico();

  const valores: Record<string, number> = {
    dow_sin: Math.sin((2 * Math.PI * dow) / 7),
    dow_cos: Math.cos((2 * Math.PI * dow) / 7),
    hora_sin: Math.sin((2 * Math.PI * hora) / 24),
    hora_cos: Math.cos((2 * Math.PI * hora) / 24),
    mes_sin: Math.sin((2 * Math.PI * mes) / 12),
    mes_cos: Math.cos((2 * Math.PI * mes) / 12),
    cutzamala_pct: nivelCutz.porcentaje,
    riesgo_municipio: riesgo,
    reportes_7d: reportes7d,
  };

  let logit = modelo.intercept;
  const contribuciones: number[] = [];
  modelo.features.forEach((f, i) => {
    const x = valores[f] ?? 0;
    const z = (x - modelo.scaler_mean[i]) / modelo.scaler_scale[i];
    const c = modelo.coef[i] * z;
    contribuciones.push(c);
    logit += c;
  });

  const probabilidad = Math.max(0, Math.min(1, sigmoide(logit)));
  const factor_principal = explicarFactor(modelo.features, contribuciones, {
    cutzamalaPct: nivelCutz.porcentaje,
    reportes: reportes7d,
    colonia,
  });
  const mensaje = `Probabilidad ${nivelDescriptivo(probabilidad)} de corte de agua en ${colonia} en las próximas ${VENTANA_HORAS} horas.`;

  await guardarPrediccion({
    colonia,
    probabilidad_corte: probabilidad,
    ventana_horas: VENTANA_HORAS,
  }).catch((err) => console.error("No se pudo guardar la predicción:", err));

  return { probabilidad, mensaje, factor_principal };
}
