import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HydroIA Velian",
    short_name: "HydroIA",
    description:
      "Ecosistema de IA ciudadana frente a la crisis hídrica del Valle de México: reporta fugas y tandeos, predice cortes por colonia, diagnostica el agua con IA y ahorra agua.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#1f4e79",
    lang: "es",
    orientation: "portrait",
    categories: ["utilities", "education", "health"],
    icons: [
      { src: "/icons/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
