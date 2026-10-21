"""Rutas compartidas. Los datos pesados viven fuera de git, en `datos/` (o en CURVATURA_DATOS)."""

from __future__ import annotations

import os
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
LIB = REPO / "library"
PAPERS = LIB / "papers"
EQUATIONS = LIB / "equations"
TOOLS = LIB / "tools"
DATOS = Path(os.environ.get("CURVATURA_DATOS", REPO / "datos")).expanduser()
CORPUS = DATOS / "corpus"          # fuentes y PDF descargados (no se publican)
ANALISIS = DATOS / "analisis"      # un JSON estructurado por paper
FIGURAS = DATOS / "figuras"        # PNG normalizados por paper
PATENTES = DATOS / "patentes"      # una ficha JSON por patente
VECTORES = DATOS / "vectores"      # base LanceDB

UA = {"User-Agent": "curvatura-research/0.3 (+https://github.com/pablonolascoo/curvatura)"}

for _d in (CORPUS, ANALISIS, FIGURAS, PATENTES, VECTORES):
    _d.mkdir(parents=True, exist_ok=True)
