# 👁️ PASO 2 — Diagnóstico visual con Claude Vision (1 hora)

> **Pre-requisito:** Ya tienes el bot del Paso 1 corriendo y respondiendo a /start.

## Antes de empezar

1. Asegúrate de tener tu `ANTHROPIC_API_KEY` lista (la copiaste en el Paso 0)
2. Detén el bot si está corriendo (Ctrl+C en la terminal)
3. En la terminal, asegúrate de seguir en Claude Code (escribe `claude` si saliste)

---

## 📋 PROMPT — copia TODO el bloque siguiente y pégalo en Claude Code

```
Vamos a agregar el diagnóstico visual de calidad del agua usando la API de Claude (Anthropic).

CONTEXTO:
Este es el componente más importante del proyecto: cuando un usuario manda una foto de su agua (de su tinaco, llave, o cisterna) por Telegram, el bot debe analizarla con Claude Vision y devolver un diagnóstico de riesgo en menos de 10 segundos.

LO QUE NECESITO QUE HAGAS:

1. Instala el SDK oficial de Anthropic:
   npm install @anthropic-ai/sdk

2. Crea un nuevo archivo: src/services/claudeVision.ts
   - Exporta una función llamada analizarAguaConIA(imagenBase64, mimeType)
   - Usa el modelo "claude-sonnet-4-5" (es el más reciente y mejor en visión)
   - El system prompt debe instruir a Claude para que actúe como experto en calidad de agua doméstica del Valle de México
   - El user prompt debe pedirle que analice la foto y devuelva un JSON con esta estructura exacta:
     {
       "nivel_riesgo": "bajo" | "medio" | "alto",
       "color_observado": string,  // ej: "transparente", "amarillento", "café claro"
       "turbidez_aparente": "clara" | "ligeramente turbia" | "turbia" | "muy turbia",
       "sedimentos_visibles": boolean,
       "diagnostico": string,  // explicación de 1-2 oraciones, en español de México
       "recomendacion": string,  // qué debe hacer el usuario, 1-2 oraciones
       "advertencia": string | null  // si hay riesgo alto, una advertencia clara
     }
   - Si Claude no puede analizar (foto borrosa, no es agua, etc.), devuelve nivel_riesgo "indeterminado" con explicación

3. Modifica src/handlers/photo.ts para que:
   - Reciba la foto del usuario
   - La descargue de Telegram (grammY tiene métodos para esto)
   - La convierta a base64
   - Llame a analizarAguaConIA()
   - Mientras procesa, manda al usuario un mensaje "🔍 Analizando tu foto, dame unos segundos..."
   - Cuando reciba la respuesta, formatee un mensaje bonito con:
     * Emoji según el nivel de riesgo: ✅ bajo, ⚠️ medio, 🚨 alto
     * Color observado
     * Turbidez aparente
     * Si hay sedimentos
     * Diagnóstico
     * Recomendación
     * Advertencia (si aplica)
     * Una nota al final: "Recuerda: este es un diagnóstico preliminar de tamizaje, no sustituye un análisis de laboratorio."

4. Implementa el comando /borrar de verdad:
   - Por ahora, como aún no tenemos Supabase, solo responde:
     "✅ He recibido tu solicitud. Cuando guarde datos tuyos, los podrás borrar con este comando. (Función completa disponible próximamente)"

5. Agrega manejo de errores robusto:
   - Si la API de Anthropic falla, manda un mensaje amigable al usuario
   - Loggea el error en consola para depuración
   - Usa try/catch en todos los handlers

6. Asegúrate de que ANTHROPIC_API_KEY se valide al arranque del bot (si no está, que el bot no inicie y muestre un error claro)

IMPORTANTE:
- NO hagas streaming. Usa la respuesta completa.
- NO guardes la foto en disco.
- Usa max_tokens 1024 (es suficiente para el JSON).
- El temperature debe ser bajo: 0.3 (queremos consistencia, no creatividad).
- Si Claude responde con algo que no es JSON válido, intenta parsear igual y maneja el error.

DESPUÉS DE TERMINAR:
Dame instrucciones para probarlo:
1. Cómo correr el bot
2. Qué foto mandar para probar (sugerencias)
3. Qué esperar como respuesta

Procede.
```

---

## 🧪 Cómo probar

1. Corre el bot: `npm run dev`
2. Abre Telegram, ve a tu bot
3. **Mandale una foto** de:
   - Un vaso con agua de la llave
   - Una foto del agua de tu tinaco si puedes abrirlo
   - Si no tienes agua "interesante" cerca, busca en Google "agua turbia tinaco" y mándale una de esas fotos
4. Debería responderte en 5-10 segundos con el diagnóstico

📸 **Capturas para tomar (las MÁS importantes del documento):**
1. Pantalla del bot diagnosticando una foto de agua → ESTA es para la **Figura 3** del documento
2. Si tienes 2-3 fotos diferentes (clara, turbia, con sedimentos), prueba las 3 y captura cada una

---

## 🎯 Tip pro para impresionar al jurado

Toma una serie de **3 fotos del mismo vaso de agua** en estado:
1. Agua limpia (transparente)
2. Agua con un poquito de tierra (turbia ligera)
3. Agua con bastante tierra (turbia alta)

Mándalas al bot una por una. Captura las 3 respuestas. Eso te da una **secuencia visual** ganadora para el documento y para el video demo.

---

## 🆘 Errores comunes

| Error | Solución |
|---|---|
| "ANTHROPIC_API_KEY is not defined" | Pega tu llave en el archivo `.env` |
| "Insufficient credits" | Mete saldo en console.anthropic.com |
| "Invalid JSON response" | Manda otra foto (a veces Claude no la parsea bien) |
| Bot tarda más de 30 segundos | Verifica tu internet, revisa el log de la terminal |

---

## ✅ Listo? Pasa a `03_PROMPT_SUPABASE_PREDICTIVO.md`
