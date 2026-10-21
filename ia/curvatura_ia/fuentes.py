"""Reúne todo lo público de cada paper sin resumen para poder escribir un resumen propio.

  arXiv          → resumen original (metadatos CC0): se guarda tal cual como abstract.en.md
  OpenAlex       → resumen (índice invertido), temas, palabras clave, conceptos (por DOI o id W…)
  Semantic Scholar → resumen y TLDR (lote de hasta 500 ids por petición)
  Crossref       → resumen JATS depositado por la editorial
  Corpus local   → primeras 2500 palabras del texto completo descargado, si existe

Lo que no es CC0 se guarda solo en datos/fuentes/<id>.json (local) y sirve de base para un resumen
PROPIO (library/papers/<id>/resumen.<lang>.md), escrito con otras palabras y marcado como IA.

Uso:
  curvatura-ia fuentes [ids…]          todos los papers sin resumen (o los indicados)
  curvatura-ia fuentes contexto <id>   texto para quien escribe el resumen propio
  curvatura-ia fuentes paginas         para los que siguen sin texto: metadatos de la página del editor
  curvatura-ia fuentes pendientes      ids con fuentes y sin resumen propio
  curvatura-ia fuentes resumir         escribe los resúmenes propios con el modelo configurado (en paralelo)
"""

from __future__ import annotations

import json
import urllib.error
import re
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor

from .rutas import ANALISIS, DATOS, PAPERS, UA
from .analizar import read_meta

FUENTES = DATOS / "fuentes"
FUENTES.mkdir(parents=True, exist_ok=True)
ATOM = "{http://www.w3.org/2005/Atom}"


def _get(url: str, datos: bytes | None = None, cab: dict | None = None, timeout: int = 60) -> bytes:
    req = urllib.request.Request(url, data=datos, headers={**UA, **(cab or {})})
    for intento in range(4):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as exc:
            if exc.code in (429, 503) and intento < 3:
                time.sleep(int(exc.headers.get("Retry-After") or 20) * (intento + 1))
                continue
            raise
    raise RuntimeError("sin respuesta")


def sin_resumen() -> list[str]:
    return sorted(p.parent.name for p in PAPERS.glob("*/meta.yaml") if not list(p.parent.glob("abstract.*.md")))


def con_resumen_propio(pid: str) -> bool:
    return (PAPERS / pid / "resumen.es.md").exists()


# ---------------------------------------------------------------- arXiv (CC0)


def arxiv(metas: dict[str, dict]) -> int:
    por_id = {m["arxiv"]: pid for pid, m in metas.items() if m.get("arxiv")}
    ids, hechos = list(por_id), 0
    for i in range(0, len(ids), 100):
        lote = ids[i:i + 100]
        xml = _get("https://export.arxiv.org/api/query?" + urllib.parse.urlencode({"id_list": ",".join(lote), "max_results": 100}))
        for e in ET.fromstring(xml).findall(f"{ATOM}entry"):
            aid = re.sub(r"v\d+$", "", (e.findtext(f"{ATOM}id") or "").split("/abs/")[-1])
            s = e.findtext(f"{ATOM}summary")
            pid = por_id.get(aid)
            if pid and s and s.strip():
                lang = metas[pid].get("language") or "en"
                (PAPERS / pid / f"abstract.{lang if lang in ('en', 'es', 'fr', 'zh') else 'en'}.md").write_text(re.sub(r"\s+", " ", s).strip() + "\n")
                hechos += 1
        time.sleep(3.2)
    return hechos


# ---------------------------------------------------------------- OpenAlex, Semantic Scholar, Crossref


def _invertido(inv: dict | None) -> str:
    if not inv:
        return ""
    pos = sorted((p, w) for w, ps in inv.items() for p in ps)
    return " ".join(w for _, w in pos)


