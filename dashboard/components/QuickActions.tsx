import Link from "next/link";
import { Megaphone, BarChart3, Camera, Lightbulb } from "lucide-react";

const ACCIONES = [
  {
    href: "/reportar",
    label: "Reportar",
    desc: "Fuga, tandeo o mala calidad",
    icon: Megaphone,
    color: "#ef4444",
  },
  {
    href: "/prediccion",
    label: "Predicción",
    desc: "¿Se irá el agua en tu colonia?",
    icon: BarChart3,
    color: "#2e75b6",
  },
  {
    href: "/foto",
    label: "Diagnóstico",
    desc: "Analiza tu agua con una foto",
    icon: Camera,
    color: "#10b981",
  },
  {
    href: "/tips",
    label: "Tips",
    desc: "Cuida y ahorra agua en casa",
    icon: Lightbulb,
    color: "#f59e0b",
  },
];

export default function QuickActions() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
      <h2 className="text-lg font-semibold text-[color:var(--color-primary)] mb-4">
        ¿Qué quieres hacer?
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ACCIONES.map(({ href, label, desc, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
              style={{ background: color }}
              aria-hidden
            >
              <Icon className="w-5 h-5" />
            </div>
            <p className="mt-3 font-semibold text-slate-800">{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
