"use client";

import { useRef, useState } from "react";
import { Camera, Upload, AlertTriangle, Droplets, Loader2 } from "lucide-react";

type Nivel = "bajo" | "medio" | "alto" | "indeterminado";
interface Diagnostico {
  nivel_riesgo: Nivel;
  color_observado: string;
  turbidez_aparente: string;
  sedimentos_visibles: boolean;
  diagnostico: string;
  recomendacion: string;
  advertencia: string | null;
}

const ESTILO_NIVEL: Record<Nivel, { txt: string; bg: string; borde: string; etiqueta: string }> = {
  bajo: { txt: "text-emerald-700", bg: "bg-emerald-50", borde: "border-emerald-200", etiqueta: "Riesgo bajo" },
  medio: { txt: "text-amber-700", bg: "bg-amber-50", borde: "border-amber-200", etiqueta: "Riesgo medio" },
  alto: { txt: "text-red-700", bg: "bg-red-50", borde: "border-red-200", etiqueta: "Riesgo alto" },
  indeterminado: { txt: "text-slate-700", bg: "bg-slate-50", borde: "border-slate-200", etiqueta: "Indeterminado" },
};

// Reduce la imagen en el navegador (máx 1024 px, JPEG 0.8) para subir poco peso.
function reducirImagen(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const max = 1024;
      let { width, height } = img;
      if (width > max || height > max) {
        if (width >= height) {
          height = Math.round((height * max) / width);
          width = max;
        } else {
          width = Math.round((width * max) / height);
          height = max;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("sin canvas"));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("no se pudo leer la imagen"));
    };
    img.src = url;
  });
}

export default function FotoForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [diag, setDiag] = useState<Diagnostico | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setDiag(null);
    try {
      const reducida = await reducirImagen(file);
      setPreview(reducida);
      setDataUrl(reducida);
    } catch {
      setError("No pude leer esa imagen. Intenta con otra.");
    }
  }

  async function analizar() {
    if (!dataUrl) return;
    setCargando(true);
    setError(null);
    setDiag(null);
    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagen: dataUrl, mimeType: "image/jpeg" }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) setError(data.error ?? "No se pudo analizar la foto.");
      else setDiag(data.diagnostico as Diagnostico);
    } catch {
      setError("No hay conexión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  function reiniciar() {
    setPreview(null);
    setDataUrl(null);
    setDiag(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const estilo = diag ? ESTILO_NIVEL[diag.nivel_riesgo] : null;

  return (
    <div className="space-y-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFile}
        className="hidden"
      />

      {!preview && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center hover:border-[color:var(--color-primary)] transition"
        >
          <Camera className="w-10 h-10 mx-auto text-[color:var(--color-primary)]" aria-hidden />
          <p className="mt-3 font-medium text-slate-800">Toma o sube una foto del agua</p>
          <p className="text-sm text-slate-500 mt-1">
            De tu llave, tinaco o un vaso. Mientras más clara la foto, mejor el diagnóstico.
          </p>
        </button>
      )}

      {preview && (
        <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Vista previa del agua"
            className="w-full max-h-80 object-contain rounded-2xl border border-slate-200 bg-slate-50"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={analizar}
              disabled={cargando}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[color:var(--color-primary)] text-white font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-60"
            >
              {cargando ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Droplets className="w-4 h-4" aria-hidden />}
              {cargando ? "Analizando…" : "Analizar agua"}
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 font-medium px-5 py-3 rounded-xl hover:bg-slate-50 transition"
            >
              <Upload className="w-4 h-4" aria-hidden />
              Otra foto
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {diag && estilo && (
        <div className={`rounded-2xl border ${estilo.borde} ${estilo.bg} p-5 space-y-4`}>
          <div className="flex items-center justify-between">
            <span className={`text-lg font-bold ${estilo.txt}`}>{estilo.etiqueta}</span>
            <span className="text-xs text-slate-500">Tamizaje visual</span>
          </div>

          {diag.advertencia && (
            <div className="flex items-start gap-2 rounded-xl bg-red-100 border border-red-300 p-3 text-sm text-red-800">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <p>{diag.advertencia}</p>
            </div>
          )}

          <p className="text-sm text-slate-700">{diag.diagnostico}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-white/70 border border-white p-2.5">
              <p className="text-xs text-slate-500">Color</p>
              <p className="font-medium text-slate-800">{diag.color_observado}</p>
            </div>
            <div className="rounded-lg bg-white/70 border border-white p-2.5">
              <p className="text-xs text-slate-500">Turbidez</p>
              <p className="font-medium text-slate-800 capitalize">{diag.turbidez_aparente}</p>
            </div>
            <div className="rounded-lg bg-white/70 border border-white p-2.5 col-span-2">
              <p className="text-xs text-slate-500">Sedimentos visibles</p>
              <p className="font-medium text-slate-800">{diag.sedimentos_visibles ? "Sí" : "No"}</p>
            </div>
          </div>

          <div className="rounded-xl bg-white/70 border border-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
              Recomendación
            </p>
            <p className="text-sm text-slate-700">{diag.recomendacion}</p>
          </div>

          <button
            onClick={reiniciar}
            className="w-full text-sm font-medium text-[color:var(--color-primary)] underline"
          >
            Analizar otra foto
          </button>
        </div>
      )}

      <p className="flex items-start gap-2 text-xs text-slate-500">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" aria-hidden />
        Esto es un <strong>tamizaje preliminar</strong> con IA, no un análisis de laboratorio. Ante
        cualquier duda sobre la seguridad del agua, no la bebas y consulta a tu autoridad de agua local.
      </p>
    </div>
  );
}
