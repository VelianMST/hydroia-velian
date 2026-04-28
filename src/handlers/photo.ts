import type { MyContext } from "../session.js";
import {
  analizarAguaConIA,
  type DiagnosticoAgua,
  type MimeTypeImagen,
} from "../services/claudeVision.js";
import { guardarDiagnostico } from "../repositories/diagnosticosRepo.js";
import { crearOActualizarUsuario } from "../repositories/usuariosRepo.js";

const MIME_POR_EXTENSION: Record<string, MimeTypeImagen> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function emojiRiesgo(nivel: DiagnosticoAgua["nivel_riesgo"]): string {
  switch (nivel) {
    case "bajo":
      return "✅";
    case "medio":
      return "⚠️";
    case "alto":
      return "🚨";
    default:
      return "❔";
  }
}

function etiquetaRiesgo(nivel: DiagnosticoAgua["nivel_riesgo"]): string {
  switch (nivel) {
    case "bajo":
      return "Riesgo bajo";
    case "medio":
      return "Riesgo medio";
    case "alto":
      return "Riesgo alto";
    default:
      return "Riesgo indeterminado";
  }
}

function formatearDiagnostico(d: DiagnosticoAgua): string {
  const lineas: string[] = [];
  lineas.push(`${emojiRiesgo(d.nivel_riesgo)} *${etiquetaRiesgo(d.nivel_riesgo)}*`);
  lineas.push("");
  lineas.push(`*Color observado:* ${d.color_observado}`);
  lineas.push(`*Turbidez aparente:* ${d.turbidez_aparente}`);
  lineas.push(`*Sedimentos visibles:* ${d.sedimentos_visibles ? "sí" : "no"}`);
  lineas.push("");
  lineas.push(`*Diagnóstico:* ${d.diagnostico}`);
  lineas.push("");
  lineas.push(`*Recomendación:* ${d.recomendacion}`);
  if (d.advertencia) {
    lineas.push("");
    lineas.push(`🚨 *Advertencia:* ${d.advertencia}`);
  }
  lineas.push("");
  lineas.push(
    "_Recuerda: este es un diagnóstico preliminar de tamizaje, no sustituye un análisis de laboratorio._",
  );
  return lineas.join("\n");
}

function detectarMimeType(filePath: string | undefined): MimeTypeImagen {
  if (!filePath) return "image/jpeg";
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  return MIME_POR_EXTENSION[ext] ?? "image/jpeg";
}

export async function handlePhoto(ctx: MyContext): Promise<void> {
  const photos = ctx.message?.photo;
  if (!photos || photos.length === 0) {
    await ctx.reply("No pude leer la foto. ¿Puedes reenviarla? 📸");
    return;
  }

  const aviso = await ctx.reply("🔍 Analizando tu foto, dame unos segundos...");

  try {
    const fotoMasGrande = photos[photos.length - 1];
    const file = await ctx.api.getFile(fotoMasGrande.file_id);

    if (!file.file_path) {
      throw new Error("Telegram no devolvió la ruta del archivo.");
    }

    const fileUrl = `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`;
    const respuesta = await fetch(fileUrl);
    if (!respuesta.ok) {
      throw new Error(`No se pudo descargar la foto (HTTP ${respuesta.status}).`);
    }
    const buffer = Buffer.from(await respuesta.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = detectarMimeType(file.file_path);

    const diagnostico = await analizarAguaConIA(base64, mimeType);

    const chatId = ctx.chat?.id;
    if (chatId) {
      try {
        await crearOActualizarUsuario(chatId);
        await guardarDiagnostico({
          usuario_id: chatId,
          nivel_riesgo: diagnostico.nivel_riesgo,
          color_observado: diagnostico.color_observado,
          turbidez_aparente: diagnostico.turbidez_aparente,
          sedimentos_visibles: diagnostico.sedimentos_visibles,
          diagnostico: diagnostico.diagnostico,
          recomendacion: diagnostico.recomendacion,
        });
      } catch (errDb) {
        console.error("No se pudo guardar el diagnóstico:", errDb);
      }
    }

    await ctx.reply(formatearDiagnostico(diagnostico), { parse_mode: "Markdown" });
  } catch (err) {
    console.error("Error analizando foto:", err);
    await ctx.reply(
      "Tuve un problema al analizar tu foto 😔. Intenta de nuevo en unos segundos. Si vuelve a fallar, mándame otra foto con buena luz.",
    );
  } finally {
    try {
      await ctx.api.deleteMessage(aviso.chat.id, aviso.message_id);
    } catch {
      // si no se puede borrar el aviso, no es crítico
    }
  }
}
