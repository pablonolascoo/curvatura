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
| `solvers/rust` | Núcleo Rust: nativo (app) y WASM (web). | `cargo test --release --manifest-path solvers/rust/Cargo.toml` |
| `apps/web` | Next.js 16, export estático, i18n es/en/fr por diccionarios. | `bun --filter web build` |
| `apps/desktop` | Tauri 2. Empaqueta `apps/web/out` y Pyodide local. | `bun run desktop:build` |
| `library/equations` | Ecuaciones vivas (DSL + símbolos + cálculo). | build de la web |
| `library/rag` | Índice RAG ligero (BM25) y servidor MCP mínimo. | `python3 -I library/rag/build.py` |
| `ia/` | IA de investigación: corpus, análisis, vectores LanceDB, patentes, agente, web y MCP. Ver `ia/README.md`. | `uv run --project ia pytest -q ia/tests` |
| `physics/curvatura/lab` | Laboratorio de fórmulas (symengine, Arb, Z3, numba). Skill `formulas`. | `uv run --project ia pytest -q physics/tests/test_lab.py` |
| `.claude/skills`, `.claude/agents` | Skills (fórmulas, investigar, lluvia de ideas, TRIZ, lateral…) y subagentes. | — |

## Reglas

- Bun para todo lo JS. uv para Python.
- Next.js 16 tiene cambios: lee `node_modules/next/dist/docs/` antes de usar una API.
- Sin proxy ni middleware: la web es `output: "export"`. Idioma por segmento `[lang]`.
- Textos de la web en `apps/web/src/dictionaries/*.json`. Los tres idiomas siempre a la vez.
- README en cuatro idiomas (`README.md` es, `README.en.md`, `README.fr.md`, `README.zh.md`). Si cambias uno, cambias **todos** en el mismo commit y pasas `bun run readme:check` (también corre en la CI y en `bun run test`).
- Diseño: `DESIGN.md` (minimalist-ui, obligatorio). Three.js: skills en `.claude/skills/threejs-*`.
- Papers: texto completo solo con licencia abierta (`library/taxonomy.yaml`).
- No desplegar sin orden explícita. Despliegue: `bun run deploy` (requiere `.cloudflare.env`).
- Toda cifra en la web sale de un cálculo o de una cita.
- Fórmulas: ninguna se da por buena sin el laboratorio (skill `formulas`). Investigación: skill `investigar` con el MCP `curvatura`.
- `datos/` (corpus completo, vectores) nunca entra en git: el texto de papers sin licencia abierta es solo para uso local.
