"""Licencias de arXiv en bloque vía OAI-PMH (ListRecords, formato arXivRaw).

Recorre categorías completas (gr-qc por defecto) con resumptionToken, ~1000 registros por
petición, y escribe la licencia en cada ficha de la biblioteca cuyo arXiv aparezca. Mucho más
rápido que consultar registro a registro. Lo que quede sin licencia se completa después con
`verify.py --license-only --write`.

Uso: python3 -I library/tools/licenses_bulk.py [physics:gr-qc quant-ph ...]
"""

from __future__ import annotations

import re
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "papers"
OAI = "https://oaipmh.arxiv.org/oai"
NS = {"o": "http://www.openarchives.org/OAI/2.0/", "r": "http://arxiv.org/OAI/arXivRaw/"}
UA = {"User-Agent": "curvatura-library/0.2 (github.com/pablonolascoo/curvatura)"}
LICENSES = {
    "http://creativecommons.org/licenses/by/4.0/": "CC-BY-4.0",
    "http://creativecommons.org/licenses/by/3.0/": "CC-BY-4.0",
    "http://creativecommons.org/licenses/by-sa/4.0/": "CC-BY-SA-4.0",
    "http://creativecommons.org/publicdomain/zero/1.0/": "CC0-1.0",
    "http://creativecommons.org/licenses/publicdomain/": "public-domain",
    "http://creativecommons.org/licenses/by-nc-sa/4.0/": "CC-BY-NC-SA-4.0",
    "http://creativecommons.org/licenses/by-nc-sa/3.0/": "CC-BY-NC-SA-4.0",
    "http://creativecommons.org/licenses/by-nc-nd/4.0/": "CC-BY-NC-ND-4.0",
    "http://arxiv.org/licenses/nonexclusive-distrib/1.0/": "arxiv-nonexclusive",
    "http://arxiv.org/licenses/assumed-1991-2003/": "arxiv-nonexclusive",
}


def fetch(url: str) -> bytes:
    for attempt in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
                return r.read()
        except Exception as exc:
            wait = 60 * (attempt + 1)
            print(f"   reintento en {wait} s: {exc}", file=sys.stderr, flush=True)
            time.sleep(wait)
    raise RuntimeError(f"OAI inaccesible: {url}")


def pending() -> dict[str, Path]:
    out = {}
    for meta in ROOT.glob("*/meta.yaml"):
        t = meta.read_text()
        a = re.search(r'^arxiv:\s*"([^"]+)"', t, re.M)
        lic = re.search(r"^license:\s*(\S+)", t, re.M)
        if a and (not lic or lic.group(1) == "unknown"):
            out[a.group(1)] = meta
    return out


def main() -> int:
    sets = sys.argv[1:] or ["physics:gr-qc"]
    todo = pending()
    print(f"{len(todo)} fichas sin licencia", flush=True)
    found = 0
    for st in sets:
        params = {"verb": "ListRecords", "metadataPrefix": "arXivRaw", "set": st}
        pages = 0
        while params:
            xml = fetch(OAI + "?" + urllib.parse.urlencode(params))
            root = ET.fromstring(xml)
            for rec in root.iterfind(".//o:record", NS):
                aid = rec.findtext(".//r:id", namespaces=NS)
                if not aid or aid not in todo:
                    continue
                raw = (rec.findtext(".//r:license", namespaces=NS) or "").strip()
                lic = LICENSES.get(raw, raw or "arxiv-nonexclusive")
                meta = todo.pop(aid)
                meta.write_text(re.sub(r"^license:.*$", f"license: {lic}", meta.read_text(), flags=re.M))
                found += 1
            tok = root.find(".//o:resumptionToken", NS)
            pages += 1
            if pages % 10 == 0:
                print(f"   {st}: {pages} páginas, {found} licencias, quedan {len(todo)}", flush=True)
            params = {"verb": "ListRecords", "resumptionToken": tok.text} if tok is not None and tok.text else None
            if not todo:
                break
            time.sleep(5)
        print(f"ok {st}: {pages} páginas", flush=True)
    print(f"Licencias escritas: {found}. Sin resolver: {len(todo)}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
