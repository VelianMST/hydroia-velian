"use client";

import { useEffect, useState } from "react";

interface Props {
  reporteId: string;
  sigueInicial: number;
  reparadaInicial: number;
}

export default function ConfirmarFuga({ reporteId, sigueInicial, reparadaInicial }: Props) {
  const [sigue, setSigue] = useState(sigueInicial);
  const [reparada, setReparada] = useState(reparadaInicial);
  const [yaConfirme, setYaConfirme] = useState(false);

  useEffect(() => {
    setYaConfirme(localStorage.getItem(`hv-confirm-${reporteId}`) != null);
  }, [reporteId]);

  async function confirmar(tipo: "sigue" | "reparada") {
    if (yaConfirme) return;
    setYaConfirme(true);
    if (tipo === "sigue") setSigue((n) => n + 1);
    else setReparada((n) => n + 1);
    try {
      localStorage.setItem(`hv-confirm-${reporteId}`, tipo);
      await fetch("/api/confirmar-fuga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reporteId, tipo }),
      });
    } catch {
      /* optimista; si falla la red no revertimos para no confundir */
    }
  }

  return (
    <div className="mt-2 pt-2 border-t border-slate-100">
      {yaConfirme ? (
        <p className="text-xs text-slate-500">
          👁 {sigue} confirman que sigue · ✅ {reparada} dicen reparada · ¡gracias!
        </p>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => confirmar("sigue")}
            className="text-xs px-2.5 py-1 rounded-full border border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            👁 Sigue activa ({sigue})
          </button>
          <button
            onClick={() => confirmar("reparada")}
            className="text-xs px-2.5 py-1 rounded-full border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            ✅ Ya repararon ({reparada})
          </button>
        </div>
      )}
    </div>
  );
}
