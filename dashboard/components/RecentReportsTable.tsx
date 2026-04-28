"use client";

import { colorTipo, etiquetaTipo, fechaRelativa } from "@/lib/format";
import type { ReportePublico } from "@/lib/supabase";

export default function RecentReportsTable({ reportes }: { reportes: ReportePublico[] }) {
  const ultimos = reportes.slice(0, 10);
  if (ultimos.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-6 text-center">
        Aún no hay reportes. Sé el primero por Telegram.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
            <th className="py-2 pr-3">Tipo</th>
            <th className="py-2 pr-3">Colonia</th>
            <th className="py-2 pr-3">Descripción</th>
            <th className="py-2 pr-3">Cuándo</th>
          </tr>
        </thead>
        <tbody>
          {ultimos.map((r) => (
            <tr key={r.id} className="border-b border-slate-100">
              <td className="py-2 pr-3">
                <span
                  className="inline-flex items-center gap-2 text-xs font-semibold"
                  style={{ color: colorTipo(r.tipo) }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: colorTipo(r.tipo) }}
                    aria-hidden
                  />
                  {etiquetaTipo(r.tipo)}
                </span>
              </td>
              <td className="py-2 pr-3 text-slate-700">{r.colonia ?? "—"}</td>
              <td className="py-2 pr-3 text-slate-600 truncate max-w-xs">{r.descripcion}</td>
              <td className="py-2 pr-3 text-slate-500">{fechaRelativa(r.fecha)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
