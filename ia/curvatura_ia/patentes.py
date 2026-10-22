"""Vigilante de patentes relacionadas con el motor de curvatura y la propulsión sin propelente.

Fuentes (cada una solo dentro de sus condiciones de uso):
  google  → fichas públicas /patent/<número> de Google Patents (permitidas por su robots.txt; su
            buscador /xhr no lo está y no se usa). Se parte de semillas conocidas y de las patentes
            citadas en los papers del corpus, y se sigue el grafo de citas y «documentos similares»,
            quedándose solo con lo relevante. Una petición cada 5 s. Sin clave.
  epo     → EPO Open Patent Services (mundial: EP, WO, US, CN, JP, KR…). Clave gratuita:
            EPO_OPS_KEY y EPO_OPS_SECRET (developers.epo.org). Búsqueda CQL por texto y CPC.
  uspto   → USPTO Open Data Portal. Clave gratuita: USPTO_ODP_API_KEY (data.uspto.gov).
  lens    → Lens.org (si conceden acceso): LENS_API_TOKEN.

Guarda una ficha JSON por patente en datos/patentes/ (local) y un índice bibliográfico público en
library/patentes/indice.yaml (número, título, fecha, CPC, titular, relevancia y enlace).

Uso:
  uv run --project ia python -m curvatura_ia.patentes [--max 300] [--fuentes google,epo,uspto,lens]
  uv run --project ia python -m curvatura_ia.patentes --refrescar   # añade oficina, prioridad y estado a las guardadas
  uv run --project ia python -m curvatura_ia.patentes --indice      # solo rehace library/patentes/indice.yaml
"""

from __future__ import annotations

import base64
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import deque
from pathlib import Path

from .rutas import ANALISIS, DATOS, LIB, PATENTES, UA

INDICE = LIB / "patentes" / "indice.yaml"
VISTOS = PATENTES / "_vistos.json"
DIBUJOS = PATENTES / "dibujos"

SEMILLAS = [
    "US10144532B2",   # Pais: nave con dispositivo de reducción de masa inercial (US Navy)
    "US10135366B2",   # Pais: generador de campo electromagnético
    "US10322827B2",   # Pais: generador de ondas gravitacionales de alta frecuencia
    "US20190348597A1",  # Pais: generador de ondas electromagnéticas de alta energía
    "US5280864A",     # Woodward: alterar transitoriamente la masa (efecto Mach)
    "US6098924A",     # Woodward: fuerzas propulsivas sin expulsar propelente
    "GB2493361A",     # Shawyer: propulsor de microondas (EmDrive)
]
CPC_CLAVE = ("F03H", "B64G1/409", "B64G1/40", "H02N11", "G01V7", "H05H1/54")
TERMINOS = {
    3: ["warp drive", "warp bubble", "alcubierre", "spacetime metric", "space-time metric", "negative energy",
        "exotic matter", "propellantless", "propellant-less", "reactionless", "inertial mass reduction",
        "mach effect", "field propulsion", "gravitational propulsion", "antigravity", "anti-gravity",
        "space drive", "wormhole", "casimir", "曲速", "负能量", "无工质"],
    2: ["gravity modification", "gravitational field generat", "inertia", "gravitational wave", "vacuum energy",
        "zero-point", "zero point energy", "metamaterial", "emdrive", "em drive", "quantum vacuum", "thrust without"],
    1: ["spacecraft propulsion", "electromagnetic propulsion", "plasma thruster", "superconduct", "high frequency"],
}
UMBRAL = 4
_ultimo: dict[str, float] = {}


def pedir(url: str, host: str, pausa: float, datos: bytes | None = None, cab: dict | None = None) -> bytes:
    espera = pausa - (time.monotonic() - _ultimo.get(host, 0))
    if espera > 0:
        time.sleep(espera)
    for intento in range(3):
        try:
            _ultimo[host] = time.monotonic()
            req = urllib.request.Request(url, data=datos, headers={**UA, **(cab or {})})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as exc:
            if exc.code in (429, 503) and intento < 2:
                time.sleep(int(exc.headers.get("Retry-After") or 120))
                continue
            raise
    raise RuntimeError("sin respuesta")


