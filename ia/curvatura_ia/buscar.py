"""Búsqueda sobre toda la base: híbrida (vectores + BM25 con fusión RRF), imágenes y acceso directo.

Todas las respuestas llevan la atribución (`cita`, `url`, `licencia`) para citar sin inventar.
"""

from __future__ import annotations

import json
from functools import lru_cache

from .rutas import ANALISIS, DATOS, FIGURAS, PAPERS, PATENTES
from . import vectorizar as V

CAMPOS = ["paper", "tipo", "seccion", "n", "texto", "latex", "cita", "url", "licencia", "anio", "subsistemas", "relevancia"]


@lru_cache(maxsize=1)
def _tablas():
    con = V.db()
    nombres = set(V.tablas(con))
    return (con.open_table("fragmentos") if "fragmentos" in nombres else None,
            con.open_table("imagenes") if "imagenes" in nombres else None)


def _filtro(tipos=None, paper=None, anio_min=None, anio_max=None, subsistema=None, licencia_abierta=None) -> str | None:
    c = []
    if tipos:
        c.append("tipo IN (" + ", ".join(f"'{t}'" for t in tipos) + ")")
    if paper:
        c.append(f"paper = '{paper}'")
    if anio_min:
        c.append(f"anio >= {int(anio_min)}")
    if anio_max:
        c.append(f"anio <= {int(anio_max)}")
    if subsistema:
        c.append(f"subsistemas LIKE '%{subsistema}%'")
    if licencia_abierta:
        c.append("licencia IN ('CC-BY-4.0', 'CC-BY-SA-4.0', 'CC0-1.0', 'public-domain')")
    return " AND ".join(c) or None


def buscar(q: str, k: int = 10, tipos: list[str] | None = None, paper: str | None = None,
           anio_min: int | None = None, anio_max: int | None = None, subsistema: str | None = None,
           diversificar: bool = True) -> list[dict]:
    """Búsqueda híbrida. `tipos`: resumen, texto, ecuacion, figura, tabla, referencia, patente, doc."""
    frag, _ = _tablas()
    if frag is None:
        return _respaldo(q, k)
    filtro = _filtro(tipos, paper, anio_min, anio_max, subsistema)
    n = max(k * 5, 40)
    vec = V.vec_texto([q], consulta=True)[0]
    s = frag.search(vec, vector_column_name="vector").limit(n)
    densos = (s.where(filtro, prefilter=True) if filtro else s).select(CAMPOS).to_list()
    try:
        s2 = frag.search(q, query_type="fts").limit(n)
        lexicos = (s2.where(filtro, prefilter=True) if filtro else s2).select(CAMPOS).to_list()
    except Exception:
        lexicos = []
    puntos: dict[tuple, float] = {}
    filas: dict[tuple, dict] = {}
    for lista, peso in ((densos, 1.0), (lexicos, 0.8)):
        for i, r in enumerate(lista):
            clave = (r["paper"], r["tipo"], r["n"], r["seccion"])
            puntos[clave] = puntos.get(clave, 0) + peso / (60 + i)
            filas[clave] = r
    orden = sorted(puntos, key=puntos.get, reverse=True)
    out, por_paper = [], {}
    for clave in orden:
        p = clave[0]
        if diversificar and por_paper.get(p, 0) >= 3:
            continue
        por_paper[p] = por_paper.get(p, 0) + 1
        r = {c: filas[clave].get(c) for c in CAMPOS}
        r["puntuacion"] = round(puntos[clave] * 1000, 2)
        out.append(r)
        if len(out) >= k:
            break
    return out


def _respaldo(q: str, k: int) -> list[dict]:
    """Sin base vectorial todavía: índice ligero BM25 de library/rag."""
    import sys

    from .rutas import LIB

    sys.path.insert(0, str(LIB / "rag"))
    from query import search  # type: ignore

    return [{"paper": h.get("doc"), "tipo": h.get("kind"), "texto": h.get("text"), "cita": h.get("title") or h.get("doc"),
             "url": h.get("url"), "seccion": h.get("section"), "aviso": "base vectorial aún no creada: índice ligero"}
            for h in search(q, k)]


