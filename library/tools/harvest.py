"""Recolector masivo de la biblioteca.

Dos fuentes, sin dependencias externas:
  1. arXiv: búsquedas temáticas (library/tools/queries.yaml no hace falta: la lista está aquí,
     versionada con el código), ordenadas de más reciente a más antiguo.
  2. OpenAlex: grafo de citas. Todo lo que cita a los papers semilla, de más reciente a más antiguo.

Para cada candidato nuevo crea `papers/<id>/meta.yaml` y, si tiene arXiv, `abstract.en.md`
(los metadatos de arXiv son CC0). La licencia exacta la rellena después `verify.py`.
Deduplica por arXiv y DOI contra lo que ya existe. Nunca sobrescribe una ficha.

Uso:
  python3 -I library/tools/harvest.py arxiv [--max 200]
  python3 -I library/tools/harvest.py openalex [--max 400]
  python3 -I library/tools/harvest.py all
"""

from __future__ import annotations

import json
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "papers"
ATOM = "{http://www.w3.org/2005/Atom}"
ARXIV = "{http://arxiv.org/schemas/atom}"
UA = {"User-Agent": "curvatura-library/0.2 (github.com/pablonolascoo/curvatura)"}

# Búsquedas temáticas. Cada una se asocia a subsistemas por defecto.
ARXIV_QUERIES: list[tuple[str, list[str]]] = [
    ('abs:"warp drive"', ["G", "C"]),
    ('abs:"warp bubble"', ["G", "C"]),
    ('abs:"Alcubierre"', ["G", "C"]),
    ('abs:"warp metric" OR abs:"warp spacetime"', ["G"]),
    ('abs:"Natario" AND abs:warp', ["G"]),
    ('abs:"superluminal" AND abs:"general relativity" AND abs:travel', ["G", "D"]),
    ('abs:"faster-than-light" AND abs:spacetime', ["G", "D"]),
    ('abs:"Krasnikov tube" OR abs:"Krasnikov metric"', ["D"]),
    ('abs:"null energy condition" AND abs:violation', ["C"]),
    ('abs:"weak energy condition" AND abs:violation', ["C"]),
    ('abs:"averaged null energy condition"', ["C", "Q"]),
    ('abs:"quantum inequalities" OR abs:"quantum energy inequality"', ["C", "Q"]),
    ('abs:"negative energy density" AND abs:quantum', ["E", "Q"]),
    ('abs:"exotic matter"', ["E"]),
    ('abs:"traversable wormhole"', ["G", "E"]),
    ('abs:"Casimir energy" AND abs:negative', ["E"]),
    ('abs:"squeezed vacuum" AND abs:"negative energy"', ["E"]),
    ('abs:"Einstein-Maxwell" AND abs:soliton', ["E", "G"]),
    ('abs:"positive energy" AND abs:warp', ["E", "G"]),
    ('abs:"analogue gravity" OR abs:"analog gravity"', ["V"]),
    ('abs:"acoustic metric" OR abs:"acoustic black hole"', ["V"]),
    ('abs:"analogue horizon" AND abs:experiment', ["V"]),
    ('abs:"water tank" AND abs:"Hawking"', ["V"]),
    ('abs:"Bose-Einstein condensate" AND abs:"analogue" AND abs:horizon', ["V"]),
    ('abs:"renormalized stress-energy" AND abs:horizon AND abs:superluminal', ["Q"]),
    ('abs:"numerical relativity" AND abs:"exotic"', ["D", "V"]),
    ('abs:"Warp Factory"', ["V", "C"]),
    ('abs:"gravitational waves" AND abs:warp', ["D", "V"]),
    ('abs:"closed timelike curves" AND abs:"energy conditions"', ["D", "C"]),
    ('abs:"anisotropic fluid" AND abs:"thin shell" AND abs:"general relativity"', ["S", "E"]),
    ('abs:"spacetime engineering" OR abs:"metric engineering"', ["G", "E"]),
    ('abs:"dynamical Casimir"', ["E"]),
    ('abs:"vacuum polarization" AND abs:"warp"', ["Q"]),
    ('abs:"Lentz" AND abs:soliton', ["G", "E"]),
]