def relevancia(p: dict) -> int:
    texto = " ".join([p.get("titulo", ""), p.get("resumen", ""), p.get("reivindicaciones", "")[:4000]]).lower()
    s = sum(peso for peso, ts in TERMINOS.items() for t in ts if t in texto)
    s += 3 * any(c.replace("/", "").startswith(k.replace("/", "")) for c in p.get("cpc", []) for k in CPC_CLAVE)
    return s


def _limpio(h: str) -> str:
    h = re.sub(r"<(script|style)[\s\S]*?</\1>", " ", h)
    h = re.sub(r"<br\s*/?>|</p>|</div>|</li>", "\n", h)
    return re.sub(r"[ \t]+", " ", html.unescape(re.sub(r"<[^>]+>", " ", h))).strip()


def _seccion(h: str, nombre: str) -> str:
    m = re.search(rf'<section itemprop="{nombre}"[\s\S]*?</section>', h)
    return _limpio(m.group(0)) if m else ""


# ---------------------------------------------------------------- Google Patents (fichas)


def google(numero: str) -> dict:
    h = pedir(f"https://patents.google.com/patent/{numero}/en", "google", 5.0).decode("utf-8", "replace")
    titulo = re.search(r"<title>\s*[^-]*-\s*(.*?)\s*-\s*Google Patents\s*</title>", h)
    fechas = dict((b, a) for a, b in re.findall(r'<meta name="DC\.date" content="([^"]+)" scheme="(\w+)"', h))
    p = {
        "numero": numero, "fuente": "google", "url": f"https://patents.google.com/patent/{numero}/en",
        "titulo": html.unescape(titulo.group(1)) if titulo else numero,
        "fecha": fechas.get("issue") or fechas.get("dateSubmitted") or "",
        "fecha_solicitud": fechas.get("dateSubmitted", ""),
        "inventores": re.findall(r'<meta name="DC\.contributor" content="([^"]+)" scheme="inventor"', h),
        "titular": ", ".join(re.findall(r'<meta name="DC\.contributor" content="([^"]+)" scheme="assignee"', h)),
        "cpc": sorted({c for c in re.findall(r'<span itemprop="Code">([^<]+)', h) if len(c) > 4}),
        "resumen": _seccion(h, "abstract").removeprefix("Abstract").strip(),
        "reivindicaciones": _seccion(h, "claims")[:60000],
        "descripcion": _seccion(h, "description")[:200000],
        "imagenes_url": re.findall(r'itemprop="full" content="(https://patentimages[^"]+)"', h)[:12],
        "cita_a": sorted(set(re.findall(r'<tr itemprop="backwardReferences\w*"[\s\S]*?itemprop="publicationNumber">([^<]+)', h))),
        "citada_por": sorted(set(re.findall(r'<tr itemprop="forwardReferences\w*"[\s\S]*?itemprop="publicationNumber">([^<]+)', h))),
        "similares": re.findall(r'<tr itemprop="similarDocuments"[\s\S]*?itemprop="publicationNumber">([^<]+)', h)[:25],
        "literatura": [_limpio(x)[:300] for x in re.findall(r'<tr itemprop="detailedNonPatentLiterature"[\s\S]*?</tr>', h)][:30],
        # Oficina que la publica, país (o países) de la primera solicitud y estado legal.
        "oficina": (re.search(r'<dd itemprop="countryCode">([A-Z]{2})</dd>', h) or [None, numero[:2]])[1],
        "oficina_nombre": html.unescape((re.search(r'<dd itemprop="countryName">([^<]+)</dd>', h) or [None, ""])[1]),
        "fecha_prioridad": (re.search(r'itemprop="priorityDate"[^>]*>(\d{4}-\d{2}-\d{2})<', h) or [None, ""])[1],
        "paises_prioridad": sorted(set(re.findall(r'<span itemprop="title">Priority to ([A-Z]{2})', h))),
        "estado": html.unescape((re.search(r'<span itemprop="ifiStatus">([^<]+)</span>', h) or [None, ""])[1]).strip(),
        "palabras": re.findall(r'<dd itemprop="priorArtKeywords" repeat>([^<]+)</dd>', h)[:12],
    }
    return p


