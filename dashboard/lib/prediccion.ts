import modelo from "./model/modelo_tandeos.json";
import colonias from "./model/colonias_riesgo.json";
import cutzamalaAncla from "./model/cutzamala_actual.json";
import { supabase } from "./supabase";
import { normalizarNombre } from "./geo";

/**
 * Inferencia del modelo de tandeos en la app — ESPEJO de
 * src/services/prediccion.ts del bot. Misma matemática (regresión logística
 * entrenada en scikit-learn), mismos artefactos (model/*.json). El bot y la app
 * comparten el mismo "cerebro": si reentrenas el modelo y corres `sync:model`,
 * ambos mejoran.
 */

const VENTANA_HORAS = modelo.ventana_horas ?? 72;

export interface Transparencia {
  cutzamala_pct: number;
  cutzamala_fecha: string;
  cutzamala_fuente: string;
  reportes_7d: number;
  riesgo_zona: number;
  zona_conocida: boolean;
  dow: number;
  hora: number;
  mes: number;
  auc_roc: number;
}

export interface ResultadoPrediccion {
  probabilidad: number;
  nivel: "baja" | "media" | "alta";
  mensaje: string;
  factor_principal: string;
  recomendacion: string;
  ventana_horas: number;
  colonia: string;
  transparencia: Transparencia;
}

/** Normalización para casar con las llaves de colonias_riesgo.json
 *  (solo minúsculas + sin acentos, conserva el resto). Igual que el bot. */
function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function resolverRiesgoMunicipio(texto: string): { riesgo: number; conocida: boolean } {
  const n = normalizar(texto);

  // 1) coincidencia exacta de colonia
  for (const [col, muni] of Object.entries(colonias.colonia_a_municipio)) {
    if (normalizar(col) === n) {
      return {
        riesgo: colonias.riesgo_municipios[muni as keyof typeof colonias.riesgo_municipios] ?? colonias.riesgo_default,
        conocida: true,
      };
    }
  }
  // 2) el texto menciona un municipio conocido (ignorando sufijos como "(CDMX)")
  for (const [muni, riesgo] of Object.entries(colonias.riesgo_municipios)) {
    if (n.includes(normalizar(muni.replace(/\(.*\)/, "")).trim())) {
      return { riesgo, conocida: true };
    }
  }
  // 3) coincidencia parcial de nombre de colonia
  for (const [col, muni] of Object.entries(colonias.colonia_a_municipio)) {
    const nc = normalizar(col);
    if (nc && (n.includes(nc) || nc.includes(n))) {
      return {
        riesgo: colonias.riesgo_municipios[muni as keyof typeof colonias.riesgo_municipios] ?? colonias.riesgo_default,
        conocida: true,
      };
    }
  }
  return { riesgo: colonias.riesgo_default, conocida: false };
}

function partesMexico(): { dow: number; hora: number; mes: number } {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    month: "numeric",
    hour: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const p = Object.fromEntries(f.formatToParts(new Date()).map((x) => [x.type, x.value]));
  const mapaPy: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  const dow = mapaPy[p.weekday as string] ?? 0;
  const hora = Number(p.hour) % 24;
  const mes = Number(p.month);
  return { dow, hora, mes };
}

