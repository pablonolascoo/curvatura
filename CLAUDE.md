# Curvatura · instrucciones para agentes

Proyecto abierto de Pablo Nolasco. Repo: `pablonolascoo/curvatura`.

## Antes de tocar nada

```bash
git fetch origin && git pull --ff-only
```

Commit y push juntos. Mensajes `tipo(ámbito): resumen`.

## Mapa

| Ruta | Qué es | Test |
|---|---|---|
| `library/` | Biblioteca de papers. Ver `library/README.md`. | `python3 -I library/tools/verify.py` |
| `physics/` | Núcleo Python (uv). | `uv --directory physics run pytest -q` |
| `solvers/cpp` | Núcleo C++20 header-only. | `make -C solvers/cpp test` |
| `solvers/matlab` | MATLAB/Octave. | Manual |
| `packages/formula` | Motor de fórmulas TS. | `bun --filter '@curvatura/formula' test` |
| `apps/web` | Next.js 16, export estático, i18n es/en/fr por diccionarios. | `bun --filter web build` |

## Reglas

- Bun para todo lo JS. uv para Python.
- Next.js 16 tiene cambios: lee `node_modules/next/dist/docs/` antes de usar una API.
- Sin proxy ni middleware: la web es `output: "export"`. Idioma por segmento `[lang]`.
- Textos de la web en `apps/web/src/dictionaries/*.json`. Los tres idiomas siempre a la vez.
- Diseño: `DESIGN.md`. Three.js: skills en `.claude/skills/threejs-*`.
- Papers: texto completo solo con licencia abierta (`library/taxonomy.yaml`).
- No desplegar sin orden explícita. Despliegue: `bun run deploy` (requiere `.cloudflare.env`).
- Toda cifra en la web sale de un cálculo o de una cita.
