"""Verifica las fichas de la biblioteca contra arXiv.

Para cada paper con identificador arXiv:
  - compara título con la API de arXiv,
  - lee la licencia declarada en arXiv (OAI-PMH, formato arXivRaw),
  - marca `verified: true` si el título coincide y anota la licencia si era desconocida.

Uso:  python3 library/tools/verify.py [--write]
Sin dependencias externas. Respeta el límite de arXiv (1 petición cada 3 s).
"""

from __future__ import annotations

import difflib
import re
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "papers"
ATOM = "{http://www.w3.org/2005/Atom}"
RAW = "{http://arxiv.org/OAI/arXivRaw/}"
LICENSES = {
    "http://creativecommons.org/licenses/by/4.0/": "CC-BY-4.0",
    "http://creativecommons.org/licenses/by-sa/4.0/": "CC-BY-SA-4.0",
    "http://creativecommons.org/publicdomain/zero/1.0/": "CC0-1.0",
    "http://creativecommons.org/licenses/by-nc-sa/4.0/": "CC-BY-NC-SA-4.0",
    "http://creativecommons.org/licenses/by-nc-nd/4.0/": "CC-BY-NC-ND-4.0",
    "http://arxiv.org/licenses/nonexclusive-distrib/1.0/": "arxiv-nonexclusive",
}


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "curvatura-library/0.1 (github.com/pablonolascoo/curvatura)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def field(text: str, key: str) -> str | None:
    m = re.search(rf"^{key}:\s*(.+)$", text, re.M)
    if not m:
        return None
    v = m.group(1).split("  #")[0].strip()
    return None if v == "null" else v.strip('"')


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9 ]", "", re.sub(r"\s+", " ", s.lower())).strip()


def arxiv_title(aid: str) -> str | None:
    xml = fetch("https://export.arxiv.org/api/query?" + urllib.parse.urlencode({"id_list": aid}))
    entry = ET.fromstring(xml).find(f"{ATOM}entry")
    t = entry.find(f"{ATOM}title") if entry is not None else None
    return t.text if t is not None and t.text else None


def arxiv_license(aid: str) -> str | None:
    q = urllib.parse.urlencode({"verb": "GetRecord", "identifier": f"oai:arXiv.org:{aid}", "metadataPrefix": "arXivRaw"})
    xml = fetch("https://export.arxiv.org/oai2?" + q)
    lic = ET.fromstring(xml).find(f".//{RAW}license")
    if lic is None or not lic.text:
        return "arxiv-nonexclusive"  # sin licencia declarada = licencia por defecto de arXiv
    return LICENSES.get(lic.text.strip(), lic.text.strip())


def main() -> int:
    write = "--write" in sys.argv
    license_only = "--license-only" in sys.argv  # para fichas ya leídas de la API de arXiv
    failures = 0
    for meta in sorted(ROOT.glob("*/meta.yaml")):
        text = meta.read_text()
        aid, title = field(text, "arxiv"), field(text, "title") or ""
        if license_only:
            if not aid or field(text, "license") not in (None, "unknown"):
                continue
            try:
                lic = arxiv_license(aid)
            except Exception as exc:
                print(f"!  {meta.parent.name:<24} {exc}")
                failures += 1
                time.sleep(30)
                continue
            print(f"ok {meta.parent.name:<24} licencia {lic}", flush=True)
            if write:
                meta.write_text(re.sub(r"^license:.*$", f"license: {lic}", text, flags=re.M))
            time.sleep(3.5)
            continue
        if not aid:
            print(f"·  {meta.parent.name:<24} sin arXiv: verificar por DOI a mano")
            continue
        try:
            remote = arxiv_title(aid)
            time.sleep(3)
            lic = arxiv_license(aid)
            time.sleep(3)
        except Exception as exc:  # red caída o límite de arXiv: se informa, no se oculta
            print(f"!  {meta.parent.name:<24} error de red: {exc}")
            failures += 1
            continue
        score = difflib.SequenceMatcher(None, norm(title), norm(remote or "")).ratio()
        ok = score >= 0.85
        print(f"{'ok' if ok else 'XX'} {meta.parent.name:<24} título {score:.2f}  licencia arXiv: {lic}")
        if not ok:
            print(f"     ficha : {title}\n     arXiv : {remote}")
            failures += 1
        if write and ok:
            text = re.sub(r"^verified:.*$", "verified: true", text, flags=re.M)
            text = re.sub(r"^license: (unknown|arxiv-nonexclusive)$", f"license: {lic}", text, flags=re.M)
            meta.write_text(text)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