def buscar_imagenes(q: str, k: int = 8, paper: str | None = None) -> list[dict]:
    """Figuras y dibujos de patentes que encajan con una descripción (multilingüe)."""
    _, img = _tablas()
    if img is None:
        return []
    s = img.search(V.vec_imagen_desde_texto(q), vector_column_name="vector").limit(k)
    if paper:
        s = s.where(f"paper = '{paper}'", prefilter=True)
    return [{"paper": r["paper"], "figura": r["figura"], "pie": r["pie"], "ruta": str(DATOS / r["ruta"]), "cita": r["cita"],
             "url": r["url"], "licencia": r["licencia"]} for r in s.select(["paper", "figura", "pie", "ruta", "cita", "url", "licencia"]).to_list()]


def analisis(pid: str) -> dict:
    if pid.startswith("patente:"):
        f = PATENTES / f"{pid.split(':', 1)[1]}.json"
        return json.loads(f.read_text()) if f.exists() else {}
    f = ANALISIS / f"{pid}.json"
    return json.loads(f.read_text()) if f.exists() else {}


def paper(pid: str) -> dict:
    """Ficha y mapa del paper: secciones, nº de ecuaciones y figuras, atribución."""
    a = analisis(pid)
    if not a:
        meta = PAPERS / pid / "meta.yaml"
        return {"error": f"{pid} no está analizado"} if not meta.exists() else {"id": pid, "meta": meta.read_text()}
    if pid.startswith("patente:"):
        return {k: v for k, v in a.items() if k not in ("descripcion",)}
    return {"id": a["id"], "cita": V.cita(a), "url": V.url(a), "licencia": a.get("license"), "fuente_texto": a.get("source"),
            "paises": a.get("countries"), "subsistemas": a.get("subsystems"), "resumenes": a.get("abstracts"),
            "secciones": [s["title"] for s in a.get("sections", [])], "ecuaciones": len(a.get("equations", [])),
            "figuras": [{"n": f["n"], "pie": f.get("caption", "")[:200], "imagenes": len(f.get("files", []))} for f in a.get("figures", [])],
            "referencias": len(a.get("references", []))}


def seccion(pid: str, titulo: str) -> dict:
    a = analisis(pid)
    for s in a.get("sections", []):
        if titulo.lower() in (s.get("title") or "").lower():
            return {"paper": pid, "seccion": s["title"], "texto": s["text"], "cita": V.cita(a), "url": V.url(a)}
    return {"error": f"no hay sección «{titulo}» en {pid}", "secciones": [s["title"] for s in a.get("sections", [])]}


def ecuaciones(pid: str, n: int | None = None) -> list[dict]:
    a = analisis(pid)
    eqs = a.get("equations", [])
    sel = [e for e in eqs if n is None or e["n"] == n]
    return [{**e, "cita": V.cita(a), "url": V.url(a)} for e in sel]


def figura(pid: str, n: int) -> dict:
    a = analisis(pid)
    for f in a.get("figures", []):
        if f["n"] == n:
            return {"paper": pid, "n": n, "pie": f.get("caption"), "rutas": [str(FIGURAS / pid / x) for x in f.get("files", [])],
                    "cita": V.cita(a), "url": V.url(a), "licencia": a.get("license")}
    return {"error": f"{pid} no tiene figura {n}"}


def referencias(pid: str, contiene: str | None = None) -> list[dict]:
    a = analisis(pid)
    return [r for r in a.get("references", []) if not contiene or contiene.lower() in r["text"].lower()]


def estado() -> dict:
    frag, img = _tablas()
    return {"perfil": V.PERFIL, "modelo_texto": V.MODELO_TEXTO, "fragmentos": frag.count_rows() if frag else 0,
            "imagenes": img.count_rows() if img else 0, "papers_analizados": len(list(ANALISIS.glob("*.json"))),
            "patentes": len(list(PATENTES.glob("*.json")))}
