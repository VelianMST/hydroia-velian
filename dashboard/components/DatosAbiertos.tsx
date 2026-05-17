"use client";

import { Database, Droplet } from "lucide-react";
import { fechaRelativa } from "@/lib/format";
import type { DatosAbiertos } from "@/lib/queries";

function colorCutzamala(pct: number): string {
  if (pct < 40) return "#EF4444";
  if (pct < 60) return "#F59E0B";
  return "#10B981";
}

export default function DatosAbiertos({
  datos,
  cargando,
}: {
  datos: DatosAbiertos | null;
  cargando: boolean;
}) {
  const cutz = datos?.cutzamala ?? null;
  const sac = datos?.sacmex ?? null;

  // Antes de correr la migración o la primera ingesta no hay datos: ocultar.
  if (!cargando && !cutz && !sac) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-[color:var(--color-primary)]" aria-hidden />
          <h3 className="text-sm font-semibold text-[color:var(--color-primary)]">
            Datos abiertos — cruce automático con fuentes oficiales
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Cutzamala */}
          <div className="rounded-xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 mb-2">
              <Droplet className="w-3.5 h-3.5" aria-hidden />
              Sistema Cutzamala
            </div>
            {cargando && !cutz ? (
              <div className="h-9 w-24 bg-slate-200 rounded animate-pulse" />
            ) : cutz?.valor != null ? (
              <>
                <p
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: colorCutzamala(cutz.valor) }}
                >
                  {cutz.valor.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500 mt-1">almacenamiento</p>
              </>
            ) : (
              <p className="text-sm text-slate-400">Sin dato</p>
            )}
          </div>

          {/* Fuente / frescura */}
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
              Fuente
            </p>
            <p className="text-sm text-slate-700">{cutz?.fuente ?? "—"}</p>
            {cutz?.fecha && (
              <p className="text-xs text-slate-400 mt-1">
                Actualizado {fechaRelativa(cutz.fecha)}
                {cutz.confiable === false ? " · valor aproximado" : ""}
              </p>
            )}
          </div>

          {/* SACMEX */}
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
              Programas de tandeo (SACMEX/CONAGUA)
            </p>
            {sac ? (
              <>
                <p className="text-sm text-slate-700">
                  {sac.valor && sac.valor > 0
                    ? `${sac.valor} programa(s) documentado(s) vigente(s)`
                    : "Sin programas vigentes documentados"}
                </p>
                {sac.texto && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-3">
                    {sac.texto}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400">Sin dato</p>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-4">
          Información pública (CONAGUA · SACMEX · CAEM) ingerida automáticamente
          y cruzada con los reportes ciudadanos. El valor del Cutzamala se
          actualiza a diario; los programas de tandeo provienen de comunicados
          oficiales documentados.
        </p>
      </div>
    </section>
  );
}
