"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DistribucionRiesgo } from "@/lib/queries";

const COLORES_RIESGO: Record<string, string> = {
  bajo: "#10B981",
  medio: "#F59E0B",
  alto: "#EF4444",
  indeterminado: "#94A3B8",
};

export default function RiesgoChart({ data }: { data: DistribucionRiesgo[] }) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-500">
        Aún no hay diagnósticos.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="nivel" innerRadius={60} outerRadius={110} paddingAngle={2}>
          {data.map((entry) => (
            <Cell key={entry.nivel} fill={COLORES_RIESGO[entry.nivel] ?? "#64748B"} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0" }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
