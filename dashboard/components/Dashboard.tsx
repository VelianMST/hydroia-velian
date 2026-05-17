"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Droplets, MapPin, Users } from "lucide-react";
import KPICard from "./KPICard";
import MapWrapper from "./MapWrapper";
import ReportesPorColoniaChart from "./ReportesPorColoniaChart";
import RiesgoChart from "./RiesgoChart";
import RecentReportsTable from "./RecentReportsTable";
import DatosAbiertosPanel from "./DatosAbiertos";
import {
  obtenerDiagnosticos,
  obtenerEstadisticas,
  obtenerReportes,
  obtenerDatosAbiertos,
  agruparReportesPorColonia,
  type Estadisticas,
  type ReportesPorColonia,
  type DistribucionRiesgo,
  type DatosAbiertos,
} from "@/lib/queries";
import type { DiagnosticoPublico, ReportePublico } from "@/lib/supabase";

const REFRESH_MS = 60_000;

export default function Dashboard() {
  const [reportes, setReportes] = useState<ReportePublico[] | null>(null);
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoPublico[] | null>(null);
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [datosAbiertos, setDatosAbiertos] = useState<DatosAbiertos | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const [r, d, s, da] = await Promise.all([
        obtenerReportes(),
        obtenerDiagnosticos(),
        obtenerEstadisticas(),
        obtenerDatosAbiertos(),
      ]);
      setReportes(r);
      setDiagnosticos(d);
      setStats(s);
      setDatosAbiertos(da);
      setError(null);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError(
        "No se pudieron cargar los datos públicos. Revisa que Supabase tenga lectura pública habilitada.",
      );
    }
  }, []);

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, REFRESH_MS);
    return () => clearInterval(id);
  }, [cargar]);

  const reportesPorColonia: ReportesPorColonia[] = useMemo(
    () => (reportes ? agruparReportesPorColonia(reportes) : []),
    [reportes],
  );

  const distribucionRiesgo: DistribucionRiesgo[] = useMemo(() => {
    if (!diagnosticos) return [];
    const cuentas = new Map<string, number>();
    for (const d of diagnosticos) {
      const n = (d.nivel_riesgo || "indeterminado").trim();
      cuentas.set(n, (cuentas.get(n) ?? 0) + 1);
    }
    return Array.from(cuentas.entries()).map(([nivel, total]) => ({ nivel, total }));
  }, [diagnosticos]);

  const cargando = stats === null && error === null;

  return (
    <>
      <section
        id="estadisticas"
        className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 md:-mt-14 relative z-10"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Reportes ciudadanos"
            value={stats?.totalReportes ?? null}
            icon={Activity}
            loading={cargando}
          />
          <KPICard
            label="Familias activas"
            value={stats?.familiasActivas ?? null}
            icon={Users}
            loading={cargando}
          />
          <KPICard
            label="Diagnósticos realizados"
            value={stats?.diagnosticos ?? null}
            icon={Droplets}
            loading={cargando}
          />
          <KPICard
            label="Colonias cubiertas"
            value={stats?.coloniasCubiertas ?? null}
            icon={MapPin}
            loading={cargando}
          />
        </div>
      </section>

      <DatosAbiertosPanel datos={datosAbiertos} cargando={cargando} />

      {error && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm">
            ⚠️ {error}
          </div>
        </section>
      )}

      <section id="mapa" className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
        <h2 className="text-xl font-semibold text-[color:var(--color-primary)] mb-4">
          Mapa de reportes ciudadanos
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div style={{ height: 600 }}>
            <MapWrapper reportes={reportes ?? []} />
          </div>
          <div className="flex flex-wrap gap-4 px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#EF4444" }} aria-hidden />
              Fuga
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#F59E0B" }} aria-hidden />
              Tandeo
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#EAB308" }} aria-hidden />
              Mala calidad
            </span>
            <span className="ml-auto">
              Datos públicos anonimizados — actualización automática cada 60 s
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-[color:var(--color-primary)] mb-3">
            Reportes por colonia (top 10)
          </h3>
          {reportes === null ? (
            <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <ReportesPorColoniaChart data={reportesPorColonia} />
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-[color:var(--color-primary)] mb-3">
            Distribución de niveles de riesgo
          </h3>
          {diagnosticos === null ? (
            <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <RiesgoChart data={distribucionRiesgo} />
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
        <h2 className="text-xl font-semibold text-[color:var(--color-primary)] mb-4">
          Últimos reportes
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          {reportes === null ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-6 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <RecentReportsTable reportes={reportes} />
          )}
        </div>
      </section>
    </>
  );
}
