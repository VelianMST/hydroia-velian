"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Droplet, Loader2 } from "lucide-react";

interface Mensaje {
  role: "user" | "assistant";
  content: string;
}

/** Limpia marcas de markdown que el modelo a veces incluye (se ven feo en el chat). */
function limpiar(s: string): string {
  return s
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/`/g, "")
    .trim();
}

const SUGERENCIAS = [
  "Tengo agua amarilla en el tinaco, ¿qué hago?",
  "Me llega el agua por pipa, ¿cómo la desinfecto?",
  "Somos 5 en casa y hay jardín, dame tips de ahorro",
  "¿Para qué puedo usar el agua de la lavadora?",
];

const BIENVENIDA: Mensaje = {
  role: "assistant",
  content:
    "¡Hola! Soy Gota 💧 Cuéntame cómo está tu agua o qué necesitas (por ejemplo: cómo se ve, de dónde te llega, o si quieres tips de ahorro) y te oriento. Recuerda: te doy orientación, no un análisis de laboratorio.",
};

export default function AsistenteChat() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([BIENVENIDA]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando]);

  async function enviar(pregunta: string) {
    const q = pregunta.trim();
    if (!q || cargando) return;
    setError(null);
    const nuevos: Mensaje[] = [...mensajes, { role: "user", content: q }];
    setMensajes(nuevos);
    setTexto("");
    setCargando(true);
    try {
      // Mandamos solo los turnos reales (sin el saludo inicial).
      const paraEnviar = nuevos.filter((m, i) => !(i === 0 && m === BIENVENIDA));
      const res = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensajes: paraEnviar }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "No pude responder. Intenta de nuevo.");
      } else {
        setMensajes((prev) => [...prev, { role: "assistant", content: data.respuesta }]);
      }
    } catch {
      setError("No hay conexión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-[color:var(--color-primary)]/5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
          style={{ background: "linear-gradient(135deg,#1f4e79,#2e75b6)" }}
          aria-hidden
        >
          <Droplet className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[color:var(--color-primary)]">Pregúntale a Gota</p>
          <p className="text-xs text-slate-500">Asistente de agua con IA · orientación, no laboratorio</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 max-h-[26rem] overflow-y-auto">
        {mensajes.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[color:var(--color-primary)] text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-800 rounded-bl-sm"
              }`}
            >
              {m.role === "assistant" ? limpiar(m.content) : m.content}
            </div>
          </div>
        ))}
        {cargando && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-500 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Gota está escribiendo…
            </div>
          </div>
        )}
        <div ref={finRef} />
      </div>

      {mensajes.length <= 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {SUGERENCIAS.map((s) => (
            <button
              key={s}
              onClick={() => enviar(s)}
              className="text-xs text-left px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)] transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error && <div className="px-4 pb-2 text-sm text-red-600">{error}</div>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar(texto);
        }}
        className="flex items-center gap-2 p-3 border-t border-slate-100"
      >
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe tu pregunta sobre el agua…"
          maxLength={1500}
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 outline-none"
        />
        <button
          type="submit"
          disabled={cargando || !texto.trim()}
          aria-label="Enviar"
          className="shrink-0 w-11 h-11 rounded-xl bg-[color:var(--color-primary)] text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
