"""
Exporta colonias_riesgo.json: tabla de referencia que usa el bot para
resolver, dada la colonia que escribe el usuario, el índice de riesgo del
municipio (una de las variables del modelo). Se deriva de la MISMA fuente
canónica que el dataset (generar_dataset.py) para que no haya inconsistencia.
"""
from __future__ import annotations

import json
import statistics
from pathlib import Path

from generar_dataset import COLONIAS, MUNICIPIOS

BASE = Path(__file__).parent


def main() -> None:
    colonia_a_municipio: dict[str, str] = {}
    for muni, cols in COLONIAS.items():
        for c in cols:
            colonia_a_municipio[c.lower()] = muni

    salida = {
        "riesgo_municipios": MUNICIPIOS,
        "colonia_a_municipio": colonia_a_municipio,
        "riesgo_default": round(statistics.median(MUNICIPIOS.values()), 3),
        "nota": (
            "Si la colonia del usuario no está en el catálogo, el bot intenta "
            "una coincidencia por municipio mencionado en el texto; si tampoco, "
            "usa riesgo_default (mediana) y marca menor confianza."
        ),
    }
    with (BASE / "colonias_riesgo.json").open("w", encoding="utf-8") as f:
        json.dump(salida, f, ensure_ascii=False, indent=2)
    print(f"OK: colonias_riesgo.json con {len(colonia_a_municipio)} colonias, "
          f"{len(MUNICIPIOS)} municipios, default={salida['riesgo_default']}")


if __name__ == "__main__":
    main()
