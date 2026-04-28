# ✅ CHECKLIST de implementación HydroIA Velian

Imprime este archivo o tenlo abierto en una pestaña. Marca con una palomita conforme avanzas.

---

## 📋 PASO 0 — Cuentas (15 min)

- [ ] Bot creado en @BotFather → `TELEGRAM_BOT_TOKEN` copiado
- [ ] Cuenta Anthropic → saldo cargado ($5 USD min) → `ANTHROPIC_API_KEY` copiado
- [ ] Proyecto Supabase creado → `SUPABASE_URL` y `SUPABASE_KEY` (service_role) copiados
- [ ] Cuenta GitHub activa
- [ ] Cuenta Vercel activa
- [ ] Cuenta Railway activa
- [ ] Node.js instalado (`node -v` funciona)
- [ ] Claude Code activo en VS Code

---

## 🤖 PASO 1 — Bot básico (1 hora)

- [ ] Carpeta `hydroia-velian` creada
- [ ] Prompt 01 ejecutado en Claude Code
- [ ] `npm install` corrió sin errores
- [ ] `.env` creado con `TELEGRAM_BOT_TOKEN`
- [ ] `npm run dev` arranca el bot
- [ ] Bot responde a `/start` en Telegram
- [ ] Bot responde a `/ayuda` en Telegram
- [ ] 📸 Captura 1 tomada: bot saludando

---

## 👁️ PASO 2 — IA visual con Claude (1 hora)

- [ ] `ANTHROPIC_API_KEY` agregada a `.env`
- [ ] Prompt 02 ejecutado en Claude Code
- [ ] Bot recibe foto y devuelve diagnóstico en JSON
- [ ] Diagnóstico incluye: nivel de riesgo, color, turbidez, recomendación
- [ ] Probaste con 3 fotos diferentes (limpia, turbia, sucia)
- [ ] 📸 Captura 2 tomada: bot diagnosticando foto ⭐⭐⭐ ESTA ES LA MÁS IMPORTANTE

---

## 🗄️ PASO 3 — Supabase + Predictivo (1 hora)

- [ ] `SUPABASE_URL` y `SUPABASE_KEY` agregados a `.env`
- [ ] Prompt 03 ejecutado en Claude Code
- [ ] `supabase_schema.sql` corrido en Supabase SQL Editor
- [ ] Las 5 tablas existen en Supabase (verifica en Database → Tables)
- [ ] `/start` guarda usuario en BD
- [ ] Diagnóstico de foto se guarda en BD
- [ ] `/reportar` funciona y guarda en BD
- [ ] `/prediccion` devuelve probabilidad
- [ ] `/borrar` elimina todos los datos del usuario
- [ ] Endpoint `/api/sensor` responde (lo probaste con Postman o curl)
- [ ] 📸 Captura 3 tomada: bot respondiendo /prediccion
- [ ] 📸 Captura 4 tomada: tabla de Supabase con datos reales

---

## 🗺️ PASO 4 — Dashboard web (1 hora)

- [ ] Carpeta `hydroia-dashboard` creada (separada del bot)
- [ ] Prompt 04 ejecutado en Claude Code
- [ ] `.env.local` configurado con anon key
- [ ] Row Level Security configurado en Supabase
- [ ] Policies de lectura pública creadas
- [ ] `npm run dev` arranca el dashboard
- [ ] localhost:3000 muestra el dashboard
- [ ] Mapa carga y muestra marcadores
- [ ] KPIs muestran números reales
- [ ] Subiste a GitHub
- [ ] Desplegado en Vercel
- [ ] URL pública funciona desde celular
- [ ] 📸 Captura 5 tomada: dashboard funcionando ⭐ FIGURA 5 DEL DOCUMENTO

---

## 👥 EVIDENCIA REAL (CRÍTICO — el factor que decide ganar)

- [ ] Compartiste el bot con al menos 5 personas
- [ ] 5 personas mandaron al menos 1 mensaje al bot
- [ ] Tienes 3+ diagnósticos reales en Supabase (no de prueba)
- [ ] Tienes 2+ reportes ciudadanos reales
- [ ] Hiciste 2 entrevistas cortas con vecinos sobre el agua
- [ ] Anotaste 2 frases textuales para citar en el documento
- [ ] 📸 Captura 6 tomada: pantalla de WhatsApp/Telegram con 5+ personas usando el bot

---

## ✨ PASO 5 — Pulido (mañana, 30 min)

- [ ] Prompt 05 ejecutado
- [ ] Comandos /tips, /estadisticas, /sobre funcionan
- [ ] Bot desplegado en Railway (online 24/7)
- [ ] Bot sigue funcionando aunque cierres tu computadora

---

## 📄 DOCUMENTO FINAL

- [ ] Foto 1 insertada en el documento (problema del agua)
- [ ] Foto 2 insertada (diagrama de arquitectura — hecho en Excalidraw)
- [ ] Foto 3 insertada (bot diagnosticando) ⭐
- [ ] Foto 4 insertada (hardware, si aplica) o borrada
- [ ] Foto 5 insertada (dashboard) ⭐
- [ ] Cita textual #1 (entrevista vecino) pegada
- [ ] Cita textual #2 (familia que probó el bot) pegada
- [ ] `[NOMBRE COMPLETO]` reemplazado
- [ ] `[NOMBRE INSTITUCIÓN]` reemplazado
- [ ] `[Municipio]` reemplazado
- [ ] `[NOMBRE TUTOR]` reemplazado
- [ ] `[NÚMERO]` de reportes reemplazado con número real
- [ ] `[%]` de precisión reemplazado con número real
- [ ] PDF exportado
- [ ] PDF tiene 12 páginas o menos
- [ ] PDF se ve bien en celular (todas las imágenes cargan)

---

## 🎬 VIDEO DEMO

- [ ] Grabaste 2 minutos siguiendo el guion del Paso 5
- [ ] Editado en CapCut o iMovie
- [ ] Subido a YouTube como "no listado"
- [ ] Link al video copiado

---

## 📤 ENVÍO FINAL

- [ ] Cuenta creada en https://premiojuvenildelagua.cershi.org/
- [ ] PDF subido
- [ ] Video subido o link agregado
- [ ] Enlaces extras agregados (URL del dashboard, URL del bot)
- [ ] Formulario completado
- [ ] **ENVIADO antes del 28 de abril 23:59**

---

## 🎉 DESPUÉS DE ENVIAR

- [ ] Compartido en LinkedIn / Twitter / redes
- [ ] Tienes screenshot del confirmatorio de envío
- [ ] Avisaste a tu tutor

**Felicidades. Hagas lo que hagas, ya construiste algo real. 🚀**
