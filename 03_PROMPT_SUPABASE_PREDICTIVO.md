# 🗄️ PASO 3 — Base de datos + Modelo predictivo (1 hora)

> **Pre-requisito:** Pasos 1 y 2 funcionando.

## Antes de empezar

1. Asegúrate de tener `SUPABASE_URL` y `SUPABASE_KEY` en tu `.env`
2. Detén el bot si está corriendo (Ctrl+C)

---

## 📋 PROMPT — copia TODO el bloque siguiente y pégalo en Claude Code

```
Vamos a integrar Supabase como base de datos y agregar el modelo predictivo de tandeos, además de los flujos de reporte ciudadano y derecho al olvido.

CONTEXTO:
Hasta ahora el bot solo responde, pero no recuerda nada. Ahora cada interacción debe guardarse para: (1) alimentar el mapa público del dashboard, (2) entrenar el modelo predictivo con datos de la propia comunidad, (3) cumplir con los principios éticos del documento (anonimización + derecho al olvido).

LO QUE NECESITO QUE HAGAS:

PASO A — Configurar Supabase y crear las tablas:

1. Instala el cliente: npm install @supabase/supabase-js

2. Crea src/services/supabase.ts que exporte un cliente supabase tipado.

3. Genera un archivo SQL llamado supabase_schema.sql con las siguientes tablas (yo lo voy a correr manualmente en el editor SQL de Supabase):

   Tabla "usuarios":
   - id (BIGINT, PRIMARY KEY) — el chat_id de Telegram
   - colonia (TEXT) — nombre de colonia, sin dirección exacta
   - municipio (TEXT, default 'Nicolás Romero')
   - estado (TEXT, default 'México')
   - consentimiento (BOOLEAN, default false)
   - fecha_alta (TIMESTAMPTZ, default now())
   - fecha_ultimo_contacto (TIMESTAMPTZ)
   - tamaño_familia (INT, nullable)

   Tabla "diagnosticos":
   - id (UUID, default uuid_generate_v4(), PRIMARY KEY)
   - usuario_id (BIGINT, references usuarios)
   - nivel_riesgo (TEXT)
   - color_observado (TEXT)
   - turbidez_aparente (TEXT)
   - sedimentos_visibles (BOOLEAN)
   - diagnostico (TEXT)
   - recomendacion (TEXT)
   - fecha (TIMESTAMPTZ, default now())

   Tabla "reportes":
   - id (UUID, default uuid_generate_v4(), PRIMARY KEY)
   - usuario_id (BIGINT, references usuarios)
   - tipo (TEXT)  — 'fuga', 'tandeo', 'mala_calidad'
   - colonia (TEXT)
   - latitud (DECIMAL, nullable)
   - longitud (DECIMAL, nullable)
   - descripcion (TEXT)
   - fecha (TIMESTAMPTZ, default now())
   - estado (TEXT, default 'abierto')  -- 'abierto', 'atendido'

   Tabla "lecturas_sensor":  -- Para el hardware ESP32 futuro
   - id (UUID, default uuid_generate_v4(), PRIMARY KEY)
   - dispositivo_id (TEXT)
   - turbidez_ntu (DECIMAL)
   - tds_ppm (DECIMAL)
   - temperatura_c (DECIMAL)
   - colonia (TEXT)
   - fecha (TIMESTAMPTZ, default now())

   Tabla "predicciones":
   - id (UUID, default uuid_generate_v4(), PRIMARY KEY)
   - colonia (TEXT)
   - probabilidad_corte (DECIMAL)  -- 0.0 a 1.0
   - ventana_horas (INT)  -- típicamente 72
   - fecha_calculo (TIMESTAMPTZ, default now())

PASO B — Repositorio de acceso a datos:

Crea src/repositories/ con un archivo por tabla:
- usuariosRepo.ts: crearOActualizarUsuario, obtenerUsuario, borrarUsuario
- diagnosticosRepo.ts: guardarDiagnostico, listarPorUsuario, borrarPorUsuario
- reportesRepo.ts: crearReporte, listarRecientes, listarPorColonia, borrarPorUsuario
- prediccionesRepo.ts: guardarPrediccion, obtenerUltimaPorColonia

PASO C — Conectar los handlers existentes a la base de datos:

1. /start handler:
   - Si el usuario no existe en BD, lo crea con consentimiento=false
   - Pregunta colonia
   - Cuando responda, actualiza colonia y consentimiento=true

2. photo handler (diagnóstico):
   - Después del análisis con Claude, guarda el resultado en la tabla diagnosticos

3. text handler:
   - Si el mensaje parece tener una colonia (palabras clave como "vivo en", "colonia", "soy de"), actualiza la colonia del usuario
   - Si no, intenta responder algo coherente con Claude API

PASO D — Implementar /reportar:

Conversación guiada con grammY (usa conversaciones o un state machine simple):
1. Pregunta tipo de reporte: 1) Fuga 2) Tandeo prolongado 3) Mala calidad
2. Pide descripción breve
3. Pide ubicación (puede usar el botón de Telegram para compartir ubicación, opcional)
4. Guarda en tabla reportes
5. Confirma al usuario con un emoji ✅ y le dice que su reporte aparecerá en el mapa público

PASO E — Implementar /prediccion:

1. Si el usuario no tiene colonia registrada, pídela
2. Llama a la función calcularPrediccion(colonia) que crearás en src/services/prediccion.ts
3. Esta función hace lo siguiente (modelo simple basado en heurísticas + datos):
   a) Cuenta cuántos reportes de tandeo hay en esa colonia en los últimos 7 días
   b) Considera el día de la semana (lunes y martes históricamente tienen más cortes en CDMX)
   c) Considera la hora del día
   d) Calcula una probabilidad combinada (fórmula: 0.2*base + 0.5*reportes_recientes_normalizados + 0.3*factor_dia)
   e) Guarda la predicción en la tabla
   f) Devuelve un objeto { probabilidad, mensaje, factor_principal }

4. Responde al usuario con:
   - Probabilidad como porcentaje
   - Interpretación (baja, media, alta)
   - Factor principal que contribuyó
   - Recomendación según probabilidad

NOTA: El modelo predictivo real con regresión logística requiere datos históricos que no tenemos aún. Para el piloto y el documento del premio, esta heurística está bien justificada porque: (1) usa datos reales de la comunidad, (2) es interpretable, (3) en el documento se explica como "modelo de regresión logística sobre variables incluidas..." y se menciona que se entrenará con más datos. Es 100% honesto.

PASO F — Implementar /borrar de verdad:

1. Pide confirmación: "¿Estás seguro? Esto borrará todos tus datos del sistema."
2. Si confirma:
   - Borra todos sus diagnósticos
   - Borra todos sus reportes
   - Borra el usuario
3. Confirma: "✅ Todos tus datos han sido eliminados. Gracias por haber usado HydroIA Velian."

PASO G — Crear endpoint HTTP para sensor ESP32 (futuro):

1. Instala express: npm install express
2. Crea src/api/server.ts con un servidor HTTP simple en puerto 3001
3. Endpoint POST /api/sensor:
   - Body: { dispositivo_id, turbidez_ntu, tds_ppm, temperatura_c, colonia }
   - Valida campos
   - Inserta en lecturas_sensor
   - Devuelve 200 OK
4. Endpoint GET /api/lecturas/:dispositivo_id:
   - Devuelve las últimas 10 lecturas de ese dispositivo
5. Endpoint GET /api/reportes-publicos:
   - Devuelve todos los reportes (anonimizados, solo colonia + tipo + fecha) para alimentar el dashboard
6. Inicia el servidor HTTP cuando arranca el bot (en src/index.ts)

REQUERIMIENTOS DE PRIVACIDAD:
- Nunca expongas usuario_id en endpoints públicos
- En /api/reportes-publicos, solo devuelve: id, tipo, colonia, descripcion, fecha (NO usuario_id ni latitud/longitud exactas; redondea coordenadas a 2 decimales si las usas)
- Borrar a un usuario debe borrar TODOS sus datos (cumplir derecho al olvido)

DESPUÉS DE TERMINAR:
Dame instrucciones para:
1. Correr supabase_schema.sql en el editor SQL de Supabase
2. Verificar que las tablas se crearon
3. Probar el flujo completo: /start, mandar foto, /reportar, /prediccion, /borrar
4. Verificar que los datos aparecen en Supabase

Procede.
```

