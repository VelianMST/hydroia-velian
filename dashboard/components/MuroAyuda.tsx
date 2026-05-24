"use client";

import { useCallback, useEffect, useState } from "react";
import { Send, HandHelping, Droplets, Loader2, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fechaRelativa } from "@/lib/format";
import { MUNICIPIOS } from "@/lib/municipios";

interface Post {
  id: string;
  tipo: "necesito" | "ofrezco";
  mensaje: string;
  colonia: string | null;
  municipio: string | null;
  contacto: string | null;
  fecha: string;
}

function waLink(contacto: string): string | null {
  const digitos = contacto.replace(/\D/g, "");
  if (digitos.length >= 10) return `https://wa.me/52${digitos.slice(-10)}`;
  return null;
}

export default function MuroAyuda() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [filtro, setFiltro] = useState<"todos" | "necesito" | "ofrezco">("todos");
  const [tipo, setTipo] = useState<"necesito" | "ofrezco">("necesito");
  const [mensaje, setMensaje] = useState("");
  const [colonia, setColonia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [contacto, setContacto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const desde = new Date(Date.now() - 7 * 86_400_000).toISOString();
      const { data, error } = await supabase
        .from("ayuda_mutua")
        .select("id, tipo, mensaje, colonia, municipio, contacto, fecha")
        .gte("fecha", desde)
        .order("fecha", { ascending: false })
        .limit(100);
      if (error) throw error;
      setPosts((data ?? []) as Post[]);
    } catch {
      setPosts([]);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mensaje.trim().length < 5) return setError("Escribe un mensaje.");
    if (colonia.trim().length < 2) return setError("Indica tu colonia.");
    setEnviando(true);
    try {
      const res = await fetch("/api/ayuda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, mensaje, colonia, municipio, contacto }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) setError(data.error ?? "No se pudo publicar.");
      else {
        setMensaje("");
        setContacto("");
        await cargar();
      }
    } catch {
      setError("No hay conexión. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const visibles = (posts ?? []).filter((p) => filtro === "todos" || p.tipo === filtro);

  return (
    <div className="space-y-6">
      {/* Formulario */}
      <form onSubmit={publicar} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
        <p className="text-sm font-semibold text-slate-700">Publica un aviso para tus vecinos</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setTipo("necesito")} className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium ${tipo === "necesito" ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5 text-[color:var(--color-primary)]" : "border-slate-200 text-slate-600"}`}>
            <Droplets className="w-4 h-4" aria-hidden /> Necesito agua
          </button>
          <button type="button" onClick={() => setTipo("ofrezco")} className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium ${tipo === "ofrezco" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600"}`}>
            <HandHelping className="w-4 h-4" aria-hidden /> Ofrezco / comparto
          </button>
        </div>
        <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} rows={2} maxLength={300} placeholder="Ej. Llevamos 5 días sin agua, familia con bebé, ¿alguien comparte?" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 outline-none focus:border-[color:var(--color-primary)]" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={colonia} onChange={(e) => setColonia(e.target.value)} maxLength={80} placeholder="Tu colonia" className="rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 outline-none focus:border-[color:var(--color-primary)]" />
          <input list="muni-ayuda" value={municipio} onChange={(e) => setMunicipio(e.target.value)} maxLength={80} placeholder="Municipio o alcaldía" className="rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 outline-none focus:border-[color:var(--color-primary)]" />
          <datalist id="muni-ayuda">{MUNICIPIOS.map((m) => <option key={m} value={m} />)}</datalist>
        </div>
        <input value={contacto} onChange={(e) => setContacto(e.target.value)} maxLength={40} placeholder="Contacto (opcional): WhatsApp o cómo te ubican" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 outline-none focus:border-[color:var(--color-primary)]" />
        <p className="flex items-start gap-2 text-xs text-amber-700">
          <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
          Lo que pongas será <strong>público</strong>. No pongas tu dirección exacta. El contacto es opcional.
        </p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">{error}</div>}
        <button type="submit" disabled={enviando} className="w-full inline-flex items-center justify-center gap-2 bg-[color:var(--color-primary)] text-white font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-60">
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Send className="w-4 h-4" aria-hidden />}
          {enviando ? "Publicando…" : "Publicar aviso"}
        </button>
      </form>

      {/* Filtros + lista */}
      <div className="flex gap-2">
        {(["todos", "necesito", "ofrezco"] as const).map((f) => (
          <button key={f} onClick={() => setFiltro(f)} className={`px-3.5 py-1.5 rounded-full text-sm font-medium ${filtro === f ? "bg-[color:var(--color-primary)] text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
            {f === "todos" ? "Todos" : f === "necesito" ? "Necesitan" : "Ofrecen"}
          </button>
        ))}
      </div>

      {posts === null ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : visibles.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-6">Aún no hay avisos. Sé el primero en publicar. 💧</p>
      ) : (
        <ul className="space-y-3">
          {visibles.map((p) => {
            const wa = p.contacto ? waLink(p.contacto) : null;
            return (
              <li key={p.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.tipo === "necesito" ? "bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]" : "bg-emerald-50 text-emerald-700"}`}>
                    {p.tipo === "necesito" ? "Necesita agua" : "Ofrece / comparte"}
                  </span>
                  <span className="text-xs text-slate-400">{fechaRelativa(p.fecha)}</span>
                </div>
                <p className="text-sm text-slate-700">{p.mensaje}</p>
                <p className="text-xs text-slate-500 mt-1">📍 {p.colonia}{p.municipio ? `, ${p.municipio}` : ""}</p>
                {p.contacto && (
                  <p className="text-xs mt-1">
                    {wa ? (
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-medium">💬 Contactar por WhatsApp</a>
                    ) : (
                      <span className="text-slate-600">Contacto: {p.contacto}</span>
                    )}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
