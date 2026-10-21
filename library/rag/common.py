"""Utilidades compartidas del RAG: lectura de fichas, tokenización y BM25."""

from __future__ import annotations

import json
import math
import re
import unicodedata
from collections import Counter
from pathlib import Path

LIB = Path(__file__).resolve().parents[1]
REPO = LIB.parent
INDEX = LIB / "index"

STOP = set(
    """a al algo como con de del el en es esta este la las lo los para por que se sin su sus un una y o
    the of and to in is are be for on with as by an at from this that it its we our which or not can
    le la les de des du un une et est sont pour dans par sur avec que qui ce cette au aux en ne pas""".split()
)


def norm(s: str) -> str:
    return unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()


def tokens(s: str) -> list[str]:
    return [t for t in re.findall(r"[a-z0-9]+", norm(s)) if len(t) > 1 and t not in STOP]


def read_meta(path: Path) -> dict:
    """Lector mínimo de meta.yaml (sin PyYAML): escalares, listas en línea y listas con guiones."""
    out: dict = {}
    key = None
    for line in path.read_text().splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line.startswith("  - ") and key:
            out.setdefault(key, []).append(line[4:].strip().strip('"'))
            continue
        m = re.match(r"^([a-z_]+):\s*(.*)$", line)
        if not m:
            continue
        key, val = m.group(1), m.group(2).split("  #")[0].strip()
        if val == "":
            out[key] = []
        elif val.startswith("[") and val.endswith("]"):
            out[key] = [x.strip() for x in val[1:-1].split(",") if x.strip()]
        elif val == "null":
            out[key] = None
        elif val in ("true", "false"):
            out[key] = val == "true"
        else:
            v = val.strip('"').replace('\\"', '"')
            out[key] = int(v) if re.fullmatch(r"-?\d+", v) else v
    return out


class BM25:
    def __init__(self, docs: list[list[str]], k1: float = 1.4, b: float = 0.72):
        self.k1, self.b = k1, b
        self.n = len(docs)
        self.len = [len(d) for d in docs]
        self.avg = sum(self.len) / max(self.n, 1)
        self.tf = [Counter(d) for d in docs]
        df = Counter(t for d in self.tf for t in d)
        self.idf = {t: math.log(1 + (self.n - f + 0.5) / (f + 0.5)) for t, f in df.items()}

    def scores(self, q: list[str]) -> list[float]:
        out = [0.0] * self.n
        for t in set(q):
            idf = self.idf.get(t)
            if not idf:
                continue
            for i, tf in enumerate(self.tf):
                f = tf.get(t)
                if f:
                    out[i] += idf * f * (self.k1 + 1) / (f + self.k1 * (1 - self.b + self.b * self.len[i] / self.avg))
        return out


def load_chunks() -> list[dict]:
    f = INDEX / "chunks.jsonl"
    if not f.exists():
        raise SystemExit("No hay índice. Ejecuta: python3 -I library/rag/build.py")
    return [json.loads(l) for l in f.read_text().splitlines() if l.strip()]
