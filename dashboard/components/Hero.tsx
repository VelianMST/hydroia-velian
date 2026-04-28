import { Send } from "lucide-react";

export default function Hero() {
  const username = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "HydroIAVelianBot";
  return (
    <section
      className="text-white"
      style={{
        background:
          "linear-gradient(135deg, var(--color-primary), var(--color-primary-soft))",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid gap-8 md:grid-cols-2 items-center">
        <div>
          <p className="text-sm uppercase tracking-widest text-white/80 mb-3">
            Premio Nacional Juvenil del Agua 2026
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            HydroIA Velian
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl">
            Mapa público y en tiempo real de la crisis hídrica del Valle de México: reportes
            ciudadanos de fugas y tandeos, diagnóstico visual del agua con IA y predicción de
            cortes por colonia.
          </p>
          <a
            href={`https://t.me/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[color:var(--color-primary)] font-semibold px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition"
          >
            <Send className="w-4 h-4" aria-hidden />
            Únete por Telegram
          </a>
        </div>
        <div className="hidden md:flex justify-end">
          <div
            className="w-64 h-64 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center text-7xl"
            aria-hidden
          >
            💧
          </div>
        </div>
      </div>
    </section>
  );
}
