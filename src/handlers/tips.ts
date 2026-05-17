import type { MyContext } from "../session.js";
import { tresTipsAleatorios } from "../services/tips.js";

export async function handleTips(ctx: MyContext): Promise<void> {
  try {
    const tips = tresTipsAleatorios();
    const cuerpo = tips.map((t, i) => `*${i + 1}.* ${t.texto}`).join("\n\n");
    const mensaje = `💧 *3 tips para ahorrar agua en el Valle de México*\n\n${cuerpo}\n\n_Vuelve a escribir /tips para recibir 3 distintos._`;
    await ctx.reply(mensaje, { parse_mode: "Markdown" });
  } catch (err) {
    console.error("Error en /tips:", err);
  }
}
