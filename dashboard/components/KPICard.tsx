import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: number | null;
  icon: LucideIcon;
  loading?: boolean;
}

export default function KPICard({ label, value, icon: Icon, loading }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
        style={{ background: "linear-gradient(135deg, #1f4e79, #2e75b6)" }}
        aria-hidden
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">{label}</p>
        {loading || value === null ? (
          <div className="h-8 w-20 rounded bg-slate-200 animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-[color:var(--color-ink)] tabular-nums">
            {value.toLocaleString("es-MX")}
          </p>
        )}
      </div>
    </div>
  );
}
