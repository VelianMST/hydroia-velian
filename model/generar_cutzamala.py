"""
HydroIA Velian - Reconstrucción de la serie semanal del Sistema Cutzamala.

El porcentaje de almacenamiento del Sistema Cutzamala es un dato público de
CONAGUA, reportado semanalmente y ampliamente cubierto por prensa nacional
(la crisis de mediados de 2024 fue portada). Aquí reconstruimos la serie
semanal 2021-2026 por interpolación lineal entre puntos ancla públicamente
documentados (ver anclas_cutzamala.csv, con su columna de fuente).

NO es un dato sintético arbitrario: es la reconstrucción de una serie pública
real a partir de cifras documentadas. La resolución entre anclas se interpola
linealmente porque el almacenamiento de una presa cambia de forma continua.

Salida: cutzamala_historico.csv  (fecha semanal, porcentaje, año, semana_iso)
"""
from __future__ import annotations

import csv
from datetime import date, timedelta
from pathlib import Path

BASE = Path(__file__).parent
ANCLAS = BASE / "anclas_cutzamala.csv"
SALIDA = BASE / "cutzamala_historico.csv"


def leer_anclas() -> list[tuple[date, float]]:
    puntos: list[tuple[date, float]] = []
    with ANCLAS.open(encoding="utf-8") as f:
        for fila in csv.DictReader(f):
            y, m, d = (int(x) for x in fila["fecha"].split("-"))
            puntos.append((date(y, m, d), float(fila["porcentaje"])))
    puntos.sort(key=lambda p: p[0])
    return puntos


def interpolar(puntos: list[tuple[date, float]]) -> list[tuple[date, float]]:
    inicio, fin = puntos[0][0], puntos[-1][0]
    serie: list[tuple[date, float]] = []
    cur = inicio
    while cur <= fin:
        # localizar el segmento [a, b] que contiene a 'cur'
        a = puntos[0]
        b = puntos[-1]
        for i in range(len(puntos) - 1):
            if puntos[i][0] <= cur <= puntos[i + 1][0]:
                a, b = puntos[i], puntos[i + 1]
                break
        span = (b[0] - a[0]).days or 1
        t = (cur - a[0]).days / span
        valor = a[1] + (b[1] - a[1]) * t
        serie.append((cur, round(valor, 2)))
        cur += timedelta(days=7)
    return serie


def main() -> None:
    puntos = leer_anclas()
    serie = interpolar(puntos)
    with SALIDA.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["fecha", "porcentaje", "anio", "semana_iso"])
        for fch, pct in serie:
            iso = fch.isocalendar()
            w.writerow([fch.isoformat(), pct, iso[0], iso[1]])
    print(f"OK: {len(serie)} semanas escritas en {SALIDA.name}")
    print(f"Rango: {serie[0][0]} ({serie[0][1]}%)  ->  {serie[-1][0]} ({serie[-1][1]}%)")
    print(f"Mínimo histórico en la serie: {min(p for _, p in serie)}%")


if __name__ == "__main__":
    main()
