# HydroIA Velian — Bot de Telegram

Bot conversacional del ecosistema **HydroIA Velian**, una iniciativa de IA ciudadana para abordar la crisis hídrica del Valle de México.

Proyecto presentado al **Premio Nacional Juvenil del Agua 2026** (eliminatoria del Stockholm Junior Water Prize).

## ¿Qué hace este bot?

- 🚰 **Predicción de tandeos** — anticipa cortes de agua por colonia
- 💧 **Diagnóstico de calidad del agua** — análisis a partir de fotos
- ⚠️ **Reporte ciudadano de fugas** — geolocalización rápida desde Telegram

Alineado con el **ODS 6** de la ONU: *Agua limpia y saneamiento*.

## Stack técnico

- Node.js + TypeScript (ESM)
- [grammY](https://grammy.dev/) como cliente de la API de Telegram
- `dotenv` para variables de entorno
- `tsx` para desarrollo en caliente

## Requisitos previos

- Node.js 20 o superior
- Un token de bot de Telegram (lo obtienes con [@BotFather](https://t.me/BotFather))

## Instalación

```bash
npm install
```

## Configuración

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```
2. Edita `.env` y pega tu `TELEGRAM_BOT_TOKEN`. Las demás variables se usarán en pasos siguientes.

## Uso

Modo desarrollo (con recarga automática):

```bash
npm run dev
```

Build de producción:

```bash
npm run build
npm start
```

## Comandos disponibles

| Comando       | Descripción                                       |
|---------------|---------------------------------------------------|
| `/start`      | Bienvenida y consentimiento de privacidad         |
| `/ayuda`      | Lista de comandos disponibles                     |
| `/reportar`   | Reporte de fugas (próximamente)                   |
| `/prediccion` | Consulta de tandeos (próximamente)                |
| `/borrar`     | Derecho al olvido — borra tus datos (próximamente)|

## Estructura

```
src/
├── index.ts            # punto de entrada
├── config.ts           # variables de entorno tipadas
├── bot.ts              # instancia de grammY y registro de handlers
└── handlers/
    ├── start.ts        # /start
    ├── help.ts         # /ayuda
    ├── photo.ts        # fotos (placeholder)
    ├── text.ts         # texto general (placeholder)
    └── privacy.ts      # /borrar (placeholder)
```

## Privacidad

Solo se guarda la **colonia** del usuario (nunca la dirección exacta). El usuario puede borrar todos sus datos en cualquier momento con el comando `/borrar`.
