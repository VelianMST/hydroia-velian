# Datos abiertos — HydroIA Velian

Sustenta la afirmación del documento (Matriz de innovación / Fase 4):
*"Cruce automático de información pública (SACMEX, CONAGUA) con reportes
ciudadanos"*. Documentado con honestidad: qué es automático, qué es curado y
qué hace cuando una fuente no responde.

## Arquitectura

```
Cron diario 05:00 + arranque + script manual
        │
        ▼
 src/services/datosAbiertos.ts  ──►  tabla `datos_abiertos` (Supabase)
        │                                   │
        │                                   ├─►  bot: cutzamala.ts (modelo /prediccion)
        │                                   └─►  dashboard: panel "Datos abiertos"
        ▼
 Cutzamala: SINA/CONAGUA → (si falla) ancla documentada CONAGUA
 SACMEX:    capa curada y citada de programas de tandeo
```

## Cutzamala (% de almacenamiento)

Cascada de la ingesta (`actualizarCutzamala`), **automática pero no frágil**:

1. **Fuente automática**: SINA/CONAGUA (`almacenamientoPrincipalesPresas`),
   se suman las tres presas del sistema (Valle de Bravo, Villa Victoria, El
   Bosque) y se valida el rango (0–100 %).
2. **Si la fuente no responde** (las webs de gobierno suelen bloquear el
   acceso automático): se usa el **ancla documentada** de CONAGUA en
   `model/cutzamala_actual.json`, actualizable a mano con el boletín semanal.

Cada resultado se guarda en `datos_abiertos` con su `fuente` y `confiable`
explícitos. El bot (`cutzamala.ts`) y el dashboard **leen de esa tabla**
(única fuente de verdad), con respaldo a ancla local → histórico → valor por
defecto. Nunca truena, nunca bloquea la predicción.

## SACMEX / CONAGUA / CAEM — programas de tandeo

No existe una API abierta y estable de "cortes anunciados por SACMEX". La
solución honesta es una **capa curada y citada** (`src/data/sacmex_tandeos.ts`)
con programas de tandeo y reducciones de caudal **públicamente documentados**
(reducción del Cutzamala 2023–2024, programa emergente de tandeo de SACMEX en
alcaldías de CDMX 2024, tandeos sistemáticos en municipios del Edomex). Cada
entrada incluye zona, vigencia y **fuente**.

Usos:
- `factorSacmex(municipio)` y `programaSacmexActivo(municipio)` cruzan ese
  historial con la colonia/municipio del usuario.
- `/prediccion` muestra el programa oficial vigente para tu zona (cruce con
  reportes ciudadanos en tiempo real).
- El job registra el estado en `datos_abiertos` (`indicador = sacmex_tandeo`).

## Cómo se ejecuta

- **Automático**: al arrancar el bot + cron diario 05:00 (hora CDMX).
- **Manual** (antes de una demo): `npx tsx scripts/actualizar_datos.ts`

## Privacidad / integridad

- Solo se ingieren **datos públicos agregados** (nivel de presa, comunicados).
  Ningún dato personal.
- El entrenamiento del modelo (AUC-ROC ≈ 0.80) **no se altera**; los datos
  abiertos alimentan el *valor en vivo* del Cutzamala y se *cruzan* (no se
  inyectan de forma oculta) con los reportes ciudadanos.
- Transparencia en el dashboard: se muestra fuente y antigüedad del dato; si
  es un valor de respaldo, se marca como aproximado.

## Pasos en Supabase

Antes de usarlo, corre en el SQL Editor:
`supabase_migracion_datos.sql` (crea la tabla `datos_abiertos` con lectura
pública para el dashboard).
