"""Extrae contenido de los papers de la biblioteca.

Dos niveles, según licencia:
  - Todos: resumen original desde la API de arXiv (los metadatos de arXiv son CC0).
  - Solo licencias abiertas (CC BY, CC BY-SA, CC0): fuente LaTeX completa, figuras y
    bibliografía, en `papers/<id>/source/`. Es la base para el texto completo y sus traducciones.

Uso:  python3 -I library/tools/extract.py [id ...]
"""

from __future__ import annotations

import io
import re
import sys
import tarfile
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "papers"
ATOM = "{http://www.w3.org/2005/Atom}"
OPEN = {"CC-BY-4.0", "CC-BY-SA-4.0", "CC0-1.0", "public-domain"}
KEEP = {".tex", ".bib", ".bbl", ".png", ".jpg", ".jpeg", ".pdf", ".eps", ".svg"}
UA = {"User-Agent": "curvatura-library/0.1 (github.com/pablonolascoo/curvatura)"}


def fetch(url: str) -> bytes:
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read()


def field(text: str, key: str) -> str | None:
    m = re.search(rf"^{key}:\s*(.+)$", text, re.M)
    v = m.group(1).split("  #")[0].strip() if m else None
    return None if v in (None, "null") else v.strip('"')


def abstract(aid: str) -> str:
    xml = fetch("https://export.arxiv.org/api/query?" + urllib.parse.urlencode({"id_list": aid}))
    s = ET.fromstring(xml).find(f"{ATOM}entry/{ATOM}summary")
    if s is None or not s.text:
        raise RuntimeError(f"arXiv no devolvió resumen para {aid}")
    return re.sub(r"\s+", " ", s.text).strip()


def source(aid: str, dest: Path) -> int:
    """Descarga la fuente y guarda solo texto, figuras y bibliografía, con rutas saneadas."""
    blob = fetch(f"https://arxiv.org/e-print/{aid}")
    dest.mkdir(parents=True, exist_ok=True)
    n = 0
    try:
        tar = tarfile.open(fileobj=io.BytesIO(blob), mode="r:*")
    except tarfile.ReadError:  # algunos envíos son un único .tex comprimido
        import gzip

        (dest / "main.tex").write_bytes(gzip.decompress(blob))
        return 1
    with tar:
        for m in tar.getmembers():
            name = Path(m.name)
            if not m.isfile() or name.is_absolute() or ".." in name.parts or name.suffix.lower() not in KEEP:
                continue
            out = dest / name
            out.parent.mkdir(parents=True, exist_ok=True)
            f = tar.extractfile(m)
            if f is not None:
                out.write_bytes(f.read())
                n += 1
    return n


def main() -> int:
    sources_only = "--sources-only" in sys.argv  # solo fuentes de papers abiertos aún sin descargar
    wanted = {a for a in sys.argv[1:] if not a.startswith("--")}
    errors = 0
    for meta in sorted(ROOT.glob("*/meta.yaml")):
        pid = meta.parent.name
        if wanted and pid not in wanted:
            continue
        text = meta.read_text()
        aid, lic, lang = field(text, "arxiv"), field(text, "license"), field(text, "language") or "en"
        if not aid:
            if not sources_only:
                print(f"·  {pid:<24} sin arXiv")
            continue
        if sources_only and (lic not in OPEN or (meta.parent / "source").exists()):
            continue
        try:
            if sources_only:
                n = source(aid, meta.parent / "source")
                meta.write_text(re.sub(r"^fulltext:.*$", "fulltext: source", text, flags=re.M))
                print(f"ok {pid:<24} fuente ({n} ficheros)", flush=True)
                time.sleep(4)
                continue
            (meta.parent / f"abstract.{lang}.md").write_text(abstract(aid) + "\n")
            time.sleep(3)
            if lic in OPEN:
                n = source(aid, meta.parent / "source")
                meta.write_text(re.sub(r"^fulltext:.*$", "fulltext: source", text, flags=re.M))
                print(f"ok {pid:<24} resumen + fuente ({n} ficheros)")
                time.sleep(3)
            else:
                print(f"ok {pid:<24} resumen (licencia {lic}: sin texto completo)")
        except Exception as exc:
            print(f"!  {pid:<24} {exc}")
            errors += 1
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
