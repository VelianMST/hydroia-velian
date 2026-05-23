import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hydroia-velian.vercel.app"),
  applicationName: "HydroIA Velian",
  title: "HydroIA Velian — IA ciudadana por el agua",
  description:
    "App ciudadana frente a la crisis hídrica del Valle de México: reporta fugas y tandeos, predice cortes por colonia, diagnostica el agua con IA y ahorra agua. Premio Nacional Juvenil del Agua 2026.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HydroIA",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-icon",
  },
  openGraph: {
    title: "HydroIA Velian — IA ciudadana por el agua del Valle de México",
    description:
      "Ecosistema de IA ciudadana frente a la crisis hídrica del Valle de México.",
    type: "website",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#1f4e79",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-page text-ink">
        <Header />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Footer />
        <BottomNav />
        <PwaRegister />
      </body>
    </html>
  );
}