def descargar_dibujos(p: dict, maximo: int = 6) -> list[str]:
    rutas = []
    for i, u in enumerate(p.get("imagenes_url", [])[:maximo]):
        dst = DIBUJOS / p["numero"] / f"{i + 1:02d}.png"
        if not dst.exists():
            try:
                dst.parent.mkdir(parents=True, exist_ok=True)
                dst.write_bytes(pedir(u, "patentimages", 1.0))
            except Exception:
                continue
        rutas.append(str(dst.relative_to(DATOS)))
    return rutas


def numeros_en_corpus() -> set[str]:
    """Patentes citadas en los papers analizados (US 1,234,567 / US20190348597 / EP1234567 / WO2015/123456 / CN…)."""
    out = set()
    for f in ANALISIS.glob("*.json"):
        t = f.read_text()
        for m in re.finditer(r"\bU\.?S\.? (?:Pat(?:ent)?\.? (?:No\.? )?)?(\d{1,2}),(\d{3}),(\d{3})", t):
            out.add(f"US{m.group(1)}{m.group(2)}{m.group(3)}")
        for m in re.finditer(r"\b(US20\d{9}|US\d{7,8}[AB]\d?|EP\d{7}[AB]?\d?|CN\d{9}[AB]|GB\d{7}A)\b", t):
            out.add(m.group(1))
        for m in re.finditer(r"\bWO\s?(20\d{2})/(\d{6})\b", t):
            out.add(f"WO{m.group(1)}{m.group(2)}")
    return out


# ---------------------------------------------------------------- fuentes con clave


def epo_buscar(maximo: int) -> list[str]:
    k, s = os.environ.get("EPO_OPS_KEY"), os.environ.get("EPO_OPS_SECRET")
    if not (k and s):
        return []
    tok = json.loads(pedir("https://ops.epo.org/3.2/auth/accesstoken", "epo", 6.5, b"grant_type=client_credentials",
                           {"Authorization": "Basic " + base64.b64encode(f"{k}:{s}".encode()).decode(),
                            "Content-Type": "application/x-www-form-urlencoded"}))["access_token"]
    consultas = ['cpc=F03H', 'cpc=B64G1/409', 'ta all "warp drive"', 'ta all "propellantless"', 'ta all "negative energy"',
                 'ta all "inertial mass"', 'ta all "gravitational propulsion"', 'ta all "casimir" and ta any "thrust force propulsion"']
    nums = []
    for q in consultas:
        try:
            r = pedir("https://ops.epo.org/3.2/rest-services/published-data/search?" + urllib.parse.urlencode({"q": q, "Range": "1-100"}),
                      "epo", 6.5, cab={"Authorization": f"Bearer {tok}", "Accept": "application/json"})
            for d in re.findall(r'"@country":\s*"(\w+)",\s*"doc-number":\s*\{\s*"\$":\s*"(\w+)"\s*\},\s*"kind":\s*\{\s*"\$":\s*"(\w+)"', r.decode()):
                nums.append("".join(d))
        except Exception as exc:
            print(f"   epo «{q}»: {exc}", flush=True)
    return nums[:maximo]