def openalex(metas: dict[str, dict]) -> dict[str, dict]:
    out: dict[str, dict] = {}
    sel = "id,doi,title,abstract_inverted_index,keywords,topics,concepts,primary_location,language"
    por_doi = {m["doi"].lower(): pid for pid, m in metas.items() if m.get("doi")}
    por_w = {re.search(r"W\d+", m.get("source") or "").group(0): pid for pid, m in metas.items()
             if not m.get("doi") and re.search(r"openalex\.org/W\d+", m.get("source") or "")}
    def lote(filtro: str):
        try:
            return json.loads(_get("https://api.openalex.org/works?" + urllib.parse.urlencode(
                {"filter": filtro, "per-page": 50, "select": sel}))).get("results", [])
        except Exception:
            return []
    dois = list(por_doi)
    for i in range(0, len(dois), 40):
        for w in lote("doi:" + "|".join(d for d in dois[i:i + 40] if "|" not in d and "," not in d)):
            pid = por_doi.get((w.get("doi") or "").replace("https://doi.org/", "").lower())
            if pid:
                out[pid] = w
        time.sleep(0.3)
    ws = list(por_w)
    for i in range(0, len(ws), 40):
        for w in lote("openalex:" + "|".join(ws[i:i + 40])):
            pid = por_w.get(w["id"].rsplit("/", 1)[-1])
            if pid:
                out[pid] = w
        time.sleep(0.3)
    return out


def semantic_scholar(metas: dict[str, dict]) -> dict[str, dict]:
    claves = {}
    for pid, m in metas.items():
        if m.get("doi"):
            claves[f"DOI:{m['doi']}"] = pid
        elif m.get("arxiv"):
            claves[f"ARXIV:{m['arxiv']}"] = pid
    lista, out = list(claves), {}
    for i in range(0, len(lista), 400):
        lote = lista[i:i + 400]
        try:
            r = json.loads(_get("https://api.semanticscholar.org/graph/v1/paper/batch?fields=title,abstract,tldr,fieldsOfStudy",
                                json.dumps({"ids": lote}).encode(), {"Content-Type": "application/json"}))
        except Exception as exc:
            print(f"   semantic scholar: {exc}", flush=True)
            continue
        for clave, p in zip(lote, r):
            if p:
                out[claves[clave]] = p
        time.sleep(3)
    return out


def crossref(doi: str) -> str:
    try:
        d = json.loads(_get("https://api.crossref.org/works/" + urllib.parse.quote(doi, safe="/"), timeout=30))
        return re.sub(r"<[^>]+>", " ", d["message"].get("abstract") or "").strip()
    except Exception:
        return ""


def texto_local(pid: str, palabras: int = 2500) -> str:
    f = ANALISIS / f"{pid}.json"
    if not f.exists():
        return ""
    a = json.loads(f.read_text())
    t = " ".join(s.get("text") or "" for s in a.get("sections") or [])
    return " ".join(t.split()[:palabras])


# ---------------------------------------------------------------- orquestación


def reunir(ids: list[str]) -> None:
    metas = {pid: read_meta(PAPERS / pid / "meta.yaml") for pid in ids}
    print(f"{len(metas)} papers sin resumen", flush=True)
    n = arxiv({p: m for p, m in metas.items() if m.get("arxiv")})
    print(f"arXiv: {n} resúmenes originales (CC0) guardados", flush=True)
    resto = {p: m for p, m in metas.items() if not list((PAPERS / p).glob("abstract.*.md"))}
    oa = openalex(resto)
    print(f"OpenAlex: {len(oa)} fichas", flush=True)
    s2 = semantic_scholar(resto)
    print(f"Semantic Scholar: {len(s2)} fichas", flush=True)
    sin_abs = [p for p in resto if not _invertido((oa.get(p) or {}).get("abstract_inverted_index")) and not (s2.get(p) or {}).get("abstract")]
    with ThreadPoolExecutor(8) as ex:
        cr = dict(zip(sin_abs, ex.map(lambda p: crossref(resto[p]["doi"]) if resto[p].get("doi") else "", sin_abs)))
    print(f"Crossref: {sum(1 for v in cr.values() if v)} resúmenes", flush=True)
    utiles = 0
    for pid, m in resto.items():
        w, s = oa.get(pid) or {}, s2.get(pid) or {}
        d = {"id": pid, "titulo": m.get("title"), "autores": (m.get("authors") or [])[:10], "anio": m.get("year"),
             "revista": m.get("venue"), "doi": m.get("doi"), "url": m.get("source"),
             "resumen_openalex": _invertido(w.get("abstract_inverted_index")),
             "resumen_s2": s.get("abstract") or "", "tldr_s2": ((s.get("tldr") or {}).get("text")) or "",
             "resumen_crossref": cr.get(pid, ""),
             "palabras_clave": [k.get("display_name") for k in w.get("keywords") or []][:12],
             "temas": [t.get("display_name") for t in w.get("topics") or []][:6],
             "conceptos": [c.get("display_name") for c in w.get("concepts") or [] if c.get("score", 0) > 0.3][:10],
             "campos_s2": s.get("fieldsOfStudy") or [], "texto": texto_local(pid)}
        (FUENTES / f"{pid}.json").write_text(json.dumps(d, ensure_ascii=False))
        utiles += any(d[k] for k in ("resumen_openalex", "resumen_s2", "tldr_s2", "resumen_crossref", "texto"))
    print(f"Fuentes guardadas: {len(resto)} · con algún texto: {utiles}", flush=True)


