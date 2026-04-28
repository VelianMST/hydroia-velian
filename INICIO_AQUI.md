# 🚀 HydroIA Velian — Guía maestra de implementación

**Lee este archivo PRIMERO. Te dice exactamente qué hacer y en qué orden.**

---

## 📁 Qué hay en esta carpeta

```
hydroia-velian/
├── INICIO_AQUI.md                     ← Estás aquí
├── CHECKLIST.md                       ← Lista de tareas, marca conforme avanzas
├── 00_SETUP_CUENTAS.md                ← Cuentas que tienes que crear ANTES
├── 01_PROMPT_BOT_BASICO.md            ← Primer prompt para Claude Code
├── 02_PROMPT_CLAUDE_VISION.md         ← Segundo prompt
├── 03_PROMPT_SUPABASE_PREDICTIVO.md   ← Tercer prompt
├── 04_PROMPT_DASHBOARD.md             ← Cuarto prompt
├── 05_PROMPT_PULIDO_FINAL.md          ← Quinto prompt (opcional, para mañana)
├── env.template                       ← Plantilla de variables de entorno
└── DOCUMENTO_VS_SOFTWARE.md           ← Cómo cada función del software cumple lo del documento
```

---

## ⚡ Plan de ejecución (4-5 horas)

### **PASO 0 — AHORA mismo (15 min)**
Abre `00_SETUP_CUENTAS.md` y crea las 6 cuentas gratuitas que indica.
Al final de este paso tendrás todas tus llaves API copiadas en un block de notas.

### **PASO 1 — (1 hora) Bot básico**
1. Abre VS Code en una carpeta nueva llamada `hydroia-velian`
2. Abre la terminal (Ctrl + ñ o Cmd + `)
3. Escribe `claude` y presiona Enter (esto activa Claude Code)
4. Abre `01_PROMPT_BOT_BASICO.md`, copia todo el contenido del bloque del prompt
5. Pégalo en Claude Code y deja que trabaje
6. Sigue las instrucciones que te dé (creará archivos, te pedirá pegar el TOKEN, etc.)

✅ Al final: bot funcionando que saluda en Telegram

### **PASO 2 — (1 hora) IA visual**
Abre `02_PROMPT_CLAUDE_VISION.md`, copia y pega en Claude Code.

✅ Al final: mandas foto del agua → recibes diagnóstico real

### **PASO 3 — (1 hora) Base de datos + predicción**
Abre `03_PROMPT_SUPABASE_PREDICTIVO.md`, copia y pega.

✅ Al final: todo se guarda, predicciones funcionan, /borrar funciona

### **PASO 4 — (1 hora) Dashboard web**
Abre `04_PROMPT_DASHBOARD.md`, copia y pega.

✅ Al final: tienes un link público con mapa

### **PASO 5 — (mañana, 30 min) Pulido**
Abre `05_PROMPT_PULIDO_FINAL.md` mañana en la mañana.

✅ Al final: bot con personalidad pulida, listo para presentar

---

## 🎯 Reglas importantes mientras usas Claude Code

1. **NUNCA pegues una API KEY directamente en el código.** Ponla en `.env` (Claude Code te enseña).
2. **Si Claude Code te pide confirmar algo**, lee bien antes de aceptar.
3. **Si algo falla**, copia el error completo y pégaselo a Claude Code. Lo arreglará.
4. **Si Claude Code dice "instala X dependencia"**, déjalo correr `npm install`.
5. **Guarda capturas** del bot funcionando conforme avances (las necesitas para el documento).

---

## 📸 Capturas que necesitas ir tomando

Conforme avances, ve tomando estas capturas con tu celular o con la herramienta de captura de pantalla. Las usarás en el documento Word.

| Después del Paso | Captura a tomar |
|---|---|
| Paso 1 | Bot saludando en Telegram (mensaje /start) |
| Paso 2 | Bot diagnosticando una foto de agua (foto + respuesta) ⭐ ESTA ES LA MÁS IMPORTANTE |
| Paso 3 | Bot respondiendo a /predicción y /reportar |
| Paso 4 | Dashboard web funcionando con el mapa |

---

## 🆘 Si algo falla

1. Lee el error completo
2. Cópialo y pégalo en Claude Code: "Me da este error: [pega error]. ¿Cómo lo arreglo?"
3. Si después de 3 intentos Claude Code no lo arregla, dime y lo resolvemos juntos

---

## ✅ Cuando termines todo

1. Abre el documento Word que ya tienes (`HydroIA_Velian_Propuesta_PNJA_2026_v3_FINAL.docx`)
2. Inserta las capturas en los placeholders amarillos
3. Llena los `[CORCHETES ROJOS]` con tus datos reales y las métricas que recolectaste
4. Exporta a PDF
5. Sube al portal `premiojuvenildelagua.cershi.org`

---

**¡Vamos! Empieza por `00_SETUP_CUENTAS.md`.**
