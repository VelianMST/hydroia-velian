import type { MyContext } from "../session.js";

const HELP_MESSAGE = `Estos son los comandos disponibles:

/start — bienvenida y registro de tu colonia
/ayuda — esta lista de comandos
/reportar — reportar una fuga, tandeo o mala calidad
/prediccion — consultar la predicción de tandeos para tu colonia
/borrar — borrar todos tus datos (derecho al olvido)

También puedes mandarme una foto del agua que sale de tu llave y te digo qué observo. 💧`;

export async function handleHelp(ctx: MyContext): Promise<void> {
  try {
    await ctx.reply(HELP_MESSAGE);
  } catch (err) {
    console.error("Error en /ayuda:", err);
  }
}
