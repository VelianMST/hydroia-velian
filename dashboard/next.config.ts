import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Hay un package-lock.json en la raíz del repo (del bot) y otro aquí.
  // Fijamos la raíz del workspace a esta carpeta para evitar que Turbopack/Vercel
  // tomen la carpeta equivocada como raíz del proyecto.
  turbopack: { root },
  // Oculta el indicador de Next DevTools (la "N" en dev). En producción no aparece.
  devIndicators: false,
};

export default nextConfig;
