"use client";

import { Cpu, Droplet, FlaskConical, Thermometer } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { fechaRelativa } from "@/lib/format";
import type { LecturaSensorPublica } from "@/lib/supabase";

function colorTurbidez(ntu: number): string {
  if (ntu <= 5) return "#10B981";
  if (ntu <= 50) return "#F59E0B";
  return "#EF4444";
}
function colorTds(ppm: number): string {
  if (ppm <= 300) return "#10B981";
  if (ppm <= 600) return "#EAB308";
  if (ppm <= 1000) return "#F59E0B";
  return "#EF4444";
}

function Metric({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: typeof Droplet;
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 mb-2">
        <Icon className="w-3.5 h-3.5" aria-hidden />
        {label}
      </div>
      <p className="text-2xl font-bold tabular-nums" style={{ color }}>
        {value}
        <span className="text-sm font-medium text-slate-400 ml-1">{unit}</span>
      </p>
    </div>
  );
}

export default function SensorIoT({
  lecturas,
  cargando,
}: {
  lecturas: LecturaSensorPublica[] | null;
  cargando: boolean;
}) {
  // Sin hardware aún / sin lecturas: ocultar el panel.
  if (!cargando && (!lecturas || lecturas.length === 0)) return null;

  const ult = lecturas?.[0] ?? null;
  // serie ascendente para la mini-gráfica
  const serie = (lecturas ?? [])
    .slice(0, 24)
    .map((l) => ({ t: l.turbidez_ntu }))
    .reverse();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-4 h-4 text-[color:var(--color-primary)]" aria-hidden />
          <h3 className="text-sm font-semibold text-[color:var(--color-primary)]">
            Sensor IoT — monitoreo en tiempo real
          </h3>
          {ult?.colonia && (
            <span className="text-xs text-slate-400">· {ult.colonia}</span>
          )}
        </div>

        {cargando && !ult ? (
          <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        ) : ult ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                icon={Droplet}
                label="Turbidez"
                value={ult.turbidez_ntu.toFixed(1)}
                unit="NTU"
                color={colorTurbidez(ult.turbidez_ntu)}
              />
              <Metric
                icon={FlaskConical}
                label="Sólidos disueltos"
                value={Math.round(ult.tds_ppm).toString()}
                unit="ppm"
                color={colorTds(ult.tds_ppm)}
              />
              <Metric
                icon={Thermometer}
                label="Temperatura"
                value={ult.temperatura_c.toFixed(1)}
                unit="°C"
                color="#2E75B6"
              />
              <div className="rounded-xl border border-slate-100 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                  Tendencia turbidez
                </div>
                <div style={{ height: 56 }}>
                  {serie.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={serie}>
                        <YAxis hide domain={["dataMin", "dataMax"]} />
                        <Area
                          type="monotone"
                          dataKey="t"
                          stroke="#2E75B6"
                          fill="#2E75B6"
                          fillOpacity={0.18}
                          strokeWidth={2}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-xs text-slate-400">Pocas lecturas aún</p>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Dispositivo <code>{ult.dispositivo_id}</code> · última lectura{" "}
              {fechaRelativa(ult.fecha)}. Módulo ESP32 de bajo costo (turbidez +
              TDS + temperatura). Tamizaje preliminar, no sustituye laboratorio.
            </p>
          </>
        ) : null}
      </div>
    </section>
  );
}
