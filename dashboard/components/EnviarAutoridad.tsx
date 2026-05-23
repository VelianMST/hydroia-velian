"use client";

import { useState } from "react";
import { Phone, Copy, Share2, Check, Building2 } from "lucide-react";

export interface ReporteFuga {
  id?: string;
  severidad_etiqueta: string;
  litros_dia: number;
  descripcion: string;
  colonia: string;
  municipio: string;
  estado: string;
  lat: number;
  lng: number;
}

function esCDMX(estado: string): boolean {
  const e = estado.toLowerCase();
  return e.includes("ciudad de m") || e.includes("cdmx") || e.includes("distrito federal");
}

function textoReporte(r: ReporteFuga): string {
  const folio = r.id ? `HV-${r.id.slice(0, 8).toUpperCase()}` : "HV";
  const lugar = [r.colonia, r.municipio, r.estado].filter(Boolean).join(", ");
  return [
    `Reporte de FUGA DE AGUA — HydroIA Velian`,
    `Folio: ${folio}`,
    `Severidad: ${r.severidad_etiqueta} (desperdicia aprox. ${r.litros_dia} litros al día)`,
    `Descripción: ${r.descripcion}`,
    lugar ? `Ubicación: ${lugar}` : "",
    `Coordenadas exactas: ${r.lat.toFixed(6)}, ${r.lng.toFixed(6)}`,
    `Mapa: https://www.google.com/maps?q=${r.lat},${r.lng}`,
    `Fecha: ${new Date().toLocaleString("es-MX")}`,
    `Reporte ciudadano enviado vía HydroIA Velian.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function EnviarAutoridad({ reporte }: { reporte: ReporteFuga }) {
  const [copiado, setCopiado] = useState(false);
  const texto = textoReporte(reporte);
  const cdmx = esCDMX(reporte.estado);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* algunos navegadores bloquean clipboard */
    }
  }

  async function compartir() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Reporte de fuga de agua", text: texto });
      } catch {
        /* el usuario canceló */
      }
    } else {
      copiar();
    }
  }

  return (
    <div className="rounded-2xl border border-[color:var(--color-primary)]/20 bg-[color:var(--color-primary)]/5 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-[color:var(--color-primary)]" aria-hidden />
        <h3 className="font-semibold text-[color:var(--color-primary)]">Envíalo a la autoridad</h3>
      </div>
      <p className="text-sm text-slate-600">
        Tu reporte ya quedó completo. Mándalo al organismo que repara las fugas — con un toque, todos
        los datos van listos:
      </p>

      <pre className="text-xs bg-white border border-slate-200 rounded-xl p-3 whitespace-pre-wrap text-slate-700 max-h-44 overflow-y-auto">
        {texto}
      </pre>

      <div className="grid gap-2 sm:grid-cols-2">
        {cdmx ? (
          <>
            <a
              href="tel:5556581111"
              className="inline-flex items-center justify-center gap-2 bg-[color:var(--color-primary)] text-white font-medium px-4 py-2.5 rounded-xl hover:opacity-90 transition"
            >
              <Phone className="w-4 h-4" aria-hidden /> Locatel *0311
            </a>
            <a
              href="tel:5589574950"
              className="inline-flex items-center justify-center gap-2 border border-[color:var(--color-primary)] text-[color:var(--color-primary)] font-medium px-4 py-2.5 rounded-xl hover:bg-white transition"
            >
              <Phone className="w-4 h-4" aria-hidden /> SACMEX
            </a>
          </>
        ) : (
          <>
            <a
              href="tel:8002012489"
              className="inline-flex items-center justify-center gap-2 bg-[color:var(--color-primary)] text-white font-medium px-4 py-2.5 rounded-xl hover:opacity-90 transition"
            >
              <Phone className="w-4 h-4" aria-hidden /> CAEM 800 201 2489
            </a>
            <span className="inline-flex items-center justify-center gap-2 text-xs text-slate-500 px-2 py-2.5">
              o tu organismo de agua municipal
            </span>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={compartir}
          className="flex-1 inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 font-medium px-4 py-2.5 rounded-xl hover:bg-white transition"
        >
          <Share2 className="w-4 h-4" aria-hidden /> Compartir
        </button>
        <button
          onClick={copiar}
          className="flex-1 inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 font-medium px-4 py-2.5 rounded-xl hover:bg-white transition"
        >
          {copiado ? <Check className="w-4 h-4 text-emerald-600" aria-hidden /> : <Copy className="w-4 h-4" aria-hidden />}
          {copiado ? "¡Copiado!" : "Copiar reporte"}
        </button>
      </div>

      <p className="text-[11px] text-slate-400">
        Los organismos del agua no tienen una API pública para recibir reportes automáticos, así que
        HydroIA prepara todo y te abre el canal oficial. Líneas 24/7.
      </p>
    </div>
  );
}
