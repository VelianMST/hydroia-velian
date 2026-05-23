"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [esIOS, setEsIOS] = useState(false);
  const [oculto, setOculto] = useState(true);

  useEffect(() => {
    // Ya instalada (modo standalone): no mostrar nada.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error Safari iOS
      window.navigator.standalone === true;
    if (standalone) return;

    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setEsIOS(ios);
    if (ios) setOculto(false);

    const handler = (e: Event) => {
      e.preventDefault();
      setEvento(e as BeforeInstallPromptEvent);
      setOculto(false);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function instalar() {
    if (!evento) return;
    await evento.prompt();
    await evento.userChoice;
    setEvento(null);
    setOculto(true);
  }

  if (oculto || (!evento && !esIOS)) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
      <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--color-primary)]/20 bg-[color:var(--color-primary)]/5 p-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
          style={{ background: "linear-gradient(135deg,#1f4e79,#2e75b6)" }}
          aria-hidden
        >
          <Download className="w-5 h-5" />
        </div>
        <div className="flex-1 text-sm">
          <p className="font-semibold text-[color:var(--color-primary)]">Instala HydroIA en tu celular</p>
          {esIOS ? (
            <p className="text-slate-600 flex items-center gap-1 flex-wrap">
              Toca <Share className="w-3.5 h-3.5 inline" aria-hidden /> Compartir y luego
              “Agregar a pantalla de inicio”.
            </p>
          ) : (
            <p className="text-slate-600">Acceso directo, pantalla completa, sin ocupar espacio.</p>
          )}
        </div>
        {!esIOS && evento && (
          <button
            onClick={instalar}
            className="shrink-0 bg-[color:var(--color-primary)] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition"
          >
            Instalar
          </button>
        )}
        <button
          onClick={() => setOculto(true)}
          aria-label="Cerrar"
          className="shrink-0 text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
