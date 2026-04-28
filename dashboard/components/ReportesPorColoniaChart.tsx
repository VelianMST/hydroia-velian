"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ReportesPorColonia } from "@/lib/queries";

export default function ReportesPorColoniaChart({ data }: { data: ReportesPorColonia[] }) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-500">
        Aún no hay reportes por colonia.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis
          dataKey="colonia"
          interval={0}
          angle={-25}
          textAnchor="end"
          height={70}
          tick={{ fontSize: 11, fill: "#475569" }}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#475569" }} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0" }}
          formatter={(value) => [String(value), "Reportes"]}
        />
        <Bar dataKey="total" fill="#2E75B6" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
