import type { MyContext } from "../session.js";
import { obtenerUsuario, actualizarColonia } from "../repositories/usuariosRepo.js";
import { calcularPrediccion, ventanaHoras, nivelDescriptivo, recomendacionPara } from "../services/prediccion.js";

function emojiNivel(nivel: string): string {
  if (nivel === "alta") return "🚨";
  if (nivel === "media") return "⚠️";
  return "✅";
}

async function entregarPrediccion(ctx: MyContext, colonia: string): Promise<void> {
  const r = await calcularPrediccion(colonia);
  const porcentaje = Math.round(r.probabilidad * 100);
  const nivel = nivelDescriptivo(r.probabilidad);
  const recomendacion = recomendacionPara(r.probabilidad);

  const mensaje = [
    `${emojiNivel(nivel)} *Predicción de tandeo en ${colonia}*`,
    "",
    `*Probabilidad:* ${porcentaje}% (${nivel})`,
    `*Ventana:* próximas ${ventanaHoras()} horas`,
    `*Factor principal:* ${r.factor_principal}`,
    "",
    `*Recomendación:* ${recomendacion}`,
    "",
    "_Modelo basado en reportes ciudadanos + factores temporales del Valle de México. Se afina con más datos de la comunidad._",
  ].join("\n");

  await ctx.reply(mensaje, { parse_mode: "Markdown" });
}

export async function handlePrediccionComando(ctx: MyContext): Promise<void> {
  try {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const usuario = await obtenerUsuario(chatId);
    if (!usuario?.colonia) {
      ctx.session.conversation = { type: "esperando_colonia_para_prediccion" };
      await ctx.reply(
        "📍 Para hacerte la predicción necesito el nombre de tu colonia. ¿En qué colonia vives?",
      );
      return;
    }

    await entregarPrediccion(ctx, usuario.colonia);
  } catch (err) {
    console.error("Error en /prediccion:", err);
    await ctx.reply("No pude calcular la predicción. Intenta en un momento.").catch(() => {});
  }
}

export async function handlePrediccionMensaje(ctx: MyContext): Promise<void> {
  try {
    const conv = ctx.session.conversation;
    if (conv.type !== "esperando_colonia_para_prediccion") return;

    const chatId = ctx.chat?.id;
    const texto = ctx.message?.text?.trim();
    if (!chatId || !texto || texto.length < 2) return;

    await actualizarColonia(chatId, texto);
    ctx.session.conversation = { type: "idle" };
    await entregarPrediccion(ctx, texto);
  } catch (err) {
    console.error("Error procesando colonia para predicción:", err);
    ctx.session.conversation = { type: "idle" };
  }
}
