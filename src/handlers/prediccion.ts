import type { MyContext } from "../session.js";
import { obtenerUsuario } from "../repositories/usuariosRepo.js";
import {
  calcularPrediccion,
  ventanaHoras,
  nivelDescriptivo,
  recomendacionPara,
} from "../services/prediccion.js";
import { pedirColonia } from "./ubicacionPrompt.js";

function emojiNivel(nivel: string): string {
  if (nivel === "alta") return "🚨";
  if (nivel === "media") return "⚠️";
  return "✅";
}

export async function entregarPrediccion(
  ctx: MyContext,
  colonia: string,
): Promise<void> {
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
    "_Estimación de un modelo de regresión logística (AUC-ROC ≈ 0.80) que combina el nivel del Sistema Cutzamala, reportes ciudadanos y estacionalidad. Es un apoyo a la decisión, no un pronóstico oficial; se reentrena con datos de la comunidad._",
  ].join("\n");

  await ctx.reply(mensaje, { parse_mode: "Markdown" });
}

export async function handlePrediccionComando(ctx: MyContext): Promise<void> {
  try {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const usuario = await obtenerUsuario(chatId);
    if (!usuario?.colonia) {
      await ctx.reply(
        "Para hacerte la predicción necesito saber dónde vives.",
      );
      await pedirColonia(ctx, "prediccion");
      return;
    }

    await entregarPrediccion(ctx, usuario.colonia);
  } catch (err) {
    console.error("Error en /prediccion:", err);
    await ctx
      .reply("No pude calcular la predicción. Intenta en un momento.")
      .catch(() => {});
  }
}
