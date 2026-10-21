"""Servidor MCP de la biblioteca: Claude (u otro cliente MCP) consulta el índice con citas exactas.

Uso: uv run --with mcp library/rag/mcp_server.py
Configuración de ejemplo en .mcp.json.example (raíz del repo).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import LIB, read_meta  # noqa: E402
from query import search  # noqa: E402

from mcp.server.fastmcp import FastMCP  # noqa: E402

mcp = FastMCP("curvatura-library")


@mcp.tool()
def search_library(query: str, k: int = 8, subsystem: str | None = None, kind: str | None = None, lang: str | None = None) -> str:
    """Busca en la biblioteca de Curvatura. subsystem: G C E S D Q M P V. kind: paper equation doc note.
    Devuelve fragmentos con paper, sección, idioma, licencia y URL de origen para citar."""
    return json.dumps(search(query, k, subsystem, kind, lang), ensure_ascii=False)


@mcp.tool()
def get_paper(paper_id: str) -> str:
    """Ficha completa de un paper (meta.yaml) y sus resúmenes disponibles."""
    d = LIB / "papers" / paper_id
    if not (d / "meta.yaml").exists():
        return json.dumps({"error": f"no existe {paper_id}"})
    out = read_meta(d / "meta.yaml")
    out["abstracts"] = {f.name.split(".")[1]: f.read_text().strip() for f in d.glob("abstract.*.md")}
    out["fulltext_languages"] = [f.name.split(".")[1] for f in d.glob("text.*.md")]
    return json.dumps(out, ensure_ascii=False)


@mcp.tool()
def get_equation(equation_id: str) -> str:
    """Ecuación del registro (library/equations/<id>.yaml) en el DSL del proyecto."""
    f = LIB / "equations" / f"{equation_id}.yaml"
    return f.read_text() if f.exists() else json.dumps({"error": f"no existe {equation_id}"})


if __name__ == "__main__":
    mcp.run()
