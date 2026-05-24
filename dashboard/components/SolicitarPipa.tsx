"use client";

import { useState } from "react";
import { Phone, Copy, Share2, Check, Truck, AlertTriangle } from "lucide-react";
import { MUNICIPIOS } from "@/lib/municipios";

function esCDMX(estado: string): boolean {
  return estado.toLowerCase().includes("ciudad");
}

export default function SolicitarPipa() {
  const [nombre, setNombre] = useState("");
  const [tel, setTel] = useState("");
  const [calle, setCalle] = useState("");
  const [colonia, setColonia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [estado, setEstado] = useState("México");
  const [referencias, setReferencias] = useState("");
  const [cisterna, setCisterna] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [verSolicitud, setVerSolicitud] = useState(false);

  const cdmx = esCDMX(estado);

  function texto(): string {
    return [
      `Solicitud de PIPA DE AGUA GRATUITA`,
      nombre ? `Nombre: ${nombre}` : "Nombre: (indícalo al llamar)",
      tel ? `Teléfono: ${tel}` : "Teléfono: (indícalo al llamar)",
      `Dirección: ${[calle, colonia, municipio, estado].filter(Boolean).join(", ")}`,
      referencias ? `Referencias: ${referencias}` : "",
      cisterna ? `Capacidad de cisterna/tinaco: ${cisterna} L` : "",
      `Motivo: desabasto de agua.`,
      `Solicitud preparada con HydroIA Velian.`,
    ].filter(Boolean).join("\n");
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch { /* */ }
  }
  async function compartir() {
    if (navigator.share) {
      try { await navigator.share({ title: "Solicitud de pipa de agua", text: texto() }); } catch { /* */ }
    } else copiar();
  }

  const listo = colonia.trim().length >= 2 && municipio.trim().length >= 2;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
        <p>La pipa del gobierno es <strong>GRATIS</strong>. Nadie debe cobrarte por ella; no pagues a terceros.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tu nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={80} placeholder="Para que la autoridad te ubique" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 outline-none focus:border-[color:var(--color-primary)]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teléfono</label>
          <input value={tel} onChange={(e) => setTel(e.target.value)} maxLength={20} placeholder="Para que te contacten" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 outline-none focus:border-[color:var(--color-primary)]" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Calle y número</label>
        <input value={calle} onChange={(e) => setCalle(e.target.value)} maxLength={120} placeholder="Ej. Av. Juárez 25" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 outline-none focus:border-[color:var(--color-primary)]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Colonia</label>
          <input value={colonia} onChange={(e) => setColonia(e.target.value)} maxLength={80} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 outline-none focus:border-[color:var(--color-primary)]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Municipio o alcaldía</label>
          <input list="muni-pipa" value={municipio} onChange={(e) => setMunicipio(e.target.value)} maxLength={80} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 outline-none focus:border-[color:var(--color-primary)]" />
          <datalist id="muni-pipa">{MUNICIPIOS.map((m) => <option key={m} value={m} />)}</datalist>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 bg-white outline-none focus:border-[color:var(--color-primary)]">
            <option value="México">Estado de México</option>
            <option value="Ciudad de México">Ciudad de México</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Capacidad de cisterna/tinaco (L)</label>
          <input value={cisterna} onChange={(e) => setCisterna(e.target.value)} maxLength={10} placeholder="Ej. 1100" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 outline-none focus:border-[color:var(--color-primary)]" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Referencias (opcional)</label>
        <input value={referencias} onChange={(e) => setReferencias(e.target.value)} maxLength={160} placeholder="Ej. portón verde, junto a la tienda" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 outline-none focus:border-[color:var(--color-primary)]" />
      </div>

      {!verSolicitud ? (
        <button onClick={() => listo && setVerSolicitud(true)} disabled={!listo} className="w-full inline-flex items-center justify-center gap-2 bg-[color:var(--color-primary)] text-white font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50">
          <Truck className="w-4 h-4" aria-hidden /> Preparar solicitud
        </button>
      ) : (
        <div className="rounded-2xl border border-[color:var(--color-primary)]/20 bg-[color:var(--color-primary)]/5 p-4 space-y-3">
          <p className="text-sm font-semibold text-[color:var(--color-primary)]">Tu solicitud está lista. Mándala por el canal oficial:</p>
          <pre className="text-xs bg-white border border-slate-200 rounded-xl p-3 whitespace-pre-wrap text-slate-700 max-h-44 overflow-y-auto">{texto()}</pre>
          <div className="grid gap-2 sm:grid-cols-2">
            {cdmx ? (
              <>
                <a href="tel:5556543210" className="inline-flex items-center justify-center gap-2 bg-[color:var(--color-primary)] text-white font-medium px-4 py-2.5 rounded-xl hover:opacity-90"><Phone className="w-4 h-4" aria-hidden /> SACMEX pipas</a>
                <a href="tel:5556581111" className="inline-flex items-center justify-center gap-2 border border-[color:var(--color-primary)] text-[color:var(--color-primary)] font-medium px-4 py-2.5 rounded-xl hover:bg-white"><Phone className="w-4 h-4" aria-hidden /> Locatel *0311</a>
              </>
            ) : (
              <>
                <a href="tel:8002012489" className="inline-flex items-center justify-center gap-2 bg-[color:var(--color-primary)] text-white font-medium px-4 py-2.5 rounded-xl hover:opacity-90"><Phone className="w-4 h-4" aria-hidden /> CAEM 800 201 2489</a>
                <span className="inline-flex items-center justify-center text-xs text-slate-500 px-2 py-2.5">o tu organismo municipal</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={compartir} className="flex-1 inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 font-medium px-4 py-2.5 rounded-xl hover:bg-white"><Share2 className="w-4 h-4" aria-hidden /> Compartir</button>
            <button onClick={copiar} className="flex-1 inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 font-medium px-4 py-2.5 rounded-xl hover:bg-white">
              {copiado ? <Check className="w-4 h-4 text-emerald-600" aria-hidden /> : <Copy className="w-4 h-4" aria-hidden />} {copiado ? "¡Copiado!" : "Copiar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
