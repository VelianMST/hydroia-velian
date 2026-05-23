"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplets } from "lucide-react";
import { NAV_ITEMS } from "./navItems";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
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
            <p className="text-xs text-slate-500">IA ciudadana por el agua del Valle de México</p>
          </div>
        </Link>
        <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-6 text-sm">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "text-[color:var(--color-primary)] font-semibold"
                    : "text-slate-600 hover:text-[color:var(--color-primary)]"
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
