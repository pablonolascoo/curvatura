"""Enriquece la biblioteca con OpenAlex.

  countries   país de cada autor según su institución (authorships[].countries) → `countries: [ES, US]`
              Lotes de 50 por petición (por DOI y por URL de arXiv) para gastar poco presupuesto.
  chinese     papers en chino (y de instituciones chinas) sobre el tema, con búsquedas en chino e inglés.
              Se guardan cita, idioma y título original; el resumen solo si la licencia es abierta.

Uso:
  python3 -I library/tools/enrich.py countries
  python3 -I library/tools/enrich.py chinese
Variable opcional OPENALEX_KEY (clave gratuita de openalex.org) para no compartir el presupuesto diario.
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from harvest import classify, existing, new_id, q  # noqa: E402

ROOT = Path(__file__).resolve().parents[1] / "papers"
UA = {"User-Agent": "curvatura-library/0.3 (github.com/pablonolascoo/curvatura)"}
KEY = os.environ.get("OPENALEX_KEY")


def get_split(base: dict, key: str, values: list[str], sep: str = "|") -> list[dict]:
    """Pide un filtro OR por lotes; si OpenAlex rechaza uno (400), lo parte en dos."""
    if not values:
        return []
    try:
        return get({**base, "filter": key + sep.join(values)}).get("results", [])
    except urllib.error.HTTPError as exc:
        if exc.code != 400 or len(values) == 1:
            print(f"   ! descartado {values[0] if len(values) == 1 else len(values)}: {exc}", file=sys.stderr)
            return []
        h = len(values) // 2
        return get_split(base, key, values[:h]) + get_split(base, key, values[h:])


def get(params: dict) -> dict:
    if KEY:
        params = {**params, "api_key": KEY}
    url = "https://api.openalex.org/works?" + urllib.parse.urlencode(params)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return json.loads(r.read())
        except Exception as exc:
            if attempt == 3 or (isinstance(exc, urllib.error.HTTPError) and exc.code == 400):
                raise
            print(f"   reintento: {exc}", file=sys.stderr, flush=True)
            time.sleep(10 * (attempt + 1))
    return {}


def field(text: str, key: str) -> str | None:
    m = re.search(rf'^{key}:\s*"?([^"\n]*)"?\s*$', text, re.M)
    v = m.group(1).split("  #")[0].strip() if m else None
    return None if v in (None, "null", "") else v


def countries_of(w: dict) -> list[str]:
    c = Counter()
    for a in w.get("authorships") or []:
        for cc in a.get("countries") or []:
            c[cc] += 1
    return [k for k, _ in c.most_common(6)]


def set_countries(meta: Path, ccs: list[str]) -> None:
    t = meta.read_text()
    line = f"countries: [{', '.join(ccs)}]"
    t = re.sub(r"^countries:.*$", line, t, flags=re.M) if re.search(r"^countries:", t, re.M) else t.rstrip("\n") + f"\n{line}\n"
    meta.write_text(t)


def countries() -> int:
    by_doi: dict[str, Path] = {}
    by_arxiv: dict[str, Path] = {}
    for meta in ROOT.glob("*/meta.yaml"):
        t = meta.read_text()
        if re.search(r"^countries:", t, re.M):
            continue
        doi, aid = field(t, "doi"), field(t, "arxiv")
        if doi:
            by_doi[doi.lower()] = meta
        elif aid:
            by_arxiv[aid] = meta
    print(f"{len(by_doi)} por DOI, {len(by_arxiv)} por arXiv", flush=True)
    done = 0
    sel = "id,doi,authorships,locations"

    dois = list(by_doi)
    for i in range(0, len(dois), 50):
        chunk = dois[i : i + 50]
        for w in get_split({"per-page": 50, "select": sel}, "doi:", [c for c in chunk if "|" not in c and "," not in c]):
            d = (w.get("doi") or "").replace("https://doi.org/", "").lower()
            if d in by_doi:
                set_countries(by_doi[d], countries_of(w))
                done += 1
        time.sleep(0.5)
        print(f"   DOI {i + len(chunk)}/{len(dois)} · {done} con país", flush=True)

    aids = list(by_arxiv)
    for i in range(0, len(aids), 40):
        chunk = aids[i : i + 40]
        urls = [f"http://arxiv.org/abs/{a}" for a in chunk] + [f"https://arxiv.org/abs/{a}" for a in chunk]
        for w in get_split({"per-page": 100, "select": sel}, "locations.landing_page_url:", urls):
            for loc in w.get("locations") or []:
                m = re.search(r"arxiv\.org/abs/([^\s?#v]+(?:v\d+)?)", loc.get("landing_page_url") or "")
                if m:
                    a = re.sub(r"v\d+$", "", m.group(1))
                    if a in by_arxiv:
                        set_countries(by_arxiv.pop(a), countries_of(w))
                        done += 1
                        break
        time.sleep(0.5)
        print(f"   arXiv {i + len(chunk)}/{len(aids)} · {done} con país", flush=True)
    print(f"Países escritos: {done}")
    return 0


ZH_QUERIES = ["曲速", "曲速引擎", "曲速泡", "阿尔库别雷", "超光速 时空", "负能量 量子", "奇异物质", "能量条件",
              "可穿越虫洞", "卡西米尔效应", "类比引力", "声学黑洞", "数值相对论 奇异", "时空工程"]
EN_CN_QUERIES = ["warp drive", "warp bubble", "Alcubierre", "traversable wormhole exotic matter",
                 "null energy condition violation", "negative energy density quantum", "analogue gravity acoustic black hole"]


def chinese() -> int:
    ids, arx, dois = existing()
    found: dict[str, dict] = {}
    sel = "id,doi,title,display_name,publication_year,authorships,primary_location,locations,best_oa_location,cited_by_count,language,abstract_inverted_index"
    for qz in ZH_QUERIES:
        data = get({"search": qz, "filter": "language:zh", "per-page": 100, "select": sel})
        for w in data.get("results", []):
            found.setdefault(w["id"], w)
        print(f"ok zh «{qz}»: {len(data.get('results', []))}", flush=True)
        time.sleep(0.5)
    for qe in EN_CN_QUERIES:
        data = get({"search": qe, "filter": "authorships.institutions.country_code:CN,from_publication_date:2015-01-01",
                    "per-page": 100, "sort": "publication_date:desc", "select": sel})
        for w in data.get("results", []):
            found.setdefault(w["id"], w)
        print(f"ok CN «{qe}»: {len(data.get('results', []))}", flush=True)
        time.sleep(0.5)

    added = 0
    for w in found.values():
        doi = (w.get("doi") or "").replace("https://doi.org/", "").lower() or None
        aid = None
        for loc in w.get("locations") or []:
            m = re.search(r"arxiv\.org/abs/([0-9]{4}\.[0-9]{4,5}|[a-z\-]+/[0-9]{7})", loc.get("landing_page_url") or "")
            if m:
                aid = m.group(1)
                break
        if (aid and aid in arx) or (doi and doi in dois) or not w.get("display_name"):
            continue
        authors = [a["author"]["display_name"] for a in w.get("authorships") or [] if a.get("author")]
        title = re.sub(r"<[^>]+>", "", w["display_name"]).strip()
        lang = w.get("language") or "en"
        oa = w.get("best_oa_location") or {}
        lic = {"cc-by": "CC-BY-4.0", "cc-by-sa": "CC-BY-SA-4.0", "cc0": "CC0-1.0"}.get((oa.get("license") or "").lower(), "unknown")
        year = w.get("publication_year") or 0
        pid = new_id(authors, year, ids)
        subs, kind = classify(title, ["G"])
        d = ROOT / pid
        d.mkdir(parents=True, exist_ok=True)
        venue = ((w.get("primary_location") or {}).get("source") or {}).get("display_name") or "unknown"
        source = f"https://arxiv.org/abs/{aid}" if aid else (f"https://doi.org/{doi}" if doi else w["id"])
        lines = [f"id: {pid}", f"title: {q(title)}",
                 *(["authors:", *[f"  - {q(a)}" for a in authors[:40]]] if authors else ["authors: []"]),
                 f"year: {year}", f"venue: {q(venue)}", f"doi: {doi or 'null'}", f"arxiv: {q(aid) if aid else 'null'}",
                 f"source: {source}", f"language: {lang}", f"subsystems: [{', '.join(subs)}]", f"kind: {kind}",
                 f"license: {lic}", "fulltext: false", "translations: []", "verified: false", "harvest: openalex-zh",
                 f"cited_by: {w.get('cited_by_count', 0)}", f"countries: [{', '.join(countries_of(w))}]"]
        (d / "meta.yaml").write_text("\n".join(lines) + "\n")
        inv = w.get("abstract_inverted_index")
        if inv and lic != "unknown":  # resumen solo con licencia abierta
            pos = sorted((p, word) for word, ps in inv.items() for p in ps)
            (d / f"abstract.{lang}.md").write_text(("" if lang == "zh" else " ").join(word for _, word in pos) + "\n")
        if aid:
            arx.add(aid)
        if doi:
            dois.add(doi)
        added += 1
    print(f"Papers chinos nuevos: {added} (de {len(found)} encontrados)")
    return 0


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    sys.exit({"countries": countries, "chinese": chinese}.get(mode, lambda: print(__doc__) or 1)())
