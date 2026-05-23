"use client";

import { useState } from "react";
import { BarChart3, Info, AlertTriangle, ChevronDown } from "lucide-react";
import { MUNICIPIOS } from "@/lib/municipios";

interface Transparencia {
  cutzamala_pct: number;
  cutzamala_fecha: string;
  cutzamala_fuente: string;
  reportes_7d: number;
  riesgo_zona: number;
  zona_conocida: boolean;
  auc_roc: number;
}
interface Resultado {
  probabilidad: number;
  nivel: "baja" | "media" | "alta";
  mensaje: string;
  factor_principal: string;
  recomendacion: string;
  ventana_horas: number;
  colonia: string;
  transparencia: Transparencia;
}

const COLORES: Record<Resultado["nivel"], { txt: string; bg: string; ring: string; etiqueta: string }> = {
  baja: { txt: "text-emerald-600", bg: "bg-emerald-500", ring: "stroke-emerald-500", etiqueta: "Baja" },
  media: { txt: "text-amber-600", bg: "bg-amber-500", ring: "stroke-amber-500", etiqueta: "Media" },
  alta: { txt: "text-red-600", bg: "bg-red-500", ring: "stroke-red-500", etiqueta: "Alta" },
};

function Medidor({ pct, nivel }: { pct: number; nivel: Resultado["nivel"] }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} className="fill-none stroke-slate-200" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          className={`fill-none ${COLORES[nivel].ring}`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${COLORES[nivel].txt}`}>{pct}%</span>
        <span className="text-xs text-slate-500">probabilidad</span>
      </div>
    </div>
  );
}

export default function PrediccionForm() {
  const [colonia, setColonia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [cargando, setCargando] = useState(false);
  const [res, setRes] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verDetalle, setVerDetalle] = useState(false);

  async function calcular(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (colonia.trim().length < 2) return setError("Escribe tu colonia.");
    setCargando(true);
    setRes(null);
    try {
      const r = await fetch("/api/prediccion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colonia, municipio }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) setError(data.error ?? "No se pudo calcular.");
      else setRes(data.resultado as Resultado);
    } catch {
      setError("No hay conexión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  const pct = res ? Math.round(res.probabilidad * 100) : 0;

  return (
    <div className="space-y-6">
      <form onSubmit={calcular} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="colonia" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Colonia
            </label>
            <input
              id="colonia"
              value={colonia}
              onChange={(e) => setColonia(e.target.value)}
              maxLength={80}
              placeholder="Ej. Lomas de San Miguel"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 outline-none"
            />
          </div>
          <div>
            <label htmlFor="municipio" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Municipio o alcaldía
            </label>
            <input
              id="municipio"
              list="lista-municipios-pred"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              maxLength={80}
              placeholder="Ej. Nicolás Romero"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 outline-none"
            />
            <datalist id="lista-municipios-pred">
              {MUNICIPIOS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full inline-flex items-center justify-center gap-2 bg-[color:var(--color-primary)] text-white font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-60"
        >
          <BarChart3 className="w-4 h-4" aria-hidden />
          {cargando ? "Calculando…" : "Calcular predicción"}
        </button>
      </form>

      {res && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <Medidor pct={pct} nivel={res.nivel} />
          <div className="text-center">
            <p className={`text-lg font-semibold ${COLORES[res.nivel].txt}`}>
              Probabilidad {COLORES[res.nivel].etiqueta} de corte
            </p>
            <p className="text-sm text-slate-600 mt-1">
              En {res.colonia}, próximas {res.ventana_horas} horas.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
              Factor principal
            </p>
            <p className="text-sm text-slate-700">{res.factor_principal}</p>
          </div>

          <div className="rounded-xl bg-[color:var(--color-primary)]/5 border border-[color:var(--color-primary)]/15 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-primary)] mb-1">
              Qué te conviene hacer
            </p>
            <p className="text-sm text-slate-700">{res.recomendacion}</p>
          </div>

          <button
            onClick={() => setVerDetalle((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-[color:var(--color-primary)]"
          >
            <Info className="w-4 h-4" aria-hidden />
            ¿Cómo se calcula?
            <ChevronDown className={`w-4 h-4 transition ${verDetalle ? "rotate-180" : ""}`} aria-hidden />
          </button>

          {verDetalle && (
            <div className="rounded-xl border border-slate-100 p-4 text-sm text-slate-600 space-y-2">
              <p>El modelo combinó, en tiempo real:</p>
              <ul className="space-y-1.5">
                <li className="flex justify-between gap-4 border-b border-slate-50 pb-1.5">
                  <span>Nivel del Sistema Cutzamala</span>
                  <span className="font-medium text-slate-800">{res.transparencia.cutzamala_pct}%</span>
                </li>
                <li className="flex justify-between gap-4 border-b border-slate-50 pb-1.5">
                  <span>Reportes de tandeo (7 días) en tu zona</span>
                  <span className="font-medium text-slate-800">{res.transparencia.reportes_7d}</span>
                </li>
                <li className="flex justify-between gap-4 border-b border-slate-50 pb-1.5">
                  <span>Riesgo histórico de la zona</span>
                  <span className="font-medium text-slate-800">
                    {Math.round(res.transparencia.riesgo_zona * 100)}%
                    {!res.transparencia.zona_conocida && " (estimado)"}
                  </span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>Día, hora y temporada</span>
                  <span className="font-medium text-slate-800">considerados</span>
                </li>
              </ul>
              <p className="text-xs text-slate-500 pt-1">
                Fuente del Cutzamala: {res.transparencia.cutzamala_fuente} ({res.transparencia.cutzamala_fecha}).
              </p>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
            <p>
              Es una estimación de <strong>tamizaje</strong>, no una garantía. El modelo (regresión
              logística, validado con AUC-ROC {res.transparencia.auc_roc.toFixed(2)}) se entrenó con
              un dataset calibrado con datos públicos reales y se reentrena conforme se acumulan
              reportes ciudadanos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