def _meta_web(html: str) -> str:
    import html as H

    cands = []
    for nombre in ("citation_abstract", "dc.description", "DC.Description", "og:description", "twitter:description", "description"):
        for m in re.finditer(rf'<meta[^>]+(?:name|property)=["\']{re.escape(nombre)}["\'][^>]*>', html, re.I):
            c = re.search(r'content=["\']([^"\']+)', m.group(0))
            if c:
                cands.append(H.unescape(c.group(1)))
    for m in re.finditer(r'"(?:abstract|description)"\s*:\s*"([^"]{120,})"', html):
        cands.append(H.unescape(m.group(1)))
    m = re.search(r'<(?:section|div)[^>]+(?:id|class)=["\'][^"\']*abstract[^"\']*["\'][^>]*>([\s\S]{100,6000}?)</(?:section|div)>', html, re.I)
    if m:
        cands.append(H.unescape(re.sub(r"<[^>]+>", " ", m.group(1))))
    cands = [re.sub(r"\s+", " ", c).strip() for c in cands]
    return max(cands, key=len) if cands else ""


def paginas() -> None:
    """Para los que siguen sin texto: página del editor (DOI u OpenAlex) y sus metadatos de resumen."""
    pend = []
    for f in sorted(FUENTES.glob("*.json")):
        d = json.loads(f.read_text())
        if not any(d.get(k) for k in ("resumen_openalex", "resumen_s2", "tldr_s2", "resumen_crossref", "texto", "resumen_web")):
            pend.append(d)
    print(f"{len(pend)} sin texto: se consultan sus páginas", flush=True)
    sin_doi = [d for d in pend if not d.get("doi") and re.search(r"W\d+", d.get("url") or "")]
    landing = {}
    for i in range(0, len(sin_doi), 40):
        ids = "|".join(re.search(r"W\d+", d["url"]).group(0) for d in sin_doi[i:i + 40])
        try:
            r = json.loads(_get("https://api.openalex.org/works?" + urllib.parse.urlencode({"filter": f"openalex:{ids}", "per-page": 50, "select": "id,primary_location,locations"})))
            for w in r.get("results", []):
                urls = [(l or {}).get("landing_page_url") for l in [w.get("primary_location")] + (w.get("locations") or [])]
                landing[w["id"].rsplit("/", 1)[-1]] = next((u for u in urls if u), None)
        except Exception:
            pass

    def una(d):
        w = re.search(r"W\d+", d.get("url") or "")
        url = f"https://doi.org/{d['doi']}" if d.get("doi") else (landing.get(w.group(0)) if w else None)
        if not url:
            return d["id"], ""
        try:
            req = urllib.request.Request(url, headers={**UA, "Accept": "text/html", "Accept-Language": "en,es;q=0.8,zh;q=0.6"})
            with urllib.request.urlopen(req, timeout=25) as r:
                html = r.read(2_000_000).decode("utf-8", "replace")
            return d["id"], _meta_web(html)
        except Exception:
            return d["id"], ""

    hechos = 0
    with ThreadPoolExecutor(8) as ex:
        for pid, texto in ex.map(una, pend):
            if len(texto) > 80:
                f = FUENTES / f"{pid}.json"
                d = json.loads(f.read_text())
                d["resumen_web"] = texto[:5000]
                f.write_text(json.dumps(d, ensure_ascii=False))
                hechos += 1
    print(f"Páginas con resumen: {hechos} de {len(pend)}", flush=True)


