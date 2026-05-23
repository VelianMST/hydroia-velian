"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Camera, MapPin, Loader2, Send, Droplet, CheckCircle2, Upload } from "lucide-react";
import { reducirImagen } from "@/lib/imagen";
import { VALLE_CENTER } from "@/lib/colonias";
import EnviarAutoridad, { type ReporteFuga } from "./EnviarAutoridad";

const MapaPicker = dynamic(() => import("./MapaPicker"), {
  ssr: false,
  loading: () => <div className="h-[280px] bg-slate-100 rounded-xl animate-pulse" />,
});

export default function ReportarFugaFlow() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [ubic, setUbic] = useState<{ lat: number; lng: number } | null>(null);
  const [centro, setCentro] = useState<[number, number]>([VALLE_CENTER.lat, VALLE_CENTER.lng]);
  const [nota, setNota] = useState("");
  const [gpsCargando, setGpsCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<(ReporteFuga & { foto_url: string | null }) | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      setFoto(await reducirImagen(file));
    } catch {
      setError("No pude leer esa imagen. Intenta con otra.");
    }
  }

  function usarGPS() {
    if (!navigator.geolocation) {
      setError("Tu dispositivo no comparte ubicación. Pon el pin en el mapa.");
      return;
    }
    setGpsCargando(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUbic({ lat, lng });
        setCentro([lat, lng]);
        setGpsCargando(false);
      },
      () => {
        setError("No se pudo obtener tu GPS. Toca el mapa para poner el pin en la fuga.");
        setGpsCargando(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function enviar() {
    if (!foto) return setError("La foto de la fuga es obligatoria.");
    if (!ubic) return setError("Marca la ubicación exacta de la fuga.");
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/reportar-fuga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagen: foto, mimeType: "image/jpeg", lat: ubic.lat, lng: ubic.lng, descripcion: nota }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "No se pudo enviar el reporte.");
      } else {
        setResultado({ ...data.reporte });
      }
    } catch {
      setError("No hay conexión. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  function reiniciar() {
    setFoto(null);
    setUbic(null);
    setNota("");
    setResultado(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (resultado) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" aria-hidden />
          <h2 className="mt-2 text-lg font-semibold text-emerald-800">¡Fuga reportada! 💧</h2>
          <p className="text-sm text-slate-600 mt-1">Ya está en el mapa público. Gracias por reportar.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 flex gap-4">
          {resultado.foto_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resultado.foto_url} alt="Fuga" className="w-24 h-24 object-cover rounded-xl border border-slate-200" />
          )}
          <div className="text-sm">
            <p className="font-semibold text-[color:var(--color-primary)]">{resultado.severidad_etiqueta}</p>
            <p className="text-slate-600 mt-0.5">Desperdicia aprox. <strong>{resultado.litros_dia} L/día</strong></p>
            <p className="text-slate-500 mt-0.5">{[resultado.colonia, resultado.municipio].filter(Boolean).join(", ")}</p>
          </div>
        </div>

        <EnviarAutoridad reporte={resultado} />

        <button onClick={reiniciar} className="w-full text-sm font-medium text-[color:var(--color-primary)] underline">
          Reportar otra fuga
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        Reporta una fuga en <strong>2 pasos</strong>: una foto y la ubicación. La IA estima el tamaño
        y preparamos el reporte para enviarlo a la autoridad. ⚡
      </p>

      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />

      {/* Paso 1: Foto */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-2">1. Foto de la fuga</p>
        {foto ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto} alt="Fuga" className="w-full max-h-64 object-contain rounded-xl border border-slate-200 bg-slate-50" />
            <button onClick={() => inputRef.current?.click()} className="mt-2 inline-flex items-center gap-2 text-sm text-[color:var(--color-primary)]">
              <Upload className="w-4 h-4" aria-hidden /> Cambiar foto
            </button>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center hover:border-[color:var(--color-primary)] transition"
          >
            <Camera className="w-9 h-9 mx-auto text-[color:var(--color-primary)]" aria-hidden />
            <p className="mt-2 font-medium text-slate-800">Toma o sube la foto</p>
            <p className="text-xs text-slate-500">Obligatoria, para verificar la fuga</p>
          </button>
        )}
      </div>

      {/* Paso 2: Ubicación */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-2">2. Ubicación exacta</p>
        <button
          onClick={usarGPS}
          disabled={gpsCargando}
          className="w-full inline-flex items-center justify-center gap-2 border border-[color:var(--color-primary)] text-[color:var(--color-primary)] font-medium px-4 py-2.5 rounded-xl hover:bg-[color:var(--color-primary)]/5 transition disabled:opacity-60"
        >
          {gpsCargando ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <MapPin className="w-4 h-4" aria-hidden />}
          {ubic ? "Ubicación marcada ✓ (toca el mapa para ajustar)" : "Usar mi ubicación (GPS)"}
        </button>
        <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
          <MapaPicker key={centro.join(",")} center={centro} value={ubic} onChange={(lat, lng) => setUbic({ lat, lng })} />
        </div>
        <p className="text-xs text-slate-500 mt-1">Toca el mapa donde está la fuga si el GPS no es exacto.</p>
      </div>

      {/* Nota opcional */}
      <div>
        <label htmlFor="nota" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Nota (opcional)
        </label>
        <input
          id="nota"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          maxLength={300}
          placeholder="Ej. Frente al número 5, lleva 3 días"
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 outline-none"
        />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      <button
        onClick={enviar}
        disabled={enviando || !foto || !ubic}
        className="w-full inline-flex items-center justify-center gap-2 bg-[color:var(--color-primary)] text-white font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
      >
        {enviando ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Send className="w-4 h-4" aria-hidden />}
        {enviando ? "Analizando y enviando…" : "Reportar fuga"}
      </button>

      <p className="flex items-start gap-2 text-xs text-slate-500">
        <Droplet className="w-4 h-4 mt-0.5 shrink-0 text-[color:var(--color-primary)]" aria-hidden />
        La ubicación exacta solo se usa para que reparen la fuga (es vía pública). Tu reporte es anónimo.
      </p>
    </div>
  );
}
