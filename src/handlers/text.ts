import type { MyContext } from "../session.js";
import { enrutarTexto } from "./enrutador.js";
import { aleatorio, RESPUESTAS_NO_ENTENDIDAS } from "../utils/messages.js";

export async function handleText(ctx: MyContext): Promise<void> {
  try {
    await enrutarTexto(ctx);
  } catch (err) {
    console.error("Error en handler de texto:", err);
    await ctx.reply(aleatorio(RESPUESTAS_NO_ENTENDIDAS)).catch(() => {});
  }
}