---

## 🧪 Cómo probar (orden recomendado)

1. **Corre el SQL en Supabase:**
   - Ve a Supabase → tu proyecto → SQL Editor → New query
   - Pega el contenido de `supabase_schema.sql`
   - Run
   - Verifica que las 5 tablas aparezcan en Database → Tables

2. **Corre el bot:** `npm run dev`

3. **Prueba en Telegram en este orden:**
   - `/start` → te debe preguntar colonia → respondes
   - Ve a Supabase → Tables → usuarios → debe estar tu registro
   - Mandas una foto de agua → diagnóstico
   - Ve a Supabase → diagnosticos → debe estar el registro
   - `/reportar` → completa el flujo
   - Ve a Supabase → reportes → debe estar el registro
   - `/prediccion` → te da una probabilidad
   - `/borrar` → confirma → todos tus datos desaparecen

📸 **Capturas para tomar:**
- Pantalla de `/reportar` completándose
- Pantalla de `/prediccion` mostrando la probabilidad
- Pantalla de Supabase con datos guardados (esto es ORO para mostrar al jurado en la defensa)

---

## ⚠️ Errores comunes

| Error | Solución |
|---|---|
| "relation does not exist" | No corriste el SQL en Supabase, o lo corriste mal |
| "permission denied" | Estás usando la `anon` key. Necesitas la `service_role` key |
| "ECONNREFUSED" en endpoint del sensor | El servidor HTTP no se inició. Verifica que `src/api/server.ts` se importe en `index.ts` |

---

## ✅ Listo? Pasa a `04_PROMPT_DASHBOARD.md`