# Papers semilla para el grafo de citas (DOI).
SEEDS = {
    "alcubierre-1994": "10.1088/0264-9381/11/5/001",
    "natario-2002": "10.1088/0264-9381/19/6/308",
    "vandenbroeck-1999": "10.1088/0264-9381/16/12/314",
    "pfenning-ford-1997": "10.1088/0264-9381/14/7/011",
    "lobo-visser-2004": "10.1088/0264-9381/21/24/011",
    "lentz-2021": "10.1088/1361-6382/abe692",
    "bobrick-martire-2021": "10.1088/1361-6382/abdf6e",
    "santiago-2022": "10.1103/PhysRevD.105.064038",
    "krasnikov-1998": "10.1103/PhysRevD.57.4760",
    "finazzi-2009": "10.1103/PhysRevD.79.124017",
    "everett-roman-1997": "10.1103/PhysRevD.56.2100",
    "hiscock-1997": "10.1088/0264-9381/14/11/002",
    "mcmonigal-2012": "10.1103/PhysRevD.85.064024",
    "ford-roman-1996": "10.1103/PhysRevD.53.5496",
    "barcelo-2011": "10.12942/lrr-2011-3",
    "fuchs-2024": "10.1088/1361-6382/ad26aa",
    "helmerich-2024": "10.1088/1361-6382/ad2e42",
    "fell-heisenberg-2021": "10.1088/1361-6382/ac0e47",
    "clough-2024": "10.33232/001c.121868",
}

# Semillas sin DOI conocido: se resuelven por arXiv en OpenAlex.
ARXIV_SEEDS: dict[str, str] = {}

# Clasificación por palabras clave (sobre título + resumen, en minúsculas).
SUBSYSTEM_RULES: dict[str, list[str]] = {
    "G": ["metric", "spacetime", "geometry", "shape function", "shift vector", "warp bubble", "warp drive", "soliton"],
    "C": ["energy condition", "nec", "wec", "dec ", "negative energy", "quantum inequalit", "stress-energy", "energy-momentum"],
    "E": ["exotic matter", "casimir", "squeezed", "plasma", "source", "matter content", "fluid", "scalar field"],
    "S": ["shell", "stress", "pressure", "stability", "junction", "thin-shell", "anisotrop"],
    "D": ["acceleration", "accelerat", "horizon", "causal", "dynamic", "time-dependent", "closed timelike", "control"],
    "Q": ["quantum", "semiclassical", "hawking", "renormaliz", "vacuum polarization", "instabilit"],
    "M": ["particle", "geodesic", "blueshift", "radiation", "interstellar", "collision"],
    "P": ["total energy", "energy requirement", "mass", "adm", "solar mass", "jupiter"],
    "V": ["analogue", "analog", "laboratory", "experiment", "numerical", "simulation", "interferomet", "acoustic", "condensate"],
}
KIND_RULES: list[tuple[str, list[str]]] = [
    ("experimental", ["we measure", "experiment", "observed", "measurement", "laboratory"]),
    ("analogo", ["analogue", "analog gravity", "acoustic metric", "condensate"]),
    ("numerico", ["numerical", "simulation", "code", "toolkit", "software"]),
    ("restriccion", ["no-go", "violate", "cannot", "impossib", "unphysical", "constrain", "bound", "instabil", "limitation"]),
    ("fuente", ["casimir", "exotic matter", "plasma", "source", "squeezed", "scalar field"]),
    ("solucion", ["solution", "we construct", "we present", "new metric", "family of"]),
]


def fetch(url: str) -> bytes:
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return r.read()
        except Exception as exc:  # reintento con espera creciente; el último error se propaga
            if attempt == 3:
                raise
            wait = 90 * (attempt + 1) if "429" in str(exc) else 5 * (attempt + 1)
            print(f"   reintento {attempt + 1} en {wait} s: {exc}", file=sys.stderr)
            time.sleep(wait)
    raise RuntimeError("inalcanzable")


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", s.lower()) or "anon"


