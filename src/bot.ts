import { Bot, session } from "grammy";
import { autoRetry } from "@grammyjs/auto-retry";
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
import { handleTips } from "./handlers/tips.js";
import { handleEstadisticas } from "./handlers/estadisticas.js";
import { handleSobre } from "./handlers/sobre.js";
import { handleSensor } from "./handlers/sensor.js";
import { handleCallback } from "./handlers/callbacks.js";
import { handleVoice } from "./handlers/voice.js";

export const bot = new Bot<MyContext>(config.telegramBotToken);

bot.api.config.use(autoRetry({ maxRetryAttempts: 3, maxDelaySeconds: 10 }));

bot.use(session({ initial: initialSession }));

bot.command("start", handleStart);
bot.command("ayuda", handleHelp);
bot.command("help", handleHelp);
bot.command("sobre", handleSobre);
bot.command("reportar", handleReportarComando);
bot.command("prediccion", handlePrediccionComando);
bot.command("tips", handleTips);
bot.command("estadisticas", handleEstadisticas);
bot.command("sensor", handleSensor);
bot.command("borrar", handleBorrarComando);

bot.on("callback_query:data", handleCallback);

bot.on("message:location", handleReportarUbicacion);
bot.hears("Saltar ubicación", handleReportarSaltarUbicacion);

bot.on("message:photo", handlePhoto);
bot.on("message:voice", handleVoice);
bot.on("message:audio", handleVoice);
bot.on("message:text", handleText);

bot.catch((err) => {
  console.error("Error en el bot:", err);
});

export async function setBotCommands(): Promise<void> {
  await bot.api.setMyCommands([
    { command: "start", description: "Iniciar conversación con HydroIA Velian" },
    { command: "ayuda", description: "Ver lista de comandos" },
    { command: "sobre", description: "Acerca del proyecto" },
    { command: "reportar", description: "Reportar fuga, tandeo o mala calidad" },
    { command: "prediccion", description: "Predicción de tandeos" },
    { command: "tips", description: "3 tips de ahorro de agua" },
    { command: "estadisticas", description: "Estadísticas en vivo del proyecto" },
    { command: "sensor", description: "Última lectura del sensor IoT" },
    { command: "borrar", description: "Borrar mis datos (derecho al olvido)" },
  ]);
}
