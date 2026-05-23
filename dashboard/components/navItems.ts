import { Home, Megaphone, BarChart3, Camera, Lightbulb, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Secciones de la app, compartidas por la barra inferior (móvil) y el header (escritorio). */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/reportar", label: "Reportar", icon: Megaphone },
  { href: "/prediccion", label: "Predicción", icon: BarChart3 },
  { href: "/foto", label: "Foto", icon: Camera },
  { href: "/tips", label: "Tips", icon: Lightbulb },
];
