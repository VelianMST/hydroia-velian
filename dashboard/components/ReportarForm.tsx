"use client";

import { useState } from "react";
import { Droplet, Clock, AlertTriangle, CheckCircle2, Send, ShieldCheck } from "lucide-react";
import { MUNICIPIOS } from "@/lib/municipios";

type Tipo = "fuga" | "tandeo" | "mala_calidad";

const TIPOS: { value: Tipo; label: string; desc: string; icon: typeof Droplet }[] = [
  { value: "fuga", label: "Fuga", desc: "Agua tirándose en la calle o tubería", icon: Droplet },
  { value: "tandeo", label: "Tandeo prolongado", desc: "Lleva días sin llegar el agua", icon: Clock },
  { value: "mala_calidad", label: "Mala calidad", desc: "Agua sucia, con color u olor raro", icon: AlertTriangle },
];

export default function ReportarForm() {
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [colonia, setColonia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [estado, setEstado] = useState("México");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!tipo) return setError("Elige qué quieres reportar.");
    if (descripcion.trim().length < 5) return setError("Describe brevemente qué está pasando.");
    if (colonia.trim().length < 2) return setError("Escribe tu colonia.");
    if (municipio.trim().length < 2) return setError("Escribe tu municipio o alcaldía.");

    setEnviando(true);
    try {
      const res = await fetch("/api/reportar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, descripcion, colonia, municipio, estado }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "No se pudo enviar el reporte.");
      } else {
        setExito(true);
      }
    } catch {
      setError("No hay conexión. Revisa tu internet e intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  function reiniciar() {
    setTipo(null);
    setDescripcion("");
    setColonia("");
    setMunicipio("");
    setEstado("México");
    setExito(false);
    setError(null);
  }

  if (exito) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
        <CheckCircle2 className="w-14 h-14 mx-auto text-[color:var(--color-success)]" aria-hidden />
        <h2 className="mt-3 text-lg font-semibold text-[color:var(--color-primary)]">
          ¡Gracias por tu reporte! 💧
        </h2>
        <p className="mt-2 text-slate-600">
          Lo registramos de forma anónima. Aparecerá en el mapa público en cuanto se actualice
          (menos de un minuto).
        </p>
        <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[color:var(--color-primary)] text-white font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition"
          >
            Ver el mapa
          </a>
          <button
            onClick={reiniciar}
            className="inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 font-medium px-5 py-2.5 rounded-xl hover:bg-slate-50 transition"
          >
            Hacer otro reporte
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-6">
      <fieldset>
        <legend className="text-sm font-semibold text-slate-700 mb-3">¿Qué quieres reportar?</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {TIPOS.map(({ value, label, desc, icon: Icon }) => {
            const sel = tipo === value;
            return (
              <button
                type="button"
                key={value}
                onClick={() => setTipo(value)}
                aria-pressed={sel}
                className={`text-left rounded-2xl border p-4 transition ${
                  sel
                    ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5 ring-2 ring-[color:var(--color-primary)]/30"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <Icon className="w-6 h-6 text-[color:var(--color-primary)]" aria-hidden />
                <p className="mt-2 font-medium text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Cuéntanos qué pasa
        </label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Ej. Llevamos 4 días sin agua y la pipa no ha pasado."
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 outline-none"
        />
      </div>

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
            placeholder="Ej. Himno Nacional"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 outline-none"
          />
        </div>
        <div>
          <label htmlFor="municipio" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Municipio o alcaldía
          </label>
          <input
            id="municipio"
            list="lista-municipios"
            value={municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            maxLength={80}
            placeholder="Ej. Nicolás Romero"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 outline-none"
          />
          <datalist id="lista-municipios">
            {MUNICIPIOS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label htmlFor="estado" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Estado
        </label>
        <select
          id="estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 bg-white focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 outline-none"
        >
          <option value="México">Estado de México</option>
          <option value="Ciudad de México">Ciudad de México</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full inline-flex items-center justify-center gap-2 bg-[color:var(--color-primary)] text-white font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-60"
      >
        <Send className="w-4 h-4" aria-hidden />
        {enviando ? "Enviando…" : "Enviar reporte"}
      </button>

      <p className="flex items-start gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-[color:var(--color-success)]" aria-hidden />
        Tu reporte es anónimo. Guardamos solo tu colonia (nunca tu dirección exacta) y la ubicamos
        en el centro aproximado para proteger tu privacidad.
      </p>
    </form>
  );
}