def q(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def existing() -> tuple[set[str], set[str], set[str]]:
    ids, arx, dois = set(), set(), set()
    for meta in ROOT.glob("*/meta.yaml"):
        t = meta.read_text()
        ids.add(meta.parent.name)
        m = re.search(r'^arxiv:\s*"?([^"\n]+)"?', t, re.M)
        if m and m.group(1) != "null":
            arx.add(m.group(1).strip())
        m = re.search(r"^doi:\s*(\S+)", t, re.M)
        if m and m.group(1) != "null":
            dois.add(m.group(1).lower())
    return ids, arx, dois


def classify(text: str, base: list[str]) -> tuple[list[str], str]:
    t = text.lower()
    subs = set(base)
    for s, words in SUBSYSTEM_RULES.items():
        if sum(w in t for w in words) >= 2:
            subs.add(s)
    kind = next((k for k, words in KIND_RULES if any(w in t for w in words)), "solucion")
    order = "GCESDQMPV"
    return sorted(subs, key=order.index), kind


def new_id(authors: list[str], year: int, ids: set[str]) -> str:
    last = slug(authors[0].split()[-1]) if authors else "anon"
    base = f"{last}-{year}"
    pid, n = base, 1
    while pid in ids:
        n += 1
        pid = f"{base}{chr(96 + n)}" if n <= 26 else f"{base}-{n}"  # b, c… z y después -27, -28…
    ids.add(pid)
    return pid


def write(pid: str, rec: dict) -> None:
    d = ROOT / pid
    d.mkdir(parents=True, exist_ok=True)
    lines = [
        f"id: {pid}",
        f"title: {q(rec['title'])}",
        *(["authors:", *[f"  - {q(a)}" for a in rec["authors"][:40]]] if rec["authors"] else ["authors: []"]),
        f"year: {rec['year']}",
        f"venue: {q(rec['venue'])}",
        f"doi: {rec['doi'] or 'null'}",
        f"arxiv: {q(rec['arxiv']) if rec['arxiv'] else 'null'}",
        f"source: {rec['source']}",
        "language: en",
        f"subsystems: [{', '.join(rec['subsystems'])}]",
        f"kind: {rec['kind']}",
        f"license: {rec['license']}",
        "fulltext: false",
        "translations: []",
        f"verified: {'true' if rec['verified'] else 'false'}",
        f"harvest: {rec['harvest']}",
        f"cited_by: {rec.get('cited_by', 0)}",
    ]
    if rec.get("cites"):
        lines.append(f"cites_seeds: [{', '.join(rec['cites'])}]")
    (d / "meta.yaml").write_text("\n".join(lines) + "\n")
    if rec.get("abstract"):
        (d / "abstract.en.md").write_text(rec["abstract"] + "\n")


# ---------------------------------------------------------------- arXiv

def arxiv_search(query: str, max_results: int) -> list[dict]:
    out, start = [], 0
    while start < max_results:
        params = {"search_query": query, "start": start, "max_results": min(100, max_results - start),
                  "sortBy": "submittedDate", "sortOrder": "descending"}
        xml = fetch("https://export.arxiv.org/api/query?" + urllib.parse.urlencode(params))
        entries = ET.fromstring(xml).findall(f"{ATOM}entry")
        if not entries:
            break
        for e in entries:
            aid = re.sub(r"v\d+$", "", e.findtext(f"{ATOM}id", "").split("/abs/")[-1])
            doi = e.findtext(f"{ARXIV}doi")
            jref = e.findtext(f"{ARXIV}journal_ref")
            out.append({
                "arxiv": aid,
                "doi": doi.lower() if doi else None,
                "title": re.sub(r"\s+", " ", e.findtext(f"{ATOM}title", "")).strip(),
                "abstract": re.sub(r"\s+", " ", e.findtext(f"{ATOM}summary", "")).strip(),
                "authors": [a.findtext(f"{ATOM}name", "").strip() for a in e.findall(f"{ATOM}author")],
                "year": int(e.findtext(f"{ATOM}published", "0000")[:4]),
                "venue": re.sub(r"\s+", " ", jref).strip() if jref else f"arXiv:{aid}",
            })
        start += len(entries)
        time.sleep(8)
    return out


DONE = Path(__file__).resolve().parent / ".harvest-done"


def harvest_arxiv(max_per_query: int) -> int:
    ids, arx, dois = existing()
    added = 0
    done = set(DONE.read_text().splitlines()) if DONE.exists() else set()
    for query, base in ARXIV_QUERIES:
        if query in done:
            continue
        try:
            results = arxiv_search(query, max_per_query)
        except Exception as exc:
            print(f"!  {query}: {exc}")
            continue
        n = 0
        for r in results:
            if r["arxiv"] in arx or (r["doi"] and r["doi"] in dois):
                continue
            subs, kind = classify(r["title"] + " " + r["abstract"], base)
            pid = new_id(r["authors"], r["year"], ids)
            write(pid, {**r, "subsystems": subs, "kind": kind, "license": "unknown",
                        "source": f"https://arxiv.org/abs/{r['arxiv']}", "verified": True, "harvest": "arxiv"})
            arx.add(r["arxiv"])
            if r["doi"]:
                dois.add(r["doi"])
            n += 1
        added += n
        print(f"ok {query:<70} {len(results):>4} vistos, {n:>4} nuevos")
        with DONE.open("a") as fh:
            fh.write(query + "\n")
        time.sleep(10)
    return added


# ---------------------------------------------------------------- OpenAlex

def openalex_id(doi: str) -> str | None:
    try:
        url = f"https://api.openalex.org/works/doi:{doi}?select=id" if not doi.startswith("arxiv:") else \
            "https://api.openalex.org/works?" + urllib.parse.urlencode({"filter": f"locations.landing_page_url:https://arxiv.org/abs/{doi[6:]}", "select": "id"})
        data = json.loads(fetch(url))
        if "results" in data:
            data = data["results"][0]
        return data["id"].rsplit("/", 1)[-1]
    except Exception as exc:
        print(f"!  OpenAlex sin ID para {doi}: {exc}")
        return None


def arxiv_from_locations(w: dict) -> str | None:
    for loc in w.get("locations") or []:
        url = (loc.get("landing_page_url") or "") + " " + (loc.get("pdf_url") or "")
        m = re.search(r"arxiv\.org/(?:abs|pdf)/([0-9]{4}\.[0-9]{4,5}|[a-z\-]+(?:\.[A-Z]{2})?/[0-9]{7})", url)
        if m:
            return m.group(1)
    return None


def harvest_openalex(max_per_seed: int) -> int:
    ids, arx, dois = existing()
    added = 0
    cites_map: dict[str, set[str]] = {}
    pending: dict[str, dict] = {}
    seeds = {**SEEDS, **{k: f"arxiv:{v}" for k, v in ARXIV_SEEDS.items()}}
    for seed, doi in seeds.items():
        wid = openalex_id(doi)
        if not wid:
            continue
        page, seen = 1, 0
        while page and seen < max_per_seed:
            params = {"filter": f"cites:{wid}", "sort": "publication_date:desc", "per-page": 200, "page": page,
                      "select": "id,doi,title,publication_year,authorships,primary_location,locations,open_access,best_oa_location,cited_by_count,type,language"}
            try:
                data = json.loads(fetch("https://api.openalex.org/works?" + urllib.parse.urlencode(params)))
            except Exception as exc:
                print(f"!  {seed}: {exc}")
                break
            results = data.get("results", [])
            for w in results:
                seen += 1
                key = w["id"]
                cites_map.setdefault(key, set()).add(seed)
                pending.setdefault(key, w)
            total = data.get("meta", {}).get("count", 0)
            page = page + 1 if results and seen < total else 0
            time.sleep(0.3)
        print(f"ok cita a {seed:<24} {seen:>5} trabajos")

    for key, w in pending.items():
        doi = (w.get("doi") or "").replace("https://doi.org/", "").lower() or None
        aid = arxiv_from_locations(w)
        if (aid and aid in arx) or (doi and doi in dois) or not w.get("title"):
            continue
        if w.get("language") not in (None, "en", "es", "fr", "de", "it", "pt", "ru"):
            continue
        authors = [a["author"]["display_name"] for a in w.get("authorships") or [] if a.get("author")]
        title = re.sub(r"<[^>]+>", "", w["title"]).strip()
        venue = ((w.get("primary_location") or {}).get("source") or {}).get("display_name") or w.get("type") or "unknown"
        oa = w.get("best_oa_location") or {}
        lic = {"cc-by": "CC-BY-4.0", "cc-by-sa": "CC-BY-SA-4.0", "cc0": "CC0-1.0", "public-domain": "public-domain"}.get(
            (oa.get("license") or "").lower(), "unknown")
        subs, kind = classify(title, ["G"])
        year = w.get("publication_year") or 0
        pid = new_id(authors, year, ids)
        source = f"https://arxiv.org/abs/{aid}" if aid else (f"https://doi.org/{doi}" if doi else w["id"])
        write(pid, {"title": title, "authors": authors, "year": year, "venue": venue, "doi": doi, "arxiv": aid,
                    "subsystems": subs, "kind": kind, "license": lic, "source": source, "verified": False,
                    "harvest": "openalex", "cited_by": w.get("cited_by_count", 0),
                    "cites": sorted(cites_map[key]), "abstract": None})
        if aid:
            arx.add(aid)
        if doi:
            dois.add(doi)
        added += 1
    print(f"OpenAlex: {added} fichas nuevas")
    return added


def main() -> int:
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    mx = int(sys.argv[sys.argv.index("--max") + 1]) if "--max" in sys.argv else None
    total = 0
    if mode in ("arxiv", "all"):
        total += harvest_arxiv(mx or 200)
    if mode in ("openalex", "all"):
        total += harvest_openalex(mx or 1000)
    print(f"\nTotal nuevas: {total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
