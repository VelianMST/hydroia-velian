"use client";

import { useState } from "react";
import { CATEGORIAS, TIPS_AGUA, PASOS_LIMPIEZA_TINACO, type CategoriaTip } from "@/lib/tips";
import { Sparkles } from "lucide-react";

export default function TipsView() {
  const [filtro, setFiltro] = useState<CategoriaTip | "todos">("todos");

  const tips = filtro === "todos" ? TIPS_AGUA : TIPS_AGUA.filter((t) => t.categoria === filtro);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltro("todos")}
          className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
            filtro === "todos"
              ? "bg-[color:var(--color-primary)] text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          Todos
        </button>
        {CATEGORIAS.map((c) => (
          <button
            key={c.id}
            onClick={() => setFiltro(c.id)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
              filtro === c.id
                ? "bg-[color:var(--color-primary)] text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {tips.map((t, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-700 shadow-sm"
          >
            {t.texto}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[color:var(--color-primary)]/15 bg-[color:var(--color-primary)]/5 p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-[color:var(--color-primary)]">
          <Sparkles className="w-5 h-5" aria-hidden />
          Cómo limpiar tu tinaco o cisterna
        </h2>
        <ol className="mt-3 space-y-2.5">
          {PASOS_LIMPIEZA_TINACO.map((paso, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-700">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[color:var(--color-primary)] text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span>{paso}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-slate-500">
          ⏰ Repítelo cada 6 meses (mínimo). Si el agua de tu colonia llega muy turbia, hazlo cada 3
          meses. Si encuentras moho o lodo, considera ayuda profesional.
        </p>
      </div>
    </div>
  );
}
