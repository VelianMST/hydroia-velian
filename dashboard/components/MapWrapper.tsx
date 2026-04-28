"use client";

import dynamic from "next/dynamic";
import type { ReportePublico } from "@/lib/supabase";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl" aria-label="Cargando mapa" />
  ),
});

export default function MapWrapper({ reportes }: { reportes: ReportePublico[] }) {
  return <Map reportes={reportes} />;
}
