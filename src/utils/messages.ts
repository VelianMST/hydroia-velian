export function aleatorio<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const SALUDOS_ABIERTOS = [
  "¡Hola! 💧",
  "¡Qué tal!",
  "¡Hey, qué bueno verte!",
  "¡Hola, gracias por escribirme!",
];

export const AGRADECIMIENTOS_REPORTE = [
  "✅ Reporte registrado. ¡Gracias por aportar a la comunidad! 💧",
  "✅ Anotado. Tu reporte ayuda a otra familia a prepararse. Mil gracias.",
  "✅ Listo. Cada reporte hace una diferencia real. Gracias por sumarte 🚰",
  "✅ Recibido. Lo hiciste por tu colonia y por todo el Valle de México. ¡Gracias!",
  "✅ Gracias. Tu reporte ya forma parte del mapa público de HydroIA Velian.",
];

export const ANIMOS_DESPUES_DE_FOTO = [
  "Gracias por mandarme la foto, así aprendemos juntos cómo está el agua de tu zona.",
  "Tu foto suma a la base ciudadana — gracias por compartirla.",
];

export const RESPUESTAS_NO_ENTENDIDAS = [
  "No te entendí del todo, pero estoy aquí para ayudarte. Prueba con /ayuda para ver lo que sé hacer.",
  "Esa no la pesqué bien. Usa /ayuda para ver cómo te puedo ayudar.",
];
