# 🔗 Mapeo: Documento del premio ↔ Software a construir

Este archivo te confirma que TODO lo que prometes en el documento de la propuesta SE CUMPLE con los 5 prompts. Útil para defensa oral o para revisar.

---

## Sección "Objetivos" del documento

| Objetivo del documento | Dónde se cumple en el software |
|---|---|
| Agente conversacional en Telegram con LLM | Prompt 1 + Prompt 2 |
| Módulo de visión computacional (3 niveles de riesgo, ≥75% precisión) | Prompt 2 |
| Modelo predictivo de tandeos (AUC-ROC ≥ 0.75) | Prompt 3 — `src/services/prediccion.ts` |
| Mapa colectivo de fugas | Prompt 4 — componente `Map.tsx` |
| Validación con 5 familias en piloto | Tu trabajo (compartir bot a 5 personas) |
| Módulo opcional de hardware (ESP32, < $700) | Endpoint `/api/sensor` ya queda preparado en Prompt 3 |
| Principios éticos (consentimiento + minimización + anonimización + olvido) | Prompts 1, 3 — comando `/borrar` y RLS en dashboard |

---

## Sección "Metodología" del documento

| Fase | En qué prompt se hace |
|---|---|
| Fase 1. Diagnóstico cualitativo | Tu trabajo (entrevistas a vecinos) |
| Fase 2. Arquitectura de 4 capas | Las 4 capas se construyen en los 4 prompts |
| Fase 3. Agente conversacional | Prompt 1 + 2 |
| Fase 4. Modelo predictivo (regresión logística) | Prompt 3 — `src/services/prediccion.ts` |
| Fase 5. Validación experimental | Tu trabajo (probar con 5 personas) |
| Fase 6. Componente hardware opcional | Endpoint listo en Prompt 3, hardware si llega |
| Aspectos éticos | Prompt 1 (consentimiento), Prompt 3 (`/borrar`, anonimización) |

---

## Las 4 capas del documento

```
Capa 1: Bot Telegram (grammY)        →  Prompt 1
Capa 2: IA (Claude API)              →  Prompt 2
Capa 3: Datos (Supabase)             →  Prompt 3
Capa 4: Visualización (Next.js)      →  Prompt 4
```

Cada capa del documento existe físicamente como código.

---

## Sección "Resultados" — KPIs del documento

| KPI | Cómo lo mides |
|---|---|
| Familias activas | Conteo `usuarios` en Supabase |
| Reportes generados | Conteo `reportes` en Supabase |
| Precisión diagnóstico visual | Tú validas manualmente las primeras 10 fotos contra lo que dijo Claude |
| AUC-ROC predicción | Lo dejas como "estimado 0.70" en piloto inicial (honesto, dataset pequeño) |
| Tiempo respuesta | Medir con `console.time()` en `claudeVision.ts` |
| Colonias cubiertas | `SELECT DISTINCT colonia FROM usuarios` |
| Ahorro pipas | Encuesta a las 5 familias después de la semana |

---

## Sección "Trabajo futuro" del documento

Cosas que mencionas que harás después y que YA están preparadas en el código:

| Promesa futura | Estado en el código |
|---|---|
| Integración hardware ESP32 | Endpoint `/api/sensor` ya existe |
| Modelo propio de visión | Estructura modular permite cambiar de Claude a modelo propio |
| Dataset abierto | Tabla `lecturas_sensor` tiene todo lo necesario |
| Lenguas indígenas | grammY soporta i18n nativamente |
| Software libre MIT | Licencia ya en README |

**Esto es importante:** durante la defensa oral, si te preguntan "¿realmente puede escalar?", muestras que el código YA está preparado para todas las fases futuras. No es marketing, es real.

---

## ¿Qué pasa si NO terminas el dashboard (Prompt 4)?

**No es problema fatal.** Sigues teniendo:
- Bot funcionando con IA
- Base de datos con reportes reales
- Documento completo

Pero **el dashboard agrega +30% de impacto visual** en la presentación. Si tienes 1 hora más, hazlo.

## ¿Qué pasa si NO terminas el predictivo (Prompt 3)?

**Esto sí es importante.** Sin el predictivo, el documento promete una función que no existe. Si no llegas, ajusta el documento para decir "modelo predictivo en desarrollo, primera versión heurística implementada". **Honestidad > impresión falsa.**

---

## Lo mínimo que TIENES que tener para enviar

Para no sentirte mal enviando algo incompleto, asegúrate de tener:

1. ✅ Prompt 1 (bot básico)
2. ✅ Prompt 2 (diagnóstico visual con IA) ← La estrella
3. ✅ Documento Word con foto del bot diagnosticando
4. ✅ Mínimo 3 personas reales que probaron el bot
5. ✅ Video de 2 minutos mostrando el bot funcionando

Con eso, **ya estás en el top 25%** de los proyectos.

Con los 5 prompts terminados + 5 personas reales + dashboard público + entrevistas + hardware → **estás en el top 5**.
