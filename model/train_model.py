"""
HydroIA Velian - Entrenamiento del modelo predictivo de tandeos.

Modelo: Regresión Logística (scikit-learn; Pedregosa et al., 2011).
Tarea : clasificación binaria - ¿habrá tandeo en la colonia en las próximas
        72 horas? (probabilidad).
Validación: división estratificada 80/20 + validación cruzada estratificada
            k=5. Métrica principal: AUC-ROC (meta del proyecto >= 0.75).

Ingeniería de variables (todas computables por el bot en tiempo real):
  - Día de la semana  -> codificación cíclica (sin, cos)
  - Hora del día      -> codificación cíclica (sin, cos)
  - Mes               -> codificación cíclica (sin, cos)  [estacionalidad]
  - % Sistema Cutzamala (dato público real)
  - Índice de riesgo del municipio (calibrado, documentado)
  - Reportes ciudadanos de tandeo en los últimos 7 días

Exporta modelo_tandeos.json con: orden de features, parámetros del
StandardScaler, coeficientes e intercepto de la regresión logística,
métricas y metadatos. El bot hace la inferencia leyendo ese JSON
(sin Python en producción).
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.preprocessing import StandardScaler

BASE = Path(__file__).parent
DATASET = BASE / "dataset_tandeos.csv"
SEED = 20260517

FEATURES = [
    "dow_sin", "dow_cos",
    "hora_sin", "hora_cos",
    "mes_sin", "mes_cos",
    "cutzamala_pct",
    "riesgo_municipio",
    "reportes_7d",
]


def construir_features(df: pd.DataFrame) -> pd.DataFrame:
    out = pd.DataFrame(index=df.index)
    out["dow_sin"] = np.sin(2 * np.pi * df["dia_semana"] / 7.0)
    out["dow_cos"] = np.cos(2 * np.pi * df["dia_semana"] / 7.0)
    out["hora_sin"] = np.sin(2 * np.pi * df["hora"] / 24.0)
    out["hora_cos"] = np.cos(2 * np.pi * df["hora"] / 24.0)
    out["mes_sin"] = np.sin(2 * np.pi * df["mes"] / 12.0)
    out["mes_cos"] = np.cos(2 * np.pi * df["mes"] / 12.0)
    out["cutzamala_pct"] = df["cutzamala_pct"].astype(float)
    out["riesgo_municipio"] = df["riesgo_municipio"].astype(float)
    out["reportes_7d"] = df["reportes_7d"].astype(float)
    return out[FEATURES]


def main() -> None:
    df = pd.read_csv(DATASET)
    X = construir_features(df)
    y = df["tandeo"].astype(int).to_numpy()

    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.20, random_state=SEED, stratify=y
    )

    scaler = StandardScaler().fit(X_tr)
    X_tr_s = scaler.transform(X_tr)
    X_te_s = scaler.transform(X_te)

    modelo = LogisticRegression(max_iter=1000, C=1.0, random_state=SEED)
    modelo.fit(X_tr_s, y_tr)

    proba_te = modelo.predict_proba(X_te_s)[:, 1]
    pred_te = (proba_te >= 0.5).astype(int)

    auc = roc_auc_score(y_te, proba_te)
    acc = accuracy_score(y_te, pred_te)
    prec = precision_score(y_te, pred_te)
    rec = recall_score(y_te, pred_te)
    f1 = f1_score(y_te, pred_te)
    cm = confusion_matrix(y_te, pred_te)

    # Validación cruzada estratificada k=5 sobre todo el conjunto escalado
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)
    X_all_s = StandardScaler().fit_transform(X)
    cv_auc = cross_val_score(
        LogisticRegression(max_iter=1000, random_state=SEED),
        X_all_s, y, cv=skf, scoring="roc_auc",
    )

    print("=" * 56)
    print("HydroIA Velian - Modelo predictivo de tandeos")
    print("=" * 56)
    print(f"Observaciones: {len(df)}  |  Prevalencia: {y.mean():.1%}")
    print(f"Train/Test: {len(y_tr)}/{len(y_te)} (80/20 estratificado)")
    print("-" * 56)
    print(f"AUC-ROC (test)        : {auc:.4f}   (meta del proyecto >= 0.75)")
    print(f"AUC-ROC (CV 5-fold)   : {cv_auc.mean():.4f} +/- {cv_auc.std():.4f}")
    print(f"Exactitud (accuracy)  : {acc:.4f}")
    print(f"Precisión (precision) : {prec:.4f}")
    print(f"Sensibilidad (recall) : {rec:.4f}")
    print(f"F1-score              : {f1:.4f}")
    print(f"Matriz de confusión   : TN={cm[0,0]} FP={cm[0,1]} "
          f"FN={cm[1,0]} TP={cm[1,1]}")
    print("=" * 56)

    # ---------- Figuras para el documento / jurado ----------
    fpr, tpr, _ = roc_curve(y_te, proba_te)
    plt.figure(figsize=(6, 5))
    plt.plot(fpr, tpr, color="#1F4E79", lw=2, label=f"AUC = {auc:.3f}")
    plt.plot([0, 1], [0, 1], "--", color="#94A3B8", lw=1)
    plt.xlabel("Tasa de falsos positivos")
    plt.ylabel("Tasa de verdaderos positivos")
    plt.title("Curva ROC - Modelo predictivo de tandeos\nHydroIA Velian")
    plt.legend(loc="lower right")
    plt.grid(alpha=0.25)
    plt.tight_layout()
    plt.savefig(BASE / "roc_curve.png", dpi=150)
    plt.close()

    plt.figure(figsize=(4.6, 4))
    plt.imshow(cm, cmap="Blues")
    plt.title("Matriz de confusión")
    plt.colorbar()
    plt.xticks([0, 1], ["Sin tandeo", "Tandeo"])
    plt.yticks([0, 1], ["Sin tandeo", "Tandeo"])
    for i in range(2):
        for j in range(2):
            plt.text(j, i, str(cm[i, j]), ha="center", va="center",
                     color="white" if cm[i, j] > cm.max() / 2 else "black",
                     fontsize=13)
    plt.ylabel("Real")
    plt.xlabel("Predicho")
    plt.tight_layout()
    plt.savefig(BASE / "matriz_confusion.png", dpi=150)
    plt.close()

    coefs = modelo.coef_[0]
    orden = np.argsort(np.abs(coefs))
    plt.figure(figsize=(7, 4.4))
    plt.barh([FEATURES[i] for i in orden], [coefs[i] for i in orden],
             color="#2E75B6")
    plt.title("Importancia de variables (coeficientes estandarizados)")
    plt.xlabel("Peso en el logit")
    plt.grid(alpha=0.25, axis="x")
    plt.tight_layout()
    plt.savefig(BASE / "importancia_variables.png", dpi=150)
    plt.close()

    # ---------- Exportar modelo para el bot (TypeScript) ----------
    modelo_json = {
        "modelo": "regresion_logistica",
        "libreria": "scikit-learn",
        "version_sklearn": __import__("sklearn").__version__,
        "entrenado_utc": datetime.now(timezone.utc).isoformat(),
        "seed": SEED,
        "n_observaciones": int(len(df)),
        "prevalencia": float(y.mean()),
        "features": FEATURES,
        "scaler_mean": scaler.mean_.tolist(),
        "scaler_scale": scaler.scale_.tolist(),
        "coef": coefs.tolist(),
        "intercept": float(modelo.intercept_[0]),
        "metricas": {
            "auc_roc_test": float(auc),
            "auc_roc_cv_mean": float(cv_auc.mean()),
            "auc_roc_cv_std": float(cv_auc.std()),
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1": float(f1),
            "matriz_confusion": cm.tolist(),
        },
        "ventana_horas": 72,
        "nota": (
            "Modelo de regresión logística entrenado con dataset "
            "semi-sintético calibrado con datos públicos reales (serie del "
            "Sistema Cutzamala de CONAGUA) y conocimiento de dominio "
            "documentado (afectación por municipio segun SACMEX/prensa). "
            "Se reentrena con datos de producción conforme se acumulan."
        ),
    }
    with (BASE / "modelo_tandeos.json").open("w", encoding="utf-8") as f:
        json.dump(modelo_json, f, ensure_ascii=False, indent=2)

    print("Exportado: modelo_tandeos.json")
    print("Figuras  : roc_curve.png, matriz_confusion.png, "
          "importancia_variables.png")


if __name__ == "__main__":
    main()
