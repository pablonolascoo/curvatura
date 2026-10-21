#!/usr/bin/env bash
# Cadena de texto completo: fuentes de los papers con licencia abierta → Markdown → índice RAG.
set -euo pipefail
cd "$(dirname "$0")/../.."
python3 -I -u library/tools/extract.py --sources-only
python3 -I -u library/tools/latex2md.py --all || true   # un paper que falla no detiene al resto
python3 -I library/tools/relevance.py
python3 -I library/rag/build.py
