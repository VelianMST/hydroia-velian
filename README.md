# 💧 HydroIA Velian

> Ecosistema de IA ciudadana para abordar la crisis hídrica del Valle de México.

Proyecto desarrollado para el **[Premio Nacional Juvenil del Agua 2026](https://agua.org.mx/premio-nacional-juvenil-del-agua/)**, eliminatoria mexicana del *Stockholm Junior Water Prize*. Alineado con el **ODS 6** de la ONU: Agua limpia y saneamiento.

🌐 **Dashboard público:** https://hydroia-velian.vercel.app
🤖 **Bot de Telegram:** [@HydroIAVelianBot](https://t.me/HydroIAVelianBot)

---

## ¿Qué hace?

| Capacidad | Descripción |
|-----------|-------------|
| 💧 **Diagnóstico de calidad del agua** | El usuario manda foto de su tinaco / llave; el bot la analiza con Claude Vision y devuelve riesgo, color, turbidez, sedimentos, recomendación. |
| 🚰 **Predicción de tandeos** | Modelo combinado: reportes ciudadanos recientes + factor temporal del Valle de México. Da probabilidad % por colonia. |
| ⚠️ **Reporte ciudadano** | Flujo guiado en Telegram para reportar fuga, tandeo prolongado o mala calidad. Aparece en mapa público. |
| 📊 **Mapa público** | Dashboard en Vercel que actualiza cada 60 s con reportes anonimizados, KPIs y gráficas. |
| 🔔 **Alertas proactivas** | El bot notifica automáticamente a usuarios cuya colonia tenga > 70% de probabilidad de corte en las próximas 72 h. |
| 🛡️ **Privacidad** | Solo se guarda la colonia (nunca dirección exacta). El usuario puede borrar todos sus datos con `/borrar`. |

## Comandos del bot

| Comando | Función |
|---------|---------|
| `/start` | Bienvenida y registro de colonia con consentimiento de privacidad |
| `/ayuda` | Lista de comandos |
| `/sobre` | Acerca del proyecto, premio y autor |
| `/reportar` | Reporte guiado de fuga, tandeo o mala calidad |
| `/prediccion` | Predicción de tandeo para tu colonia |
| `/tips` | 3 tips aleatorios de ahorro de agua (15+ tips, varían cada vez) |
| `/estadisticas` | Estadísticas en vivo del proyecto |
| `/borrar` | Derecho al olvido — borra todos tus datos |
| 📷 *Foto* | Análisis de calidad del agua con Claude Vision |

---

## Arquitectura

```
┌──────────────┐    ┌────────────────┐    ┌──────────────┐
│   Telegram   │ ─▶ │  Bot (grammY)  │ ─▶ │   Supabase   │
│              │    │  Node + TS     │    │  Postgres    │
└──────────────┘    │                │    └──────────────┘
                    │  ├─ Claude API │              │
                    │  │  (Vision)   │              │
                    │  ├─ node-cron  │              ▼
                    │  └─ Express    │    ┌──────────────┐
                    └────────────────┘    │  Dashboard   │
                                          │  Next.js +   │
                                          │  Vercel      │
                                          └──────────────┘
```

## Tecnologías

- **Bot**: Node.js 20+, TypeScript (ESM), [grammY](https://grammy.dev/), `@grammyjs/auto-retry`
- **IA**: [`@anthropic-ai/sdk`](https://docs.claude.com/) — modelo `claude-sonnet-4-5` con prompt caching
- **Base de datos**: [Supabase](https://supabase.com) (Postgres + RLS)
- **API HTTP**: Express (puerto 3001) — endpoints para sensor ESP32 y reportes públicos
- **Cron**: `node-cron` para alertas proactivas cada 6 h
- **Dashboard**: Next.js 16 (App Router), Tailwind v4, Leaflet + react-leaflet, Recharts, lucide-react
- **Despliegue**: Vercel (dashboard); el bot corre como proceso largo (Railway, Render o servidor propio)

## Instalación local

### Requisitos

- Node.js 20 o superior
- Cuenta de [Telegram](https://telegram.org) y bot creado con [@BotFather](https://t.me/BotFather)
- Cuenta y proyecto de [Supabase](https://supabase.com)
- API key de [Anthropic](https://console.anthropic.com)

### 1. Clonar e instalar

```bash
git clone https://github.com/VelianMST/hydroia-velian.git
cd hydroia-velian
npm install
```

### 2. Configurar Supabase

En el editor SQL de Supabase, corre primero el esquema:

```bash
# archivo: supabase_schema.sql
```

y después las políticas de RLS para el dashboard:

```bash
# archivo: dashboard/supabase_rls.sql
```

### 3. Variables de entorno

Crea `.env` en la raíz copiando desde `.env.example`:

```bash
TELEGRAM_BOT_TOKEN=...      # token de @BotFather
ANTHROPIC_API_KEY=sk-ant-... # de console.anthropic.com
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...          # service_role (para el bot)
PORT=3001                    # opcional, puerto del servidor HTTP
```

### 4. Correr el bot

```bash
npm run dev
```

Verás:
```
🌐 API HTTP escuchando en http://localhost:3001
💧 HydroIA Velian iniciando...
✅ Bot conectado como @HydroIAVelianBot
Notificaciones proactivas: cada 6 h.
```

### 5. Correr el dashboard (opcional, en otra terminal)

```bash
cd dashboard
cp .env.example .env.local   # rellena con NEXT_PUBLIC_SUPABASE_URL y la anon key
npm install
npm run dev                  # http://localhost:3000
```

---

## Estructura del proyecto

```
hydroia-velian/
├── src/                          # código del bot
│   ├── index.ts                  # punto de entrada
│   ├── bot.ts                    # instancia grammY + handlers + auto-retry
│   ├── config.ts                 # variables de entorno tipadas
│   ├── branding.ts               # constantes del proyecto
│   ├── session.ts                # tipo de contexto + máquina de estados
│   ├── api/server.ts             # endpoints Express (sensor ESP32, reportes públicos)
│   ├── handlers/                 # un archivo por comando / evento
│   │   ├── start.ts
│   │   ├── help.ts
│   │   ├── sobre.ts
│   │   ├── photo.ts
│   │   ├── text.ts
│   │   ├── reportar.ts
│   │   ├── prediccion.ts
│   │   ├── tips.ts
│   │   ├── estadisticas.ts
│   │   ├── privacy.ts            # /borrar
│   │   └── callbacks.ts          # botones inline después del diagnóstico
│   ├── services/
│   │   ├── claudeVision.ts       # análisis de fotos con Claude Sonnet 4.5
│   │   ├── claudeText.ts         # respuestas conversacionales
│   │   ├── supabase.ts           # cliente tipado
│   │   ├── prediccion.ts         # modelo de tandeos
│   │   ├── tips.ts               # base de tips (15+)
│   │   └── notificaciones.ts     # cron job de alertas
│   ├── repositories/
│   │   ├── usuariosRepo.ts
│   │   ├── diagnosticosRepo.ts
│   │   ├── reportesRepo.ts
│   │   └── prediccionesRepo.ts
│   └── utils/messages.ts         # mensajes con variaciones aleatorias
├── dashboard/                    # Next.js 16 — mapa público
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── supabase_rls.sql
├── supabase_schema.sql           # esquema completo de la BD
└── README.md
```

## Capturas de pantalla

> Sustituye los `TODO` por tus capturas reales antes de presentar al jurado.

| Bot — Bienvenida | Bot — Diagnóstico | Dashboard |
|:-:|:-:|:-:|
| `TODO: docs/img/bot-start.png` | `TODO: docs/img/bot-diagnostico.png` | `TODO: docs/img/dashboard.png` |

## Privacidad y ética

- ✅ Solo se almacena la colonia (no dirección exacta)
- ✅ Coordenadas redondeadas a 2 decimales (~1 km de precisión) si se usan
- ✅ Datos personales **nunca** se exponen en el dashboard
- ✅ Comando `/borrar` elimina todos los datos del usuario (derecho al olvido, GDPR-style)
- ✅ Row Level Security en Supabase: la tabla `usuarios` no es accesible desde el dashboard
- ✅ Diagnósticos en el dashboard solo exponen `nivel_riesgo` y `fecha`

## Licencia

MIT — ver [LICENSE](LICENSE).

## Créditos

Proyecto desarrollado por **Angel Velian (VelianMST)** para el **Premio Nacional Juvenil del Agua 2026**.

Construido con la ayuda de comunidad open-source: [grammY](https://grammy.dev/), [Supabase](https://supabase.com), [Next.js](https://nextjs.org), [Anthropic Claude](https://www.anthropic.com), [Leaflet](https://leafletjs.com).
