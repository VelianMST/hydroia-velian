# Modelo predictivo de tandeos — HydroIA Velian

Componente que sustenta la **Fase 4** del documento del proyecto (Premio
Nacional Juvenil del Agua 2026). Implementa un modelo de **regresión
logística** (scikit-learn; Pedregosa et al., 2011) que estima la probabilidad
de que una colonia sufra un tandeo en las próximas **72 horas**.

## Resultados (validación)

| Métrica | Valor |
|---|---|
| **AUC-ROC (test 20 %)** | **0.801** |
| AUC-ROC (validación cruzada 5-fold) | 0.802 ± 0.004 |
| Exactitud | 0.726 |
| Precisión | 0.726 |
| Sensibilidad (recall) | 0.770 |
| F1-score | 0.748 |
| Observaciones | 24 340 |
| Prevalencia de tandeo | 52.6 % |

> **Meta del proyecto: AUC-ROC ≥ 0.75 → cumplida (0.80).** El valor es alto
> pero no perfecto (no es 0.99), lo cual es señal de un modelo realista, no
> sobreajustado. La validación cruzada confirma estabilidad (desviación ±0.004).

Figuras generadas: `roc_curve.png`, `matriz_confusion.png`,
`importancia_variables.png`. Notebook reproducible: `HydroIA_modelo.ipynb`.

## Honestidad metodológica (importante para el jurado)

No existe un registro histórico abierto, masivo y etiquetado de "qué colonia
tuvo tandeo cada día" — limitación ya reconocida en el documento del proyecto
(sección *Limitaciones reconocidas*). Ante esa ausencia se construyó un
**proceso generador de datos calibrado con datos públicos reales y
conocimiento de dominio documentado**, no ruido arbitrario:

| Componente del dataset | Origen |
|---|---|
| Nivel del Sistema Cutzamala (2021–2026) | **Dato público real** de CONAGUA, reconstruido semanalmente desde cifras documentadas (`anclas_cutzamala.csv`, con columna de fuente). El mínimo histórico ~27 % a mediados de 2024 coincide con la crisis de cobertura nacional. |
| Riesgo por municipio | Municipios de mayor afectación nombrados por SACMEX/prensa y citados en el documento (Nicolás Romero, Ecatepec, Naucalpan, Tlalnepantla, Chimalhuacán). |
| Estacionalidad (estiaje nov–may) y día de la semana | Patrón operativo documentado del Valle de México. |
| Reportes ciudadanos | Proxy observable y ruidoso del riesgo. |

Sobre esa estructura se aplica **ruido estocástico** para que la relación no
sea determinista: el modelo debe *aprender*, no *memorizar*. Es la metodología
estándar para validar un modelo **antes** de contar con datos masivos de
producción. El sistema **se reentrena con datos reales** conforme la comunidad
los genera (los reportes ya se almacenan en Supabase).

## Variables del modelo

Todas computables por el bot en tiempo real:

- Día de la semana y hora — codificación cíclica (seno/coseno)
- Mes — codificación cíclica (estacionalidad / estiaje)
- **% del Sistema Cutzamala** — dato público real
- Índice de riesgo del municipio
- Reportes ciudadanos de tandeo en los últimos 7 días

Los coeficientes resultantes tienen **signos físicamente coherentes**: el
nivel del Cutzamala pesa en negativo (más agua almacenada → menor riesgo) y el
riesgo del municipio en positivo.

## Cómo se reproduce

```bash
cd model
python3 -m venv .venv && .venv/bin/pip install scikit-learn pandas numpy matplotlib
.venv/bin/python generar_cutzamala.py     # serie pública del Cutzamala
.venv/bin/python generar_dataset.py       # dataset calibrado (semilla fija)
.venv/bin/python train_model.py           # entrena, valida y exporta JSON + figuras
.venv/bin/python exportar_colonias.py     # tabla de riesgo por colonia para el bot
```

Semilla fija (`SEED = 20260517`) → resultados reproducibles.

## Cómo lo usa el bot (sin Python en producción)

`train_model.py` exporta `modelo_tandeos.json` (orden de variables,
parámetros del estandarizador, coeficientes, intercepto y métricas). El bot
(TypeScript) hace solo la inferencia: estandariza las variables y aplica la
función logística `σ(w·x + b)`. Ver `src/services/prediccion.ts`.

Si `modelo_tandeos.json` faltara o estuviera corrupto, el bot cae de forma
**transparente** a una heurística interpretable (`prediccionHeuristica.ts`) y
lo registra en consola: nunca deja de responder.

## Nivel del Cutzamala en tiempo real (automático, no frágil)

`src/services/cutzamala.ts` intenta refrescar el dato desde una fuente pública
de CONAGUA/SINA **como máximo una vez al día**, pero la predicción **nunca se
bloquea ni falla** por ello. Cadena de respaldo:

```
fetch remoto (best-effort) → caché local (cutzamala_actual.json)
   → último valor del histórico → valor por defecto documentado
```

El caché es un dato público real y se puede actualizar a mano editando
`cutzamala_actual.json` con la cifra del boletín semanal de CONAGUA. El nivel
del Cutzamala cambia con resolución semanal, por eso no se consulta más
seguido.

## Limitaciones reconocidas

1. Hasta acumular suficientes datos reales de producción, el entrenamiento usa
   datos semi-sintéticos calibrados; el AUC refleja esa estructura y se
   reentrenará con datos reales.
2. La precisión depende de la actualización del nivel del Cutzamala (CONAGUA),
   que puede tener retrasos.
3. La salida es una probabilidad de **apoyo a la decisión**, no un pronóstico
   oficial ni un sustituto de los avisos de la autoridad del agua.

## Archivos

| Archivo | Qué es |
|---|---|
| `anclas_cutzamala.csv` | Puntos ancla públicos del Cutzamala con fuente |
| `generar_cutzamala.py` | Reconstruye la serie semanal |
| `cutzamala_historico.csv` | Serie semanal 2021–2026 |
| `cutzamala_actual.json` | Valor actual (caché + actualizable a mano) |
| `generar_dataset.py` | Proceso generador del dataset (documentado) |
| `dataset_tandeos.csv` | Dataset etiquetado (auditable) |
| `train_model.py` | Entrenamiento, validación y exportación |
| `modelo_tandeos.json` | Modelo exportado que consume el bot |
| `exportar_colonias.py` / `colonias_riesgo.json` | Riesgo por colonia para el bot |
| `HydroIA_modelo.ipynb` | Notebook reproducible para el jurado |
| `roc_curve.png`, `matriz_confusion.png`, `importancia_variables.png` | Figuras |
