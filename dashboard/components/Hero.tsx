import Link from "next/link";
import { Megaphone, Send } from "lucide-react";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20 grid gap-8 md:grid-cols-2 items-center">
        <div>
          <p className="text-sm uppercase tracking-widest text-white/80 mb-3">
            Premio Nacional Juvenil del Agua 2026
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Tu app contra la crisis del agua
          </h1>
          <p className="text-lg text-white/90 mb-8 max-w-xl">
            Reporta fugas y tandeos, predice cortes en tu colonia, diagnostica tu agua con IA y
            aprende a cuidarla. IA ciudadana para el Valle de México — gratis y desde tu celular.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/reportar"
              className="inline-flex items-center gap-2 bg-white text-[color:var(--color-primary)] font-semibold px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <Megaphone className="w-4 h-4" aria-hidden />
              Reportar agua
            </Link>
            <a
              href={`https://t.me/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur text-white font-semibold px-5 py-3 rounded-xl border border-white/25 hover:bg-white/25 transition"
            >
              <Send className="w-4 h-4" aria-hidden />
              También en Telegram
            </a>
          </div>
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