def contexto(pid: str) -> str:
    f = FUENTES / f"{pid}.json"
    if not f.exists():
        return f"(sin fuentes de {pid})"
    d = json.loads(f.read_text())
    partes = [f"ID: {pid}", f"Título: {d['titulo']}", f"Autores: {', '.join(d['autores'])}", f"Año: {d['anio']} · {d['revista']}"]
    for k, nombre in (("resumen_openalex", "Resumen (OpenAlex)"), ("resumen_s2", "Resumen (Semantic Scholar)"),
                      ("tldr_s2", "TLDR"), ("resumen_crossref", "Resumen (Crossref)"), ("resumen_web", "Resumen (página del editor)")):
        if d.get(k):
            partes.append(f"\n{nombre}: {d[k][:3000]}")
    for k in ("palabras_clave", "temas", "conceptos", "campos_s2"):
        if d.get(k):
            partes.append(f"{k}: {', '.join(d[k])}")
    if d.get("texto"):
        partes.append(f"\nTexto completo (inicio):\n{d['texto']}")
    return "\n".join(partes)


PEDIDO = """Escribe NUESTRO resumen propio del paper con estas fuentes públicas, en tres idiomas.
Reglas: con tus palabras (nunca copies frases de los resúmenes originales), solo lo que las fuentes apoyan,
un párrafo de 3 a 6 frases (60-140 palabras) por idioma: qué estudia, cómo, resultados y por qué importa para
motores de curvatura o propulsión exótica si está claro. Si solo hay título y temas, 2-3 frases que empiecen por
«Según su título y temas,» / «Based on its title and topics,» / «D'après son titre et ses thèmes,», sin resultados.
Responde SOLO con JSON: {"es": "...", "en": "...", "fr": "...", "base": "texto|resumen|titulo"}"""


def resumir(ids: list[str] | None = None, hilos: int = 6) -> int:
    """Resúmenes propios con el modelo configurado (ANTHROPIC_API_KEY o CURVATURA_LLM_URL), en paralelo."""
    from .agente import MODELO_SUB, proveedor

    prov = proveedor()
    pend = ids or [f.stem for f in sorted(FUENTES.glob("*.json"))
                   if not con_resumen_propio(f.stem) and not list((PAPERS / f.stem).glob("abstract.*.md"))]

    def uno(pid: str) -> str:
        try:
            bloques, _ = prov.llamar(MODELO_SUB, "Eres un físico que resume papers con precisión y sin copiar.",
                                     [{"role": "user", "content": f"{PEDIDO}\n\n{contexto(pid)}"}], [], max_tokens=1500)
            texto = "".join(b.get("text", "") for b in bloques if b["type"] == "text")
            d = json.loads(texto[texto.index("{"):texto.rindex("}") + 1])
            for lang in ("es", "en", "fr"):
                (PAPERS / pid / f"resumen.{lang}.md").write_text(d[lang].strip() + "\n")
            meta = PAPERS / pid / "meta.yaml"
            t = meta.read_text()
            if "resumen_propio:" not in t:
                meta.write_text(t.rstrip("\n") + f"\nresumen_propio: ia\nresumen_base: {d.get('base', 'resumen')}\n")
            return "ok"
        except Exception as exc:
            return f"error {exc}"[:120]

    ok = 0
    with ThreadPoolExecutor(hilos) as ex:
        for pid, r in zip(pend, ex.map(uno, pend)):
            ok += r == "ok"
            if r != "ok":
                print(f"!  {pid}: {r}", flush=True)
    print(f"Resúmenes propios: {ok} de {len(pend)}")
    return 0


def main() -> int:
    args = sys.argv[1:]
    if args[:1] == ["contexto"]:
        print(contexto(args[1]))
        return 0
    if args[:1] == ["resumir"]:
        return resumir(args[1:] or None)
    if args[:1] == ["paginas"]:
        paginas()
        return 0
    if args[:1] == ["pendientes"]:
        for f in sorted(FUENTES.glob("*.json")):
            if not con_resumen_propio(f.stem) and not list((PAPERS / f.stem).glob("abstract.*.md")):
                print(f.stem)
        return 0
    reunir([a for a in args if not a.startswith("--")] or sin_resumen())
    return 0


if __name__ == "__main__":
    sys.exit(main())