def uspto_buscar(maximo: int) -> list[str]:
    key = os.environ.get("USPTO_ODP_API_KEY")
    if not key:
        return []
    nums = []
    for q in ["warp drive", "propellantless propulsion", "inertial mass reduction", "gravitational propulsion", "negative energy density"]:
        try:
            r = json.loads(pedir("https://api.uspto.gov/api/v1/patent/applications/search", "uspto", 2.0,
                                 json.dumps({"q": q, "pagination": {"offset": 0, "limit": 50}}).encode(),
                                 {"X-API-KEY": key, "Content-Type": "application/json"}))
            for d in r.get("patentFileWrapperDataBag", []):
                meta = d.get("applicationMetaData", {})
                n = meta.get("patentNumber") or meta.get("earliestPublicationNumber")
                if n:
                    nums.append(n if n.startswith("US") else f"US{n}")
        except Exception as exc:
            print(f"   uspto «{q}»: {exc}", flush=True)
    return nums[:maximo]


def lens_buscar(maximo: int) -> list[str]:
    tok = os.environ.get("LENS_API_TOKEN")
    if not tok:
        return []
    cuerpo = {"query": {"bool": {"should": [{"match_phrase": {"title": t}} for t in TERMINOS[3]] +
                                 [{"prefix": {"class_cpc.symbol": "F03H"}}]}}, "size": min(maximo, 100),
              "include": ["lens_id", "doc_number", "jurisdiction", "kind"]}
    r = json.loads(pedir("https://api.lens.org/patent/search", "lens", 2.0, json.dumps(cuerpo).encode(),
                         {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}))
    return [f"{d['jurisdiction']}{d['doc_number']}{d.get('kind', '')}" for d in r.get("data", [])]


# ---------------------------------------------------------------- orquestación


def guardar_indice() -> None:
    """Índice público: datos bibliográficos y el resumen oficial de cada patente, de la más reciente a la más antigua."""
    filas = []
    for f in PATENTES.glob("*.json"):
        if f.name.startswith("_"):
            continue
        p = json.loads(f.read_text())
        if p.get("relevancia", 0) < UMBRAL:
            continue
        resumen = re.sub(r"\s+", " ", p.get("resumen", "")).strip()
        fila = {
            "numero": p["numero"],
            "titulo": re.sub(r"\s+", " ", p.get("titulo", "")).strip(),
            "fecha": p.get("fecha", ""),
            "fecha_prioridad": p.get("fecha_prioridad", "") or p.get("fecha_solicitud", ""),
            "inventores": p.get("inventores", []),
            "titular": p.get("titular", ""),
            "oficina": p.get("oficina") or p["numero"][:2],
            # «Priority to PCT/US…» llega como «PC»: es una solicitud internacional (OMPI).
            "paises_prioridad": sorted({"WO" if c == "PC" else c for c in p.get("paises_prioridad", [])}),
            "estado": p.get("estado", ""),
            "cpc": p.get("cpc", [])[:8],
            "palabras": p.get("palabras", [])[:8],
            "cita_a": len(p.get("cita_a", [])),
            "citada_por": len(p.get("citada_por", [])),
            "relevancia": p.get("relevancia", 0),
            "url": p.get("url", ""),
            "resumen": resumen[:1500] + ("…" if len(resumen) > 1500 else ""),
        }
        filas.append(fila)
    filas.sort(key=lambda x: (x["fecha"] or x["fecha_prioridad"], x["numero"]), reverse=True)
    INDICE.parent.mkdir(parents=True, exist_ok=True)
    # JSON en línea por campo: es YAML válido y no necesita dependencias.
    cuerpo = "\n".join("- " + "\n  ".join(f"{k}: {json.dumps(v, ensure_ascii=False)}" for k, v in fila.items()) for fila in filas)
    INDICE.write_text("# Patentes relacionadas (generado por ia/curvatura_ia/patentes.py): datos bibliográficos y resumen\n"
                      "# oficial de cada oficina, de la más reciente a la más antigua. Enlace a la ficha pública.\n" + cuerpo + "\n")


