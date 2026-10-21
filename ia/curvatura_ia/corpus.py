"""Descarga el texto completo de cada paper a datos/corpus/<id>/ para analizarlo y vectorizarlo en local.

  arXiv   → fuente LaTeX (e-print) desde export.arxiv.org, que es la vía que arXiv indica para
            descargas programadas. Una petición cada 3 s, en serie, como piden sus condiciones.
            Si el envío es solo PDF, se guarda paper.pdf.
  Otros   → PDF en acceso abierto según OpenAlex (best_oa_location), si existe.

Los papers sin licencia abierta se guardan para investigación privada: datos/ no entra en git y
no se publica. Cada persona que use el sistema descarga su propia copia con este script.

Uso:
  uv run --project ia python -m curvatura_ia.corpus            # todo lo pendiente (reanudable)
  ... --solo-arxiv | --solo-oa | <id> ...
"""

from __future__ import annotations

import gzip
import io
import json
import sys
import tarfile
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from .rutas import CORPUS, PAPERS, UA
from .analizar import read_meta

PAUSA = 3.2
GUARDAR = {".tex", ".bib", ".bbl", ".sty", ".cls", ".png", ".jpg", ".jpeg", ".pdf", ".eps", ".ps", ".svg", ".txt"}
MAX_FICHERO = 40 * 1024 * 1024
_ultimo = 0.0


def pedir(url: str, timeout: int = 90, intentos: int = 4) -> tuple[bytes, str]:
    global _ultimo
    espera = PAUSA - (time.monotonic() - _ultimo)
    if espera > 0:
        time.sleep(espera)
    for intento in range(intentos):
        try:
            _ultimo = time.monotonic()
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
                return r.read(), r.headers.get("Content-Type", "")
        except urllib.error.HTTPError as exc:
            if exc.code in (429, 503) and intento < intentos - 1:
                time.sleep(int(exc.headers.get("Retry-After") or 60))
                continue
            raise
        except (urllib.error.URLError, TimeoutError, OSError):
            if intento >= intentos - 1:
                raise
            time.sleep(20 * (intento + 1))
    raise RuntimeError("sin respuesta")


def guardar_fuente(blob: bytes, dest: Path) -> str:
    """tar.gz, .gz con un solo .tex, o PDF. Rutas saneadas: nada sale de dest."""
    dest.mkdir(parents=True, exist_ok=True)
    if blob[:4] == b"%PDF":
        (dest.parent / "paper.pdf").write_bytes(blob)
        dest.rmdir()
        return "pdf"
    try:
        tar = tarfile.open(fileobj=io.BytesIO(blob), mode="r:*")
    except tarfile.ReadError:
        datos = gzip.decompress(blob) if blob[:2] == b"\x1f\x8b" else blob
        if datos[:4] == b"%PDF":
            (dest.parent / "paper.pdf").write_bytes(datos)
            dest.rmdir()
            return "pdf"
        (dest / "main.tex").write_bytes(datos)
        return "tex"
    n = 0
    with tar:
        for m in tar.getmembers():
            p = Path(m.name)
            if not m.isfile() or p.is_absolute() or ".." in p.parts or p.suffix.lower() not in GUARDAR or m.size > MAX_FICHERO:
                continue
            f = tar.extractfile(m)
            if f is None:
                continue
            out = dest / p
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(f.read())
            n += 1
    return f"tex ({n})"


def arxiv(pid: str, aid: str) -> str:
    d = CORPUS / pid
    blob, _ = pedir(f"https://export.arxiv.org/e-print/{aid}")
    return guardar_fuente(blob, d / "source")


def acceso_abierto(pid: str, doi: str) -> str:
    d = CORPUS / pid
    meta, _ = pedir("https://api.openalex.org/works/doi:" + urllib.parse.quote(doi, safe="/"), timeout=40, intentos=2)
    w = json.loads(meta)
    urls = [(w.get("best_oa_location") or {}).get("pdf_url")] + [l.get("pdf_url") for l in w.get("locations") or []]
    for u in [u for u in urls if u]:
        try:
            blob, tipo = pedir(u, timeout=30, intentos=1)  # editoriales: un intento; si no responde, siguiente
        except Exception:
            continue
        if blob[:4] == b"%PDF":
            d.mkdir(parents=True, exist_ok=True)
            (d / "paper.pdf").write_bytes(blob)
            (d / "origen.txt").write_text(u + "\n")
            return "pdf-oa"
    return "sin-oa"


def pendientes(ids: set[str], modo: str) -> list[tuple[str, dict]]:
    out = []
    for meta in sorted(PAPERS.glob("*/meta.yaml")):
        pid = meta.parent.name
        if ids and pid not in ids:
            continue
        d = CORPUS / pid
        if (d / "source").is_dir() or (d / "paper.pdf").exists() or (d / "sin-texto").exists():
            continue
        m = read_meta(meta)
        if m.get("arxiv") and modo != "oa":
            out.append((pid, m))
        elif not m.get("arxiv") and m.get("doi") and modo != "arxiv":
            out.append((pid, m))
    # Primero lo más relevante.
    orden = {"alta": 0, "media": 1, "baja": 2}
    return sorted(out, key=lambda x: (orden.get(x[1].get("relevance"), 3), not x[1].get("arxiv")))


def main() -> int:
    args = sys.argv[1:]
    modo = "arxiv" if "--solo-arxiv" in args else "oa" if "--solo-oa" in args else "todo"
    ids = {a for a in args if not a.startswith("--")}
    cola = pendientes(ids, modo)
    print(f"{len(cola)} papers pendientes ({modo})", flush=True)
    cuenta: dict[str, int] = {}
    for i, (pid, m) in enumerate(cola, 1):
        try:
            r = arxiv(pid, m["arxiv"]) if m.get("arxiv") else acceso_abierto(pid, m["doi"])
        except Exception as exc:
            r = f"error {exc}"[:120]
        if r == "sin-oa" or r.startswith("error HTTP Error 404"):
            (CORPUS / pid).mkdir(parents=True, exist_ok=True)
            (CORPUS / pid / "sin-texto").write_text("sin PDF en acceso abierto\n")
        clave = r.split()[0]
        cuenta[clave] = cuenta.get(clave, 0) + 1
        if clave == "error" or i % 50 == 0:
            print(f"{i}/{len(cola)} {pid}: {r} · {cuenta}", flush=True)
    print(f"Corpus: {cuenta}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