function sigmoide(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function nivelDescriptivo(p: number): "baja" | "media" | "alta" {
  if (p < 0.35) return "baja";
  if (p < 0.65) return "media";
  return "alta";
}

function recomendacionPara(p: number): string {
  if (p < 0.35) {
    return "Aprovecha que la probabilidad es baja para hacer pendientes que requieren agua, pero mantén un mínimo de reserva.";
  }
  if (p < 0.65) {
    return "Llena cubetas y garrafones por si baja la presión. Evita lavadoras o riego en estos días.";
  }
  return "Llena tinaco, cubetas y garrafones cuanto antes. Es muy probable que se vaya el agua en las próximas horas.";
}

function explicarFactor(
  contribuciones: number[],
  ctx: { cutzamalaPct: number; reportes: number; zona: string },
): string {
  const idx = (name: string) => modelo.features.indexOf(name);
  const candidatos: Array<{ etiqueta: string; valor: number }> = [
    {
      etiqueta: `nivel del Sistema Cutzamala (${ctx.cutzamalaPct}% de almacenamiento)`,
      valor: contribuciones[idx("cutzamala_pct")] ?? -Infinity,
    },
    {
      etiqueta: `zona de alta incidencia histórica de tandeos (${ctx.zona})`,
      valor: contribuciones[idx("riesgo_municipio")] ?? -Infinity,
    },
    {
      etiqueta:
        ctx.reportes > 0
          ? `${ctx.reportes} reporte(s) ciudadano(s) de tandeo recientes en ${ctx.zona}`
          : "reportes ciudadanos recientes",
      valor: contribuciones[idx("reportes_7d")] ?? -Infinity,
    },
    {
      etiqueta: "temporada y estacionalidad del Valle de México",
      valor: (contribuciones[idx("mes_sin")] ?? 0) + (contribuciones[idx("mes_cos")] ?? 0),
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

interface Cutzamala {
  porcentaje: number;
  fecha: string;
  fuente: string;
}

async function obtenerCutzamala(): Promise<Cutzamala> {
  try {
    const { data } = await supabase
      .from("datos_abiertos")
      .select("valor, fecha, fuente")
      .eq("indicador", "cutzamala_pct")
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data && typeof data.valor === "number" && data.valor > 0 && data.valor <= 100) {
      return {
        porcentaje: data.valor,
        fecha: String(data.fecha).slice(0, 10),
        fuente: data.fuente ?? "datos abiertos",
      };
    }
  } catch {
    /* respaldo al ancla local */
  }
  const a = cutzamalaAncla as { porcentaje: number; fecha: string; fuente: string };
  if (a && typeof a.porcentaje === "number") {
    return { porcentaje: a.porcentaje, fecha: a.fecha, fuente: a.fuente };
  }
  return { porcentaje: 50, fecha: "n/d", fuente: "Valor por defecto documentado" };
}

async function reportesTandeo7d(coloniaNorm: string): Promise<number> {
  try {
    const desde = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("reportes")
      .select("id", { count: "exact", head: true })
      .eq("colonia_norm", coloniaNorm)
      .eq("tipo", "tandeo")
      .gte("fecha", desde);
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function calcularPrediccionApp(
  colonia: string,
  municipio: string,
): Promise<ResultadoPrediccion> {
  const zonaTexto = `${colonia} ${municipio}`.trim();
  const { riesgo, conocida } = resolverRiesgoMunicipio(zonaTexto);
  const cutz = await obtenerCutzamala();
  const reportes7d = await reportesTandeo7d(normalizarNombre(colonia));
  const { dow, hora, mes } = partesMexico();

  const valores: Record<string, number> = {
    dow_sin: Math.sin((2 * Math.PI * dow) / 7),
    dow_cos: Math.cos((2 * Math.PI * dow) / 7),
    hora_sin: Math.sin((2 * Math.PI * hora) / 24),
    hora_cos: Math.cos((2 * Math.PI * hora) / 24),
    mes_sin: Math.sin((2 * Math.PI * mes) / 12),
    mes_cos: Math.cos((2 * Math.PI * mes) / 12),
    cutzamala_pct: cutz.porcentaje,
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
  const nivel = nivelDescriptivo(probabilidad);
  const factor_principal = explicarFactor(contribuciones, {
    cutzamalaPct: cutz.porcentaje,
    reportes: reportes7d,
    zona: municipio || colonia,
  });

  return {
    probabilidad,
    nivel,
    mensaje: `Probabilidad ${nivel} de corte de agua en ${colonia} en las próximas ${VENTANA_HORAS} horas.`,
    factor_principal,
    recomendacion: recomendacionPara(probabilidad),
    ventana_horas: VENTANA_HORAS,
    colonia,
    transparencia: {
      cutzamala_pct: cutz.porcentaje,
      cutzamala_fecha: cutz.fecha,
      cutzamala_fuente: cutz.fuente,
      reportes_7d: reportes7d,
      riesgo_zona: riesgo,
      zona_conocida: conocida,
      dow,
      hora,
      mes,
      auc_roc: modelo.metricas?.auc_roc_test ?? 0.8,
    },
  };
}
