import type { MyContext } from "../session.js";
import { TIPS_LIMPIEZA_TINACO } from "../services/tips.js";

export async function handleCallback(ctx: MyContext): Promise<void> {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  try {
    if (data === "diag:reportar") {
      await ctx.answerCallbackQuery();
      ctx.session.conversation = {
        type: "reporte_descripcion",
        tipoReporte: "mala_calidad",
      };
      await ctx.reply(
        "📝 Vamos a registrar el reporte de *mala calidad*. Cuéntame brevemente qué notas en tu agua (color, olor, sedimentos, desde cuándo).",
        { parse_mode: "Markdown" },
      );
      return;
    }

    if (data === "diag:limpieza") {
      await ctx.answerCallbackQuery();
      await ctx.reply(TIPS_LIMPIEZA_TINACO, { parse_mode: "Markdown" });
      return;
    }

    if (data.startsWith("diag:compartir:")) {
      await ctx.answerCallbackQuery({
        text: "¡Gracias por aportar a la comunidad!",
        show_alert: false,
      });
      await ctx.reply(
        "🌐 Tu diagnóstico ya forma parte de las estadísticas públicas del dashboard, *de forma anonimizada* (solo se muestra el nivel de riesgo y la fecha; nunca tu identidad ni tu colonia exacta). ¡Gracias por sumarte! 💧",
        { parse_mode: "Markdown" },
      );
      return;
    }

    await ctx.answerCallbackQuery();
  } catch (err) {
    console.error("Error en callback query:", err);
    try {
      await ctx.answerCallbackQuery({ text: "Tuve un problema, intenta de nuevo." });
    } catch {
      // ignore
    }
  }
}
