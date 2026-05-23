import type { ReactNode } from "react";

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** Encabezado y contenedor consistente para las pantallas de la app. */
export default function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[color:var(--color-primary)]">{title}</h1>
      {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}
