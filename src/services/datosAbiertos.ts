import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import cron from "node-cron";
import { guardarDato } from "../repositories/datosAbiertosRepo.js";
import { PROGRAMAS_TANDEO, type ProgramaTandeo } from "../data/sacmex_tandeos.js";

/**
 * Ingesta de DATOS ABIERTOS (CONAGUA / SACMEX) — automática pero NO frágil.
 *
 * - Cutzamala: intenta fuentes públicas; valida; si fallan usa el ancla
 *   documentada de CONAGUA (model/cutzamala_actual.json, actualizable a
 *   mano con el boletín semanal). Siempre persiste algo, con su 'fuente'
 *   y 'confiable' explícitos (transparencia).
 * - SACMEX: capa curada y citada (sin API abierta estable); el job registra
 *   el estado de los programas de tandeo vigentes.
 *
 * Corre 1×/día por cron + una vez al arrancar + script manual.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODEL_DIR = join(__dirname, "..", "..", "model");
const ANCLA_PATH = join(MODEL_DIR, "cutzamala_actual.json");

const FETCH_TIMEOUT_MS = 9000;
const UA =
  "HydroIA-Velian/1.0 (Premio Nacional Juvenil del Agua 2026; uso ciudadano sin fines de lucro)";

function rangoValido(pct: number): boolean {
  return Number.isFinite(pct) && pct > 0 && pct <= 100;
}

async function fetchSinaCutzamala(): Promise<number | null> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(
      "https://sina.conagua.gob.mx/sina/almacenamientoPrincipalesPresas.php",
      {
        signal: controller.signal,
        headers: { "User-Agent": UA, "Accept-Language": "es" },
      },
    );
    if (!resp.ok) return null;
    const txt = await resp.text();
    let datos: unknown;
    try {
      datos = JSON.parse(txt);
    } catch {
      return null; // la fuente devolvió HTML/redirect: no fiable hoy
    }
    if (!Array.isArray(datos)) return null;
    const presas = ["valle de bravo", "villa victoria", "el bosque"];
    let alm = 0;
    let cap = 0;
    for (const f of datos as Array<Record<string, unknown>>) {
      const nombre = String(
        f.nombreoficial ?? f.nombrecomun ?? f.nombre ?? "",
      ).toLowerCase();
      if (presas.some((p) => nombre.includes(p))) {
        const a = Number(f.almacenaactual ?? f.almacena ?? 0);
        const c = Number(f.namoalmac ?? f.capacidad ?? 0);
        if (Number.isFinite(a) && Number.isFinite(c) && c > 0) {
          alm += a;
          cap += c;
        }
      }
    }
    if (cap <= 0) return null;
    const pct = (alm / cap) * 100;
    return rangoValido(pct) ? Math.round(pct * 100) / 100 : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function anclaDocumentada(): Promise<{ pct: number; fecha: string } | null> {
  try {
    const j = JSON.parse(await readFile(ANCLA_PATH, "utf-8")) as {
      porcentaje?: number;
      fecha?: string;
    };
    if (typeof j.porcentaje === "number" && rangoValido(j.porcentaje)) {
      return { pct: j.porcentaje, fecha: j.fecha ?? "" };
    }
  } catch {
    /* sin ancla local */
  }
  return null;
}

export interface ResultadoCutzamala {
  valor: number;
  fuente: string;
  confiable: boolean;
}

export async function actualizarCutzamala(): Promise<ResultadoCutzamala | null> {
  // 1) Fuente automática (SINA/CONAGUA)
  const sina = await fetchSinaCutzamala();
  if (sina !== null) {
    const r = {
      valor: sina,
      fuente: "CONAGUA / SINA (lectura automática)",
      confiable: true,
    };
    await guardarDato({
      indicador: "cutzamala_pct",
      valor: r.valor,
      fuente: r.fuente,
      confiable: true,
    });
    return r;
  }
  // 2) Ancla documentada de CONAGUA (boletín; actualizable a mano)
  const ancla = await anclaDocumentada();
  if (ancla) {
    const r = {
      valor: ancla.pct,
      fuente: `CONAGUA — boletín Sistema Cutzamala${ancla.fecha ? ` (${ancla.fecha})` : ""}`,
      confiable: true,
    };
    await guardarDato({
      indicador: "cutzamala_pct",
      valor: r.valor,
      fuente: r.fuente,
      confiable: true,
    });
    return r;
  }
  return null;
}

// ---------- SACMEX ----------

function programasVigentes(fecha = new Date()): ProgramaTandeo[] {
  const t = fecha.getTime();
  return PROGRAMAS_TANDEO.filter((p) => {
    const ini = new Date(p.inicio).getTime();
    const fin = p.fin ? new Date(p.fin).getTime() : Infinity;
    return t >= ini - 30 * 86400000 && t <= fin + 60 * 86400000;
  });
}

/** Factor 0–1 del historial de cortes SACMEX para un municipio. */
export function factorSacmex(municipioNorm: string, fecha = new Date()): number {
  let max = 0;
  for (const p of programasVigentes(fecha)) {
    if (p.zonas.includes(municipioNorm)) {
      const fin = p.fin ? new Date(p.fin).getTime() : Infinity;
      const dias =
        fin === Infinity ? 0 : (Date.now() - fin) / 86400000;
      const decaimiento = dias <= 0 ? 1 : Math.max(0, 1 - dias / 60);
      max = Math.max(max, p.severidad * decaimiento);
    }
  }
  return Math.min(1, max);
}

/** Programa SACMEX más relevante (vigente) para mostrar al usuario. */
export function programaSacmexActivo(
  municipioNorm: string,
): ProgramaTandeo | null {
  const cand = programasVigentes()
    .filter((p) => p.zonas.includes(municipioNorm))
    .sort((a, b) => b.severidad - a.severidad);
  return cand[0] ?? null;
}

export async function actualizarSacmex(): Promise<void> {
  const vigentes = programasVigentes();
  await guardarDato({
    indicador: "sacmex_tandeo",
    valor: vigentes.length,
    texto:
      vigentes.length > 0
        ? vigentes.map((p) => p.descripcion).join(" | ")
        : "Sin programas de tandeo vigentes documentados.",
    fuente: "SACMEX / CONAGUA / CAEM — comunicados públicos (capa curada)",
    confiable: true,
  });
}

// ---------- Orquestación ----------

export async function ingestaDiaria(): Promise<void> {
  try {
    const cutz = await actualizarCutzamala();
    console.log(
      cutz
        ? `📊 Datos abiertos: Cutzamala ${cutz.valor}% — ${cutz.fuente}`
        : "📊 Datos abiertos: Cutzamala no disponible (se conserva el último valor).",
    );
    await actualizarSacmex();
    console.log("📊 Datos abiertos: capa SACMEX actualizada.");
  } catch (err) {
    console.error("Ingesta de datos abiertos falló:", err);
  }
}

export function programarIngesta(): void {
  // Al arrancar (datos frescos para la demo) + diario 05:00 CDMX.
  ingestaDiaria().catch((e) => console.error("Ingesta inicial falló:", e));
  cron.schedule("0 5 * * *", () => void ingestaDiaria(), {
    timezone: "America/Mexico_City",
  });
}
