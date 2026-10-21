# physics

Núcleo de cálculo en Python. Unidades geométricas `G = c = 1`, signatura `(-,+,+,+)`.

```bash
uv sync
uv run pytest
uv run python -m curvatura.cli alcubierre --v 1 --R 1 --sigma 8
```

| Módulo | Qué hace |
|---|---|
| `curvatura.tensor` | Christoffel, Ricci y Einstein simbólicos desde cualquier métrica. |
| `curvatura.metrics.alcubierre` | Función de forma, expansión, densidad euleriana y energía total. |
| `curvatura.energy_conditions` | NEC y WEC con barrido de observadores. |
| `curvatura.units` | Paso a SI. |
