"""Consulta el índice: BM25 léxico y, si existe library/index/embeddings.npy, búsqueda híbrida.

Uso:
  python3 -I library/rag/query.py "positive energy warp shell" -k 8
  python3 -I library/rag/query.py "condición de energía nula" --subsystem C --json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import BM25, INDEX, load_chunks, tokens  # noqa: E402


def search(query: str, k: int = 8, subsystem: str | None = None, kind: str | None = None, lang: str | None = None) -> list[dict]:
    chunks = load_chunks()
    keep = [i for i, c in enumerate(chunks)
            if (not subsystem or subsystem in (c.get("subsystems") or []))
            and (not kind or c["kind"] == kind) and (not lang or c.get("lang") in (lang, "multi"))]
    sub = [chunks[i] for i in keep]
    bm = BM25([tokens(f"{c.get('title', '')} {c.get('section', '')} {c['text']}") for c in sub])
    lex = bm.scores(tokens(query))
    score = lex
    emb_f = INDEX / "embeddings.npy"
    if emb_f.exists():
        try:  # híbrido: 0.5 léxico normalizado + 0.5 coseno
            import numpy as np
            from embed import encode_query

            E = np.load(emb_f)[keep]
            qv = encode_query(query)
            cos = E @ qv
            mx = max(lex) or 1.0
            score = [0.5 * (l / mx) + 0.5 * float(c) for l, c in zip(lex, cos)]
        except Exception as exc:  # sin numpy/fastembed se usa solo BM25 y se avisa
            print(f"aviso: embeddings no disponibles ({exc}); solo BM25", file=sys.stderr)
    order = sorted(range(len(sub)), key=lambda i: -score[i])[:k]
    return [{**sub[i], "score": round(score[i], 4)} for i in order if score[i] > 0]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("query")
    ap.add_argument("-k", type=int, default=8)
    ap.add_argument("--subsystem")
    ap.add_argument("--kind", choices=["paper", "equation", "doc", "note"])
    ap.add_argument("--lang")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    res = search(a.query, a.k, a.subsystem, a.kind, a.lang)
    if a.json:
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0
    for r in res:
        cite = f"{r.get('title', '')} ({r.get('year', '')})" if r["kind"] == "paper" else r.get("url", "")
        print(f"[{r['score']:.3f}] {r['id']}  {cite}  · {r.get('section', '')} · {r.get('lang', '')}")
        print("   " + r["text"][:240].replace("\n", " ") + ("…" if len(r["text"]) > 240 else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
