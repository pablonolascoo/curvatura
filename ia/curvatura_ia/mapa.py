"""Mapa semántico 3D de la biblioteca: cada paper es un punto; cerca significa «trata de lo mismo».

  1. Un vector por paper (multilingual-e5-large, el mismo modelo de la IA) con título, resumen y ficha.
  2. UMAP a 3 dimensiones (conserva la vecindad semántica) y K-means para agrupar por temas.
  3. Nombre de cada grupo con sus palabras más características (TF-IDF de los títulos).
  4. Los 8 papers más parecidos a cada uno (coseno), para «relacionados por IA».

Salida: library/index/mapa.json (pequeño, entra en git; la web lo pinta sin ningún modelo).

Uso: curvatura-ia mapa
"""

from __future__ import annotations

import json
import re
import sys

import numpy as np

from .rutas import LIB, PAPERS
from .analizar import read_meta

SALIDA = LIB / "index" / "mapa.json"
GRUPOS = 14
VECINOS = 8


def texto(pid: str, m: dict) -> str:
    d = PAPERS / pid
    partes = [str(m.get("title") or "")]
    for nombre in ("abstract.en.md", f"abstract.{m.get('language') or 'en'}.md", "resumen.en.md", "abstract.es.md", "resumen.es.md"):
        f = d / nombre
        if f.exists():
            partes.append(f.read_text()[:1800])
            break
    ficha = d / "analisis.yaml"
    if ficha.exists():
        a = re.search(r'^aportacion:\s*"(.*)"', ficha.read_text(), re.M)
        if a:
            partes.append(a.group(1))
    return " ".join(partes)


def etiquetas(titulos: list[str], grupo: np.ndarray, k: int) -> list[str]:
    from sklearn.feature_extraction.text import TfidfVectorizer

    docs = [" ".join(t for t, g in zip(titulos, grupo) if g == i) for i in range(k)]
    tf = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), min_df=1, max_features=20000, token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z-]{2,}\b")
    X = tf.fit_transform(docs)
    voc = np.array(tf.get_feature_names_out())
    out = []
    for i in range(k):
        fila = X[i].toarray().ravel()
        top = [w for w in voc[np.argsort(-fila)][:6] if not any(w in o or o in w for o in [])][:3]
        out.append(", ".join(top))
    return out


def main() -> int:
    from . import vectorizar as V

    metas = {p.parent.name: read_meta(p) for p in sorted(PAPERS.glob("*/meta.yaml"))}
    ids = list(metas)
    textos = [texto(pid, metas[pid]) for pid in ids]
    print(f"{len(ids)} papers: vectores…", flush=True)
    E = V.vec_texto(textos)  # GPU si la hay (por bloques, con latido)
    print("UMAP 3D…", flush=True)
    import umap
    from sklearn.cluster import KMeans

    xyz = umap.UMAP(n_components=3, n_neighbors=20, min_dist=0.08, metric="cosine", random_state=7).fit_transform(E)
    xyz = (xyz - xyz.mean(0)) / (np.abs(xyz - xyz.mean(0)).max() or 1)
    grupo = KMeans(n_clusters=GRUPOS, n_init=10, random_state=7).fit_predict(E)
    S = E @ E.T
    np.fill_diagonal(S, -1)
    vecinos = np.argsort(-S, axis=1)[:, :VECINOS]
    nombres = etiquetas([str(metas[p].get("title") or "") for p in ids], grupo, GRUPOS)
    datos = {
        "modelo": V.MODELO_TEXTO,
        "metodo": "UMAP 3D (coseno) + K-means sobre vectores de título, resumen y ficha",
        "grupos": [{"id": i, "nombre": nombres[i], "n": int((grupo == i).sum())} for i in range(GRUPOS)],
        "puntos": [
            {"id": pid, "x": round(float(x), 4), "y": round(float(y), 4), "z": round(float(z), 4), "g": int(g),
             "v": [ids[j] for j in vecinos[i]], "s": [round(float(S[i, j]), 3) for j in vecinos[i]]}
            for i, (pid, (x, y, z), g) in enumerate(zip(ids, xyz, grupo))
        ],
    }
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, separators=(",", ":")))
    print(f"Mapa: {len(ids)} puntos, {GRUPOS} grupos → {SALIDA} ({SALIDA.stat().st_size // 1024} KB)")
    for g in datos["grupos"]:
        print(f"  {g['id']:>2} ({g['n']}): {g['nombre']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
