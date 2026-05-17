import type { MyContext } from "../session.js";
import { supabase } from "../services/supabase.js";
import { BRANDING } from "../branding.js";

interface ConteoRespuesta {
  count: number | null;
}

async function contarFila(tabla: string): Promise<number> {
  const { count, error }: ConteoRespuesta & { error: unknown } = await supabase
    .from(tabla)
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

async function contarColonias(): Promise<number> {
  const { data, error } = await supabase.from("usuarios").select("colonia");
  if (error) throw error;
  const set = new Set<string>();
  for (const fila of data ?? []) {
    if (fila.colonia) set.add(fila.colonia.trim().toLowerCase());
  }
  return set.size;
}

export async function handleEstadisticas(ctx: MyContext): Promise<void> {
  try {
    const aviso = await ctx.reply("📊 Calculando estadísticas...");

    const [usuarios, reportes, diagnosticos, colonias] = await Promise.all([
      contarFila("usuarios"),
      contarFila("reportes"),
      contarFila("diagnosticos"),
      contarColonias(),
    ]);

    const mensaje = [
      "📊 *HydroIA Velian — Estadísticas en vivo*",
      "",
      `👥 *Familias registradas:* ${usuarios.toLocaleString("es-MX")}`,
      `📍 *Colonias cubiertas:* ${colonias.toLocaleString("es-MX")}`,
      `⚠️ *Reportes ciudadanos:* ${reportes.toLocaleString("es-MX")}`,
      `💧 *Diagnósticos realizados:* ${diagnosticos.toLocaleString("es-MX")}`,
      "",
      `🌐 Dashboard público: ${BRANDING.dashboardUrl}`,
    ].join("\n");

    try {
      await ctx.api.deleteMessage(aviso.chat.id, aviso.message_id);
    } catch {
      // best effort
    }

    await ctx.reply(mensaje, {
      parse_mode: "Markdown",
      link_preview_options: { is_disabled: true },
    });
  } catch (err) {
    console.error("Error en /estadisticas:", err);
    await ctx
      .reply("No pude calcular las estadísticas en este momento. Intenta en un rato.")
      .catch(() => {});
  }
}
