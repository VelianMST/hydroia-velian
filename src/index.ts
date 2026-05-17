import { bot, setBotCommands } from "./bot.js";
import { iniciarServidorHttp } from "./api/server.js";
import { iniciarNotificaciones } from "./services/notificaciones.js";
import { programarIngesta } from "./services/datosAbiertos.js";

async function main(): Promise<void> {
  iniciarServidorHttp();
  await setBotCommands();
  iniciarNotificaciones(bot);
  programarIngesta();

  console.log("💧 HydroIA Velian iniciando...");

  bot.start({
    onStart: (info) => {
      console.log(`✅ Bot conectado como @${info.username}`);
      console.log("Notificaciones proactivas: cada 6 h.");
      console.log("Ingesta de datos abiertos: al arranque + diaria 05:00.");
      console.log("Presiona Ctrl+C para detenerlo.");
    },
  });
}

main().catch((err) => {
  console.error("No se pudo iniciar el bot:", err);
  process.exit(1);
});

const shutdown = (signal: string) => {
  console.log(`\nRecibida señal ${signal}, deteniendo el bot...`);
  bot.stop();
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
