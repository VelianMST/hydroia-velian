import type { MyContext } from "../session.js";
import { BRANDING } from "../branding.js";

const MENSAJE = `🌎 *${BRANDING.nombreProyecto}*

Soy un asistente ciudadano frente a la crisis hídrica del Valle de México. Mi propósito es que cualquier persona, desde su celular, pueda:

🚰 Anticipar tandeos en su colonia.
💧 Diagnosticar la calidad del agua que sale de su llave con una foto.
⚠️ Reportar fugas y mala calidad para visibilizarlas en un mapa público.

📊 Mapa y estadísticas en vivo:
${BRANDING.dashboardUrl}

🏆 *${BRANDING.premio}*
Eliminatoria mexicana del Stockholm Junior Water Prize.

🌱 *${BRANDING.ods}* (ONU).

👤 Proyecto desarrollado por *${BRANDING.autor}*.

Para empezar, usa /start. Para ver lo que sé hacer, /ayuda.`;

export async function handleSobre(ctx: MyContext): Promise<void> {
  try {
    await ctx.reply(MENSAJE, {
      parse_mode: "Markdown",
      link_preview_options: { is_disabled: true },
    });
  } catch (err) {
    console.error("Error en /sobre:", err);
  }
}
