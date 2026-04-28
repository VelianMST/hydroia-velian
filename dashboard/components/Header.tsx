import { Droplets } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #1f4e79, #2e75b6)" }}
            aria-hidden
          >
            <Droplets className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-[color:var(--color-primary)]">
              HydroIA Velian
            </p>
            <p className="text-xs text-slate-500">Mapa Público de Aguas del Valle de México</p>
          </div>
        </div>
        <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-6 text-sm">
          <a href="#mapa" className="text-slate-600 hover:text-[color:var(--color-primary)]">
            Mapa
          </a>
          <a href="#estadisticas" className="text-slate-600 hover:text-[color:var(--color-primary)]">
            Estadísticas
          </a>
          <a href="#acerca" className="text-slate-600 hover:text-[color:var(--color-primary)]">
            Acerca de
          </a>
        </nav>
      </div>
    </header>
  );
}
