# ✨ PASO 5 — Pulido final (mañana, 30-60 min)

> **Pre-requisito:** Pasos 1, 2, 3 y 4 funcionando.
> **Cuándo:** Mañana en la mañana, antes del cierre del concurso.

---

## 📋 PROMPT — copia TODO el bloque siguiente y pégalo en Claude Code (en la carpeta del bot)

```
Vamos a darle el toque final al bot HydroIA Velian para presentación en el Premio Nacional Juvenil del Agua.

LO QUE NECESITO:

1. PERSONALIDAD MEJORADA:
   - Refina todos los mensajes del bot para que suenen más cálidos y humanos
   - Variaciones aleatorias en saludos para que no se sienta robótico
   - Agrega 3-5 mensajes alentadores aleatorios cuando un usuario completa un reporte (ej: "¡Gracias por aportar a la comunidad! 💧")

2. NUEVO COMANDO /tips:
   - Da 3 tips aleatorios de ahorro de agua, contextualizados para Valle de México
   - Cada vez que se llama, devuelve tips diferentes
   - Total mínimo: 15 tips distintos
   - Categorías: cocina, baño, lavadora, riego, almacenamiento

3. NUEVO COMANDO /estadisticas:
   - Muestra estadísticas en vivo: cuántos usuarios, cuántos reportes, cuántas colonias cubiertas
   - Saca los datos de Supabase
   - Formato bonito con emojis

4. NUEVO COMANDO /sobre:
   - Explica qué es HydroIA Velian
   - Menciona el Premio Nacional Juvenil del Agua
   - Menciona ODS 6
   - Menciona que es proyecto de [PON_AQUI_TU_NOMBRE]
   - Da el link al dashboard

5. MEJORA EN EL DIAGNÓSTICO DE FOTO:
   - Después del diagnóstico, ofrece al usuario 3 botones inline:
     a) "Reportar mala calidad" (lleva al flujo de /reportar)
     b) "Ver tips de limpieza" (manda tips específicos de limpieza de tinaco)
     c) "Compartir en mapa público" (le pregunta si quiere que su diagnóstico anonimizado aparezca en el dashboard)

6. NOTIFICACIONES PROACTIVAS (BONUS si hay tiempo):
   - Crea un cron job que cada 6 horas:
     a) Calcula predicciones para todas las colonias con usuarios registrados
     b) Si una predicción supera 70%, manda mensaje proactivo: "⚠️ Alerta: hay 75% de probabilidad de tandeo en tu colonia en las próximas 72 horas. Te recomiendo llenar tinacos hoy."
   - Usa node-cron: npm install node-cron @types/node-cron

7. CALIDAD DEL CÓDIGO:
   - Asegúrate que no haya `console.log` de depuración en producción (solo errores)
   - Maneja errores de red con reintentos automáticos (max 3)
   - Si Telegram da rate limit, espera y reintenta

8. README.md COMPLETO:
   Reescríbelo con:
   - Descripción del proyecto
   - Tecnologías usadas
   - Cómo instalar y correr
   - Variables de entorno necesarias
   - Estructura del proyecto
   - Capturas de pantalla (deja placeholders)
   - Licencia MIT
   - Créditos: "Proyecto desarrollado para el Premio Nacional Juvenil del Agua 2026"

DESPUÉS DE TERMINAR:
- Corre el bot
- Pruébalo todo
- Dame un resumen de todo lo que funciona

Procede.
```

---

## 🚀 Despliegue del bot a Railway (para que esté online 24/7)

Mientras Claude Code trabaja en lo de arriba, en otra terminal sube el bot a Railway:

1. **Sube el bot a GitHub:**
   ```bash
   cd /ruta/a/hydroia-velian
   git init
   git add .
   git commit -m "Bot HydroIA Velian"
   git remote add origin https://github.com/TU_USUARIO/hydroia-velian-bot.git
   git push -u origin main
   ```

2. **En Railway:**
   - railway.app → New Project → Deploy from GitHub
   - Selecciona el repo
   - En Variables, agrega TODAS las del .env:
     - `TELEGRAM_BOT_TOKEN`
     - `ANTHROPIC_API_KEY`
     - `SUPABASE_URL`
     - `SUPABASE_KEY`
   - Settings → Deploy → Start Command: `npm run dev` (o `npm start` si tienes el script)
   - Deploy

3. **Verifica:** Manda un mensaje a tu bot. Si responde, está vivo en la nube. Ya no depende de tu computadora.

---

## 🎬 Grabar video demo de 2 minutos (CLAVE para Premio del Público)

Una vez todo funcione, graba un video de 2 minutos. Plan:

**Segundo 0-15:** Tu cara, presentándote, diciendo el problema
> "Hola, soy [nombre]. Vivo en [colonia, Estado de México]. En mi colonia tenemos cortes de agua sin aviso, y nunca sabemos si el agua del tinaco está limpia. Por eso creé HydroIA Velian."

**Segundo 15-45:** Demo del bot
- Pantalla del celular con Telegram
- Mandas /start
- Mandas una foto del agua
- Muestras el diagnóstico
- Mandas /reportar y completas un reporte
- Mandas /prediccion

**Segundo 45-90:** Demo del dashboard
- Pantalla del navegador con la URL pública
- Muestras el mapa, los KPIs, las gráficas
- Resaltas que es público y gratuito

**Segundo 90-120:** Cierre
- Tu cara otra vez
- Impacto: "Con HydroIA Velian, [X] familias de Nicolás Romero ya pueden anticipar cortes y diagnosticar su agua. Replicable en todo el Valle de México."
- Llamada: "Vota por HydroIA Velian — premio del público — Premio Nacional Juvenil del Agua 2026."

**Tip:** grábalo con tu celular en horizontal. Edítalo en CapCut (gratis) si necesitas.

---

## 📝 Subir todo al portal del premio

1. Ve a https://premiojuvenildelagua.cershi.org/
2. Inicia sesión / regístrate
3. Sube:
   - El **PDF** de tu propuesta (con todas las fotos insertadas)
   - El **video** de 2 minutos
   - Cualquier anexo: link al dashboard, link al bot, link al repo de GitHub
4. **Envía** antes del cierre (28 de abril)

---

## ✅ Después de enviar

Avísame y celebramos. Has hecho un trabajo enorme en muy pocas horas.
