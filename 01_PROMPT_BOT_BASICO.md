# 🤖 PASO 1 — Bot básico de Telegram (1 hora)

## Antes de empezar

1. Abre VS Code
2. Crea una carpeta nueva en algún lugar de tu computadora llamada `hydroia-velian`
3. **File → Open Folder** y abre esa carpeta vacía
4. Abre la terminal integrada (Ctrl + ñ o View → Terminal)
5. Activa Claude Code: escribe `claude` y presiona Enter
   - Si te pide login, sigue las instrucciones
6. Cuando veas el prompt de Claude Code (`>`), pega el bloque de abajo

---

## 📋 PROMPT — copia TODO el bloque siguiente y pégalo en Claude Code

```
Crea un proyecto en Node.js + TypeScript para un bot de Telegram llamado "HydroIA Velian".

CONTEXTO DEL PROYECTO:
HydroIA Velian es un ecosistema de IA ciudadana para abordar la crisis hídrica del Valle de México. Este bot es el componente conversacional principal. Es para el Premio Nacional Juvenil del Agua 2026 (eliminatoria del Stockholm Junior Water Prize).

STACK TÉCNICO:
- Node.js con TypeScript
- Módulos ESM (no CommonJS)
- Librería de Telegram: grammY (NO uses node-telegram-bot-api)
- Variables de entorno con dotenv
- Para correr en desarrollo: tsx

ESTRUCTURA DE ARCHIVOS A CREAR:
1. package.json — con scripts "dev" (tsx watch src/index.ts) y "build" (tsc)
2. tsconfig.json — TypeScript moderno, target ES2022, module ESNext, moduleResolution Bundler
3. .gitignore — node_modules, .env, dist
4. .env.example — con las variables que se necesitarán
5. README.md — instrucciones de instalación y uso
6. src/index.ts — punto de entrada, valida variables de entorno y arranca el bot
7. src/config.ts — carga y exporta variables de entorno tipadas
8. src/bot.ts — instancia del bot grammY y registro de handlers
9. src/handlers/start.ts — comando /start
10. src/handlers/help.ts — comando /ayuda
11. src/handlers/photo.ts — recibe fotos (placeholder por ahora)
12. src/handlers/text.ts — recibe texto general (placeholder por ahora)
13. src/handlers/privacy.ts — comando /borrar (placeholder por ahora)

COMANDOS DEL BOT:
- /start: saluda con bienvenida, explica qué hace HydroIA Velian (predicción de tandeos, diagnóstico de calidad del agua, reporte de fugas), pide consentimiento de privacidad con un mensaje claro, y al final pregunta la colonia donde vive el usuario
- /ayuda: lista detallada de comandos disponibles
- /reportar: para reportar fugas (de momento solo dice "Función disponible próximamente")
- /prediccion: para consultar tandeos (de momento solo dice "Función disponible próximamente")
- /borrar: derecho al olvido (de momento solo dice "Función disponible próximamente")

PERSONALIDAD DEL BOT:
- Idioma: español de México, tono cercano y respetuoso
- Tutea al usuario (no usted)
- Usa emojis con moderación: 💧 🚰 ⚠️ ✅ 📍 (no más de 1-2 por mensaje)
- Mensajes cortos y claros, evita párrafos largos
- En el /start, incluye este texto literal en la sección de privacidad:
  "Para proteger tus datos: solo guardo tu colonia (no tu dirección exacta), no comparto info personal y puedes pedirme que borre todo con /borrar."

MENSAJE DE BIENVENIDA (/start):
Debe incluir:
1. Saludo cálido
2. Explicación de las 3 funciones principales
3. Mención al ODS 6 de la ONU
4. Política de privacidad resumida (texto literal de arriba)
5. Pregunta final: "¿En qué colonia vives? Solo necesito el nombre de la colonia, no la dirección exacta."

VARIABLES DE ENTORNO (.env.example):
TELEGRAM_BOT_TOKEN=
ANTHROPIC_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=

NO IMPLEMENTAR TODAVÍA (lo haremos en pasos siguientes):
- La lógica real de Claude API
- La conexión real a Supabase
- El análisis real de fotos
- El modelo predictivo

DESPUÉS DE CREAR TODO:
1. Ejecuta npm install para instalar dependencias
2. Dame instrucciones paso a paso para:
   a) Pegar mi TELEGRAM_BOT_TOKEN en .env
   b) Correr el bot con npm run dev
   c) Probarlo en Telegram

Procede.
```

---

## 🔧 Mientras Claude Code trabaja

Te va a pedir cosas. Aquí lo que debes hacer:

1. **Si pregunta "¿quieres que ejecute npm install?"** → Sí
2. **Cuando termine, te dirá que crees un archivo .env** → hazlo
3. **Pega tu TELEGRAM_BOT_TOKEN** en .env (el que copiaste del @BotFather)
4. Las otras 3 variables del .env por ahora puedes dejarlas vacías o con cualquier valor (las usaremos en el siguiente paso)

---

## ✅ Cómo saber que funcionó

1. Corres `npm run dev` en la terminal
2. La terminal dice algo como "Bot started" o "Listening..."
3. Abres Telegram, buscas el username de tu bot (ej: `@HydroIAVelianBot`)
4. Le mandas `/start`
5. Te responde con el mensaje de bienvenida

📸 **Toma una captura de pantalla** del bot saludándote. La vas a usar después.

---

## 🆘 Si algo falla

Copia el error completo y pégaselo a Claude Code así:

> "Me da este error al correr npm run dev:
> [pega el error completo]
> ¿Cómo lo arreglo?"

---

## ✅ Listo? Pasa a `02_PROMPT_CLAUDE_VISION.md`
