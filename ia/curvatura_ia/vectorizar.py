"""Vectoriza todo el conocimiento en una base LanceDB local (datos/vectores).

Tabla `fragmentos` (texto, multilingüe es/en/fr/zh, intfloat/multilingual-e5-large, 1024 d):
  resumen · texto (trozos de sección) · ecuacion (LaTeX + contexto) · figura (pie) · tabla ·
  referencia · patente · doc (docs/, notas, ecuaciones vivas de la biblioteca)
  + índice de texto completo (BM25) para búsqueda híbrida.

Tabla `imagenes` (google/siglip2-base-patch16-224, 768 d, texto↔imagen multilingüe):
  cada figura de cada paper y cada dibujo de patente. Se busca con texto («gráfica de densidad
  de energía negativa») o con otra imagen.

Cada fila lleva su atribución completa (autores, año, título, revista, DOI/arXiv, licencia, URL).
Es incremental: solo se rehace lo que ha cambiado.

Uso:
  uv run --project ia python -m curvatura_ia.vectorizar            # todo lo pendiente
  ... --sin-imagenes | --solo-imagenes | --rehacer | <id> ...
Perfil (CURVATURA_EMBED): «calidad» (multilingual-e5-large) si hay GPU (Apple o NVIDIA, con el extra
`gpu`: `uv sync --project ia --extra gpu`), «ligero» (potion-multilingual-128M, miles por segundo en CPU)
si no. La base de cada perfil es distinta; las consultas usan siempre el mismo modelo que la base.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import time
from pathlib import Path

from .rutas import ANALISIS, DATOS, FIGURAS, LIB, PAPERS as PAPERS_DIR, PATENTES, REPO, VECTORES

MODELOS = {
    "calidad": ("intfloat/multilingual-e5-large", 1024, "query: ", "passage: "),
    "ligero": ("minishlab/potion-multilingual-128M", 256, "", ""),
}
def _gpu() -> str | None:
    try:
        import torch

        return "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else None
    except Exception:
        return None


def _perfil() -> str:
    p = os.environ.get("CURVATURA_EMBED")
    if p in MODELOS:
        return p
    for cand in ("calidad", "ligero"):  # si ya existe una base, se usa esa
        if (VECTORES / f"lancedb-{cand}").exists() and any((VECTORES / f"lancedb-{cand}").iterdir()):
            return cand
    return "calidad" if _gpu() else "ligero"


PERFIL = _perfil()
MODELO_TEXTO, DIM_TEXTO, PREF_Q, PREF_P = MODELOS[PERFIL]
MODELO_IMAGEN, DIM_IMAGEN = "google/siglip2-base-patch16-224", 768
ESTADO = VECTORES / f"estado-{PERFIL}.json"
PALABRAS, SOLAPE = 320, 48

_texto = _img = _imgtxt = _st = None


def modelo_gpu():
    """sentence-transformers en GPU para vectorizar en bloque (mismo modelo que fastembed, 5-50× más rápido)."""
    global _st
    if _st is None:
        dev = _gpu()
        if not dev or PERFIL != "calidad":
            _st = False
        else:
            try:
                from sentence_transformers import SentenceTransformer

                _st = SentenceTransformer(MODELO_TEXTO, device=dev, cache_folder=str(DATOS / "modelos" / "st"))
                _st.half()
            except Exception:
                _st = False
    return _st


def _onnx() -> dict:
    """Acelerador de ONNX Runtime si lo hay (CUDA, DirectML en Windows, OpenVINO en Intel)."""
    from .hardware import proveedores_onnx

    p = proveedores_onnx()
    return {"providers": p + ["CPUExecutionProvider"]} if p else {}


def modelo_texto():
    global _texto
    if _texto is None:
        from fastembed import TextEmbedding

        _texto = TextEmbedding(MODELO_TEXTO, cache_dir=str(DATOS / "modelos"), **_onnx())
    return _texto


def modelo_imagen():
    global _img
    if _img is None:
        from fastembed import ImageEmbedding

        _img = ImageEmbedding(MODELO_IMAGEN, cache_dir=str(DATOS / "modelos"), **_onnx())
    return _img


def modelo_imagen_texto():
    global _imgtxt
    if _imgtxt is None:
        from fastembed import TextEmbedding

        _imgtxt = TextEmbedding(MODELO_IMAGEN, cache_dir=str(DATOS / "modelos"))
    return _imgtxt


def vec_texto(textos: list[str], consulta: bool = False):
    import numpy as np

    pref = PREF_Q if consulta else PREF_P
    if not consulta and len(textos) > 8 and modelo_gpu():
        return np.asarray(modelo_gpu().encode([pref + t for t in textos], batch_size=32, normalize_embeddings=True), dtype="float32")
    # Sin GPU ni acelerador: todos los núcleos con un proceso por núcleo (parallel=0) en los lotes grandes.
    from .hardware import proveedores_onnx

    par = 0 if len(textos) >= 256 and not proveedores_onnx() else None
    E = np.array(list(modelo_texto().embed([pref + t for t in textos], batch_size=32, parallel=par)), dtype="float32")
    return E / np.maximum(np.linalg.norm(E, axis=1, keepdims=True), 1e-9)


def vec_imagen_desde_texto(q: str):
    import numpy as np

    v = np.array(next(iter(modelo_imagen_texto().embed([q]))), dtype="float32")
    return v / (np.linalg.norm(v) or 1)


def tablas(con) -> list[str]:
    r = con.list_tables()
    return list(getattr(r, "tables", r))


def db():
    import lancedb

    return lancedb.connect(str(VECTORES / f"lancedb-{PERFIL}"))


# ---------------------------------------------------------------- atribución


def cita(a: dict) -> str:
    autores = a.get("authors") or []
    quien = ", ".join(autores[:3]) + (" et al." if len(autores) > 3 else "") if autores else "Anónimo"
    partes = [f"{quien} ({a.get('year') or 's. f.'}). {a.get('title') or a.get('id')}."]
    if a.get("venue") and a["venue"] != "unknown":
        partes.append(f"{a['venue']}.")
    if a.get("doi"):
        partes.append(f"doi:{a['doi']}")
    if a.get("arxiv"):
        partes.append(f"arXiv:{a['arxiv']}")
    return " ".join(partes)


def url(a: dict) -> str:
    if a.get("arxiv"):
        return f"https://arxiv.org/abs/{a['arxiv']}"
    if a.get("doi"):
        return f"https://doi.org/{a['doi']}"
    return a.get("source_url") or ""


# ---------------------------------------------------------------- troceado


def trozos(texto: str) -> list[str]:
    p = texto.split()
    if len(p) <= PALABRAS:
        return [texto] if texto.strip() else []
    return [" ".join(p[i:i + PALABRAS]) for i in range(0, len(p), PALABRAS - SOLAPE)]


def filas_paper(a: dict) -> tuple[list[dict], list[dict]]:
    base = {"paper": a["id"], "cita": cita(a), "url": url(a), "licencia": a.get("license") or "unknown",
            "anio": int(a.get("year") or 0), "subsistemas": " ".join(a.get("subsystems") or []),
            "relevancia": a.get("relevance") or "", "fuente": a.get("source") or ""}
    titulo = a.get("title") or ""
    out: list[dict] = []
    for idioma, r in (a.get("abstracts") or {}).items():
        out.append({**base, "tipo": "resumen", "seccion": "Resumen", "idioma": idioma, "n": 0, "latex": "",
                    "texto": f"{titulo}. {r}"})
    if a.get("abstract") and not a.get("abstracts"):
        out.append({**base, "tipo": "resumen", "seccion": "Resumen", "idioma": a.get("language", "en"), "n": 0,
                    "latex": "", "texto": f"{titulo}. {a['abstract']}"})
    if not a.get("abstracts"):  # resumen propio (IA) cuando no hay resumen publicable
        for f in sorted((PAPERS_DIR / a["id"]).glob("resumen.*.md")):
            out.append({**base, "tipo": "resumen", "seccion": "Resumen propio (IA)", "idioma": f.stem.split(".")[1], "n": 0,
                        "latex": "", "texto": f"{titulo}. {f.read_text().strip()}"})
    ficha = PAPERS_DIR / a["id"] / "analisis.yaml"
    if ficha.exists():  # ficha de análisis escrita por IA (aportación, supuestos, resultados, limitaciones…)
        out.append({**base, "tipo": "ficha", "seccion": "Análisis", "idioma": "es", "n": 0, "latex": "",
                    "texto": f"Análisis de «{titulo}» (generado por IA).\n{ficha.read_text()[:6000]}"})
    for s in a.get("sections") or []:
        for i, t in enumerate(trozos(s.get("text") or "")):
            out.append({**base, "tipo": "texto", "seccion": s.get("title") or "", "idioma": a.get("language", "en"),
                        "n": i, "latex": "", "texto": f"{titulo} · {s.get('title') or ''}\n{t}"})
    for e in a.get("equations") or []:
        out.append({**base, "tipo": "ecuacion", "seccion": e.get("section") or "", "idioma": "latex", "n": e["n"],
                    "latex": e["latex"], "texto": f"Ecuación {e['n']} de «{titulo}». {e.get('before', '')[-300:]} "
                                                f"$$ {e['latex'][:1500]} $$ {e.get('after', '')[:200]}"})
    for f in a.get("figures") or []:
        out.append({**base, "tipo": "figura", "seccion": "", "idioma": a.get("language", "en"), "n": f["n"],
                    "latex": "", "texto": f"Figura {f['n']} de «{titulo}». {f.get('caption', '')}"})
    for tb in a.get("tables") or []:
        out.append({**base, "tipo": "tabla", "seccion": "", "idioma": "latex", "n": tb["n"], "latex": tb["latex"][:3000],
                    "texto": f"Tabla {tb['n']} de «{titulo}». {tb.get('caption', '')}\n{tb['latex'][:1500]}"})
    refs = a.get("references") or []
    for i in range(0, len(refs), 25):
        bloque = "\n".join(r["text"] for r in refs[i:i + 25])
        out.append({**base, "tipo": "referencia", "seccion": "Referencias", "idioma": "en", "n": i // 25,
                    "latex": "", "texto": f"Referencias de «{titulo}»:\n{bloque}"})
    imgs = []
    for f in a.get("figures") or []:
        for nombre in f.get("files") or []:
            ruta = FIGURAS / a["id"] / nombre
            if ruta.exists():
                imgs.append({**base, "figura": f["n"], "pie": f.get("caption", ""), "ruta": str(ruta.relative_to(DATOS))})
    return out, imgs


def filas_patente(p: dict) -> tuple[list[dict], list[dict]]:
    base = {"paper": "patente:" + p["numero"], "cita": f"{', '.join(p.get('inventores') or [])[:120]} ({p.get('fecha', '')[:4]}). "
            f"{p.get('titulo', '')}. Patente {p['numero']} ({p.get('titular', '')}).", "url": p.get("url", ""),
            "licencia": "patente", "anio": int((p.get("fecha") or "0")[:4] or 0), "subsistemas": " ".join(p.get("cpc", [])[:6]),
            "relevancia": p.get("relevancia", ""), "fuente": p.get("fuente", "")}
    out = [{**base, "tipo": "patente", "seccion": "Resumen", "idioma": "en", "n": 0, "latex": "",
            "texto": f"{p.get('titulo', '')}. {p.get('resumen', '')}"}]
    for i, t in enumerate(trozos(p.get("reivindicaciones", ""))):
        out.append({**base, "tipo": "patente", "seccion": "Reivindicaciones", "idioma": "en", "n": i + 1, "latex": "", "texto": t})
    for i, t in enumerate(trozos(p.get("descripcion", ""))[:40]):
        out.append({**base, "tipo": "patente", "seccion": "Descripción", "idioma": "en", "n": 100 + i, "latex": "", "texto": t})
    imgs = [{**base, "figura": i + 1, "pie": f"Dibujo {i + 1} de la patente {p['numero']}", "ruta": r}
            for i, r in enumerate(p.get("dibujos", [])) if (DATOS / r).exists()]
    return out, imgs


def filas_docs() -> list[dict]:
    """Docs, notas y ecuaciones vivas, desde el índice ligero (library/index/chunks.jsonl)."""
    f = LIB / "index" / "chunks.jsonl"
    out = []
    if not f.exists():
        return out
    for linea in f.read_text().splitlines():
        c = json.loads(linea)
        if c.get("kind") == "paper":
            continue
        doc = c.get("doc", "")
        ruta = doc.split(":", 1)[-1]
        enlace = f"https://github.com/pablonolascoo/curvatura/blob/main/{ruta}" if doc.startswith("doc:") else ""
        out.append({"paper": doc, "cita": f"Curvatura · {ruta} · {c.get('section') or ''}", "url": enlace,
                    "licencia": "PolyForm-NC / CC BY-NC-SA", "anio": 2026, "subsistemas": " ".join(c.get("subsystems") or []),
                    "relevancia": "", "fuente": c.get("kind", "doc"), "tipo": "doc", "seccion": c.get("section") or "",
                    "idioma": c.get("lang") or "es", "n": 0, "latex": "", "texto": c.get("text", "")})
    return out


# ---------------------------------------------------------------- escritura


def _huella(p: Path) -> str:
    h = hashlib.sha1(p.read_bytes())
    # Si cambian la ficha, los resúmenes o el resumen propio, se vuelve a vectorizar el paper.
    for extra in sorted((PAPERS_DIR / p.stem).glob("analisis.yaml")) + sorted((PAPERS_DIR / p.stem).glob("abstract.*.md")) \
            + sorted((PAPERS_DIR / p.stem).glob("resumen.*.md")):
        h.update(extra.read_bytes())
    return h.hexdigest()[:16]


def _escribir(tabla: str, filas: list[dict], claves: set[str], vectores, conexion) -> None:
    import pyarrow as pa

    if not filas and not claves:
        return
    for f, v in zip(filas, vectores):
        f["vector"] = v.tolist()
    if tabla in tablas(conexion):
        t = conexion.open_table(tabla)
        if claves:
            lista = ", ".join("'" + k.replace("'", "''") + "'" for k in claves)
            t.delete(f"paper IN ({lista})")
        if filas:
            t.add(filas)
    elif filas:
        conexion.create_table(tabla, data=filas)


def vigilado(args: list[str], sin_avance: int = 1200) -> int:
    """Ejecuta la vectorización en un subproceso y lo reinicia si se queda colgado (p. ej. la GPU de Apple).
    El avance se guarda tras cada lote, así que reiniciar solo repite el lote en curso."""
    import subprocess

    intentos = 0
    while True:
        p = subprocess.Popen([sys.executable, "-u", "-m", "curvatura_ia.vectorizar", *args])
        ultimo = ESTADO.stat().st_mtime if ESTADO.exists() else time.time()
        visto = time.time()
        while p.poll() is None:
            time.sleep(30)
            m = ESTADO.stat().st_mtime if ESTADO.exists() else 0
            if m != ultimo:
                ultimo, visto = m, time.time()
            elif time.time() - visto > sin_avance:
                print(f"   sin avance en {sin_avance // 60} min: se reinicia", flush=True)
                p.kill()
                p.wait()
                break
        if p.returncode == 0:
            return 0
        intentos += 1
        if intentos > 20:
            return 1


def main() -> int:
    import numpy as np

    args = sys.argv[1:]
    if "--vigilado" in args:
        return vigilado([a for a in args if a != "--vigilado"])
    rehacer = "--rehacer" in args
    con_img = "--sin-imagenes" not in args
    solo_img = "--solo-imagenes" in args
    ids = {a for a in args if not a.startswith("--")}
    estado = {} if rehacer or not ESTADO.exists() else json.loads(ESTADO.read_text())
    con = db()

    fuentes = [(p.stem, p, "paper") for p in sorted(ANALISIS.glob("*.json"))] + \
              [("patente:" + p.stem, p, "patente") for p in sorted(PATENTES.glob("*.json"))]
    pend = [(k, p, tipo) for k, p, tipo in fuentes if (not ids or k in ids) and estado.get(k) != _huella(p)]

    def prioridad(x):  # lo más relevante primero: la base es útil antes de terminar
        try:
            r = json.loads(x[1].read_text()).get("relevance" if x[2] == "paper" else "relevancia")
        except Exception:
            r = None
        return {"alta": 0, "media": 1}.get(r, 2) if x[2] == "paper" else 1
    pend.sort(key=prioridad)
    print(f"{len(pend)} fuentes por vectorizar · modelo {MODELO_TEXTO}", flush=True)

    if not ids and (rehacer or "docs" not in estado) and not solo_img:
        filas = filas_docs()
        _escribir("fragmentos", filas, {f["paper"] for f in filas}, vec_texto([f["texto"] for f in filas]), con)
        estado["docs"] = time.strftime("%Y-%m-%d")

    t0, hechos, n_frag, n_img = time.time(), 0, 0, 0
    LOTE = 40
    for i in range(0, len(pend), LOTE):
        lote = pend[i:i + LOTE]
        filas, imgs, claves = [], [], set()
        for k, p, tipo in lote:
            a = json.loads(p.read_text())
            fs, ims = filas_paper(a) if tipo == "paper" else filas_patente(a)
            filas += fs
            imgs += ims
            claves.add(k)
        if not solo_img:
            _escribir("fragmentos", filas, claves, vec_texto([f["texto"][:2400] for f in filas]) if filas else [], con)
            n_frag += len(filas)
        if con_img:
            ok = [im for im in imgs if (DATOS / im["ruta"]).exists()]
            vec = np.array(list(modelo_imagen().embed([str(DATOS / im["ruta"]) for im in ok], batch_size=16)), dtype="float32") if ok else []
            if len(vec):
                vec = vec / np.maximum(np.linalg.norm(vec, axis=1, keepdims=True), 1e-9)
            _escribir("imagenes", ok, claves, vec, con)
            n_img += len(ok)
        for k, p, _ in lote:
            estado[k] = _huella(p)
        hechos += len(lote)
        ESTADO.write_text(json.dumps(estado))
        dt = time.time() - t0
        print(f"   {hechos}/{len(pend)} · {n_frag} fragmentos · {n_img} imágenes · {dt / 60:.1f} min", flush=True)

    if "fragmentos" in tablas(con):
        t = con.open_table("fragmentos")
        try:
            t.create_fts_index("texto", replace=True)
        except Exception as exc:
            print(f"   índice de texto: {exc}", flush=True)
        if t.count_rows() > 50_000:
            try:
                t.create_index(metric="cosine", vector_column_name="vector", replace=True)
            except Exception as exc:
                print(f"   índice vectorial: {exc}", flush=True)
        print(f"Total: {t.count_rows()} fragmentos", flush=True)
    if "imagenes" in tablas(con):
        print(f"Total: {con.open_table('imagenes').count_rows()} imágenes", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
