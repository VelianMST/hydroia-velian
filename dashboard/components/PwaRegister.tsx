"use client";

import { useEffect } from "react";

/** Registra el service worker para que la app sea instalable (PWA). */
export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* sin SW la app sigue funcionando como web normal */
      });
    }
  }, []);
  return null;
}
