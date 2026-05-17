import type { MyContext } from "../session.js";
import { obtenerTexto } from "../session.js";
import { borrarPorUsuario as borrarDiagnosticosPorUsuario } from "../repositories/diagnosticosRepo.js";
import { borrarPorUsuario as borrarReportesPorUsuario } from "../repositories/reportesRepo.js";
import { borrarUsuario } from "../repositories/usuariosRepo.js";

export async function handleBorrarComando(ctx: MyContext): Promise<void> {
  try {
    ctx.session.conversation = { type: "borrar_confirmacion" };
    await ctx.reply(
      "¿Estás seguro? Esto borrará todos tus datos del sistema. Responde *sí* para confirmar o *no* para cancelar.",
      { parse_mode: "Markdown" },
    );
  } catch (err) {
    console.error("Error en /borrar:", err);
  }
}

export async function handleBorrarMensaje(ctx: MyContext): Promise<void> {
  const conv = ctx.session.conversation;
  if (conv.type !== "borrar_confirmacion") return;
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const respuesta = obtenerTexto(ctx).toLowerCase();
  if (respuesta === "sí" || respuesta === "si" || respuesta === "yes") {
    try {
      await borrarDiagnosticosPorUsuario(chatId);
      await borrarReportesPorUsuario(chatId);
      await borrarUsuario(chatId);
      ctx.session.conversation = { type: "idle" };
      await ctx.reply(
        "✅ Todos tus datos han sido eliminados. Gracias por haber usado HydroIA Velian.",
      );
    } catch (err) {
      console.error("Error al borrar datos:", err);
      ctx.session.conversation = { type: "idle" };
      await ctx
        .reply("Tuve un problema borrando tus datos. Intenta de nuevo en un momento.")
        .catch(() => {});
    }
    return;
  }

  ctx.session.conversation = { type: "idle" };
  await ctx.reply("Cancelado. Tus datos siguen guardados.");
}

export async function handleReportar(ctx: MyContext): Promise<void> {
  await ctx.reply("Función disponible próximamente.");
}

export async function handlePrediccion(ctx: MyContext): Promise<void> {
  await ctx.reply("Función disponible próximamente.");
}
