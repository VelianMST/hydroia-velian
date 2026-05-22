import type { MyContext } from "../session.js";

const HELP_MESSAGE = `Estos son los comandos disponibles:

/start — bienvenida y registro de tu colonia
/ayuda — esta lista de comandos
/sobre — qué es HydroIA Velian
/reportar — reportar fuga, tandeo o mala calidad
/prediccion — predicción de tandeos para tu colonia
/tips — 3 tips de ahorro de agua (varían cada vez)
/estadisticas — estadísticas en vivo del proyecto
/sensor — última lectura del sensor IoT (turbidez, TDS, temperatura)
/borrar — borrar todos tus datos (derecho al olvido)

📷 Mándame también una foto del agua de tu llave o tinaco y te digo qué observo. 💧`;

export async function handleHelp(ctx: MyContext): Promise<void> {
  try {
    await ctx.reply(HELP_MESSAGE);
  } catch (err) {
    console.error("Error en /ayuda:", err);
  }
}
