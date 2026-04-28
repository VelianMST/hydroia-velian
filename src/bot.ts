import { Bot, session } from "grammy";
import { config } from "./config.js";
import { initialSession, type MyContext } from "./session.js";
import { handleStart } from "./handlers/start.js";
import { handleHelp } from "./handlers/help.js";
import { handlePhoto } from "./handlers/photo.js";
import { handleText } from "./handlers/text.js";
import { handleBorrarComando } from "./handlers/privacy.js";
import {
  handleReportarComando,
  handleReportarUbicacion,
  handleReportarSaltarUbicacion,
} from "./handlers/reportar.js";
import { handlePrediccionComando } from "./handlers/prediccion.js";

export const bot = new Bot<MyContext>(config.telegramBotToken);

bot.use(session({ initial: initialSession }));

bot.command("start", handleStart);
bot.command("ayuda", handleHelp);
bot.command("help", handleHelp);
bot.command("reportar", handleReportarComando);
bot.command("prediccion", handlePrediccionComando);
bot.command("borrar", handleBorrarComando);

bot.on("message:location", handleReportarUbicacion);
bot.hears("Saltar ubicación", handleReportarSaltarUbicacion);

bot.on("message:photo", handlePhoto);
bot.on("message:text", handleText);

bot.catch((err) => {
  console.error("Error en el bot:", err);
});

export async function setBotCommands(): Promise<void> {
  await bot.api.setMyCommands([
    { command: "start", description: "Iniciar conversación con HydroIA Velian" },
    { command: "ayuda", description: "Ver lista de comandos" },
    { command: "reportar", description: "Reportar una fuga, tandeo o mala calidad" },
    { command: "prediccion", description: "Consultar predicción de tandeos" },
    { command: "borrar", description: "Borrar mis datos (derecho al olvido)" },
  ]);
}
