import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HydroIA Velian — Mapa Público de Aguas",
  description:
    "Mapa ciudadano en tiempo real de reportes, diagnósticos de calidad del agua y predicción de tandeos en el Valle de México. Premio Nacional Juvenil del Agua 2026.",
  openGraph: {
    title: "HydroIA Velian — Mapa Público de Aguas del Valle de México",
    description:
      "Ecosistema de IA ciudadana frente a la crisis hídrica del Valle de México.",
    type: "website",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-page text-ink">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
