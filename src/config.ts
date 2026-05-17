import "dotenv/config";

export interface Config {
  telegramBotToken: string;
  anthropicApiKey: string;
  supabaseUrl: string;
  supabaseKey: string;
  openaiApiKey: string;
  port: number;
}

function optional(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Falta la variable de entorno ${name}. Revisa tu archivo .env (puedes copiarlo desde .env.example).`,
    );
  }
  return value;
}

function optionalNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export const config: Config = {
  telegramBotToken: required("TELEGRAM_BOT_TOKEN"),
  anthropicApiKey: required("ANTHROPIC_API_KEY"),
  supabaseUrl: required("SUPABASE_URL"),
  supabaseKey: required("SUPABASE_KEY"),
  openaiApiKey: optional("OPENAI_API_KEY"),
  port: optionalNumber("PORT", 3001),
};