def refrescar(maximo: int) -> int:
    """Vuelve a leer las fichas relevantes guardadas para añadir los campos nuevos (oficina, prioridad, estado)."""
    hechas = 0
    for f in sorted(PATENTES.glob("*.json")):
        if f.name.startswith("_") or hechas >= maximo:
            continue
        viejo = json.loads(f.read_text())
        if viejo.get("relevancia", 0) < UMBRAL or "estado" in viejo:
            continue
        try:
            p = google(viejo["numero"])
        except Exception as exc:
            print(f"   {viejo['numero']}: {exc}", flush=True)
            continue
        p["relevancia"], p["profundidad"], p["dibujos"] = viejo.get("relevancia", 0), viejo.get("profundidad", 0), viejo.get("dibujos", [])
        f.write_text(json.dumps(p, ensure_ascii=False))
        hechas += 1
        if hechas % 20 == 0:
            print(f"   {hechas} fichas actualizadas", flush=True)
    guardar_indice()
    print(f"Refresco: {hechas} fichas actualizadas")
    return 0


def main() -> int:
    args = sys.argv[1:]
    maximo = int(args[args.index("--max") + 1]) if "--max" in args else 300
    if "--refrescar" in args:
        return refrescar(maximo)
    if "--indice" in args:
        guardar_indice()
        return 0
    fuentes = (args[args.index("--fuentes") + 1] if "--fuentes" in args else "google,epo,uspto,lens").split(",")
    vistos: dict = json.loads(VISTOS.read_text()) if VISTOS.exists() else {}

    cola: deque[tuple[str, int]] = deque()
    for n in SEMILLAS + sorted(numeros_en_corpus()):
        cola.append((n, 0))
    for nombre, fn in (("epo", epo_buscar), ("uspto", uspto_buscar), ("lens", lens_buscar)):
        if nombre in fuentes:
            try:
                nuevos = fn(maximo)
                print(f"{nombre}: {len(nuevos)} resultados", flush=True)
                cola.extend((n, 0) for n in nuevos)
            except Exception as exc:
                print(f"{nombre}: {exc}", flush=True)
    # Las relevantes ya vistas vuelven a abrir sus vecinas (para encontrar patentes nuevas que las citan).
    for f in PATENTES.glob("*.json"):
        if not f.name.startswith("_"):
            p = json.loads(f.read_text())
            if p.get("relevancia", 0) >= UMBRAL:
                cola.extend((n, 1) for n in p.get("citada_por", []) + p.get("similares", [])[:10])

    hechas, nuevas = 0, 0
    while cola and hechas < maximo:
        num, prof = cola.popleft()
        num = num.replace(" ", "").replace(",", "")
        if num in vistos or "google" not in fuentes:
            continue
        try:
            p = google(num)
        except urllib.error.HTTPError as exc:
            vistos[num] = f"http {exc.code}"
            continue
        except Exception as exc:
            vistos[num] = f"error {exc}"[:80]
            continue
        hechas += 1
        p["relevancia"] = relevancia(p)
        p["profundidad"] = prof
        vistos[num] = p["relevancia"]
        if p["relevancia"] >= UMBRAL:
            p["dibujos"] = descargar_dibujos(p)
            (PATENTES / f"{num}.json").write_text(json.dumps(p, ensure_ascii=False))
            nuevas += 1
            if prof < 3:
                for v in p["cita_a"] + p["citada_por"] + p["similares"][:12]:
                    if v not in vistos:
                        cola.append((v, prof + 1))
        if hechas % 20 == 0:
            VISTOS.write_text(json.dumps(vistos))
            print(f"   {hechas} fichas · {nuevas} relevantes · cola {len(cola)}", flush=True)
    VISTOS.write_text(json.dumps(vistos))
    guardar_indice()
    print(f"Patentes: {hechas} fichas leídas, {nuevas} relevantes guardadas, {len(cola)} pendientes para la próxima vez")
    return 0


if __name__ == "__main__":
    sys.exit(main())
