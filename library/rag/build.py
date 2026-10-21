"""Construye el índice RAG de la biblioteca: library/index/chunks.jsonl.

Cada fragmento lleva cita completa (paper, sección, idioma, licencia, URL de origen) para que
cualquier respuesta generada pueda citar exactamente de dónde sale.

Fuentes: fichas y resúmenes (todos los idiomas), textos completos con licencia abierta,
ecuaciones, documentación del proyecto (ROADMAP, docs/) y notas de la web.

Uso: python3 -I library/rag/build.py
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import INDEX, LIB, REPO, read_meta  # noqa: E402

MAX = 1400   # caracteres por fragmento
OVER = 200   # solape entre fragmentos consecutivos


def split(text: str) -> list[tuple[str, str]]:
    """Divide Markdown por encabezados y después por tamaño. Devuelve (sección, texto)."""
    out: list[tuple[str, str]] = []
    section = ""
    buf: list[str] = []

    def flush():
        body = "\n".join(buf).strip()
        if not body:
            return
        i = 0
        while i < len(body):
            j = min(len(body), i + MAX)
            if j < len(body):  # corta en el último fin de párrafo o frase
                cut = max(body.rfind("\n\n", i, j), body.rfind(". ", i, j))
                if cut > i + MAX // 2:
                    j = cut + 1
            out.append((section, body[i:j].strip()))
            if j >= len(body):
                break
            i = max(j - OVER, i + 1)

    for line in text.splitlines():
        m = re.match(r"^(#{1,4})\s+(.*)", line)
        if m:
            flush()
            buf = []
            section = m.group(2).strip()
        else:
            buf.append(line)
    flush()
    return out


def main() -> int:
    INDEX.mkdir(exist_ok=True)
    chunks: list[dict] = []

    def add(**c):
        c["id"] = f"{c['doc']}#{len([x for x in chunks if x['doc'] == c['doc']])}"
        chunks.append(c)

    papers = sorted((LIB / "papers").glob("*/meta.yaml"))
    for meta_f in papers:
        m = read_meta(meta_f)
        pid = m["id"]
        d = meta_f.parent
        base = {"kind": "paper", "paper": pid, "title": m.get("title", ""), "year": m.get("year"),
                "authors": m.get("authors", [])[:6], "subsystems": m.get("subsystems", []),
                "paper_kind": m.get("kind"), "license": m.get("license"), "url": m.get("source")}
        head = f"{m.get('title', '')}. {', '.join(m.get('authors', [])[:6])}. {m.get('year')}. {m.get('venue', '')}."
        add(doc=f"paper:{pid}", section="meta", lang="en", text=head, **base)
        for ab in sorted(d.glob("abstract.*.md")):
            lang = ab.name.split(".")[1]
            add(doc=f"paper:{pid}", section="abstract", lang=lang, text=ab.read_text().strip(), **base)
        for tx in sorted(d.glob("text.*.md")):
            lang = tx.name.split(".")[1]
            for section, body in split(tx.read_text()):
                add(doc=f"paper:{pid}", section=section or "texto", lang=lang, text=body, **base)

    for eq in sorted((LIB / "equations").glob("*.yaml")):
        if eq.name == "constants.yaml":
            continue
        add(doc=f"equation:{eq.stem}", kind="equation", section="ecuación", lang="multi", text=eq.read_text(),
            title=eq.stem, url=f"library/equations/{eq.name}")

    docs = [REPO / "ROADMAP.md", REPO / "README.md", *sorted((REPO / "docs").rglob("*.md"))]
    for f in docs:
        for section, body in split(f.read_text()):
            add(doc=f"doc:{f.relative_to(REPO)}", kind="doc", section=section, lang="es", text=body,
                title=f.stem, url=str(f.relative_to(REPO)))

    for f in sorted((REPO / "apps/web/content/notas").glob("*.md")):
        lang = f.name.split(".")[-2]
        for section, body in split(re.sub(r"^---[\s\S]+?---\n", "", f.read_text())):
            add(doc=f"note:{f.stem}", kind="note", section=section, lang=lang, text=body, title=f.stem,
                url=str(f.relative_to(REPO)))

    with (INDEX / "chunks.jsonl").open("w") as fh:
        for c in chunks:
            fh.write(json.dumps(c, ensure_ascii=False) + "\n")
    stats = {"papers": len(papers), "chunks": len(chunks),
             "by_kind": {k: sum(c["kind"] == k for c in chunks) for k in ("paper", "equation", "doc", "note")}}
    (INDEX / "stats.json").write_text(json.dumps(stats, indent=2) + "\n")
    print(json.dumps(stats))
    return 0


if __name__ == "__main__":
    sys.exit(main())
