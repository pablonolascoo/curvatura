"""Embeddings densos opcionales (multilingües) para búsqueda híbrida.

Uso: uv run --with fastembed --with numpy library/rag/embed.py
Modelo: paraphrase-multilingual-MiniLM-L12-v2 (ONNX, CPU, ~220 MB la primera vez).
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import INDEX, load_chunks  # noqa: E402

MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
_model = None


def _get():
    global _model
    if _model is None:
        from fastembed import TextEmbedding

        _model = TextEmbedding(MODEL)
    return _model


def encode_query(q: str):
    import numpy as np

    v = np.array(next(iter(_get().embed([q]))), dtype="float32")
    return v / (np.linalg.norm(v) or 1)


def main() -> int:
    import numpy as np

    chunks = load_chunks()
    texts = [f"{c.get('title', '')}. {c.get('section', '')}. {c['text']}"[:2000] for c in chunks]
    E = np.array(list(_get().embed(texts, batch_size=64)), dtype="float32")
    E /= np.linalg.norm(E, axis=1, keepdims=True).clip(1e-9)
    np.save(INDEX / "embeddings.npy", E)
    print(f"embeddings: {E.shape}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
