# Curvatura

Programa abierto de investigación para llevar el motor de curvatura de la relatividad general a la ingeniería.

*An open research programme to take the warp drive from general relativity to engineering. Docs in Spanish first; the website and app are in Spanish, English and French.*

---

## Qué hay aquí

| Carpeta | Contenido | Lenguaje |
|---|---|---|
| [`library/papers/`](library/papers/) | Biblioteca: miles de fichas recolectadas de arXiv y del grafo de citas de OpenAlex, clasificadas por subsistema, tipo, licencia y relevancia. Resúmenes originales y traducidos; textos completos cuando la licencia lo permite. | YAML, Markdown |
| [`library/equations/`](library/equations/) | Ecuaciones clave en formato máquina: símbolos con significado, fuente y cálculo preprogramado. | YAML |
| [`library/rag/`](library/rag/) | Índice para RAG con citas exactas: BM25, embeddings opcionales y servidor MCP. | Python |
| [`docs/`](docs/) | Nueve subsistemas del motor y la síntesis de obstáculos. | Markdown |
| [`physics/`](physics/) | Tensor de Einstein desde cualquier métrica, condiciones de energía, presupuestos. | Python |
| [`solvers/rust/`](solvers/rust/) | Núcleo numérico único: nativo para la app y WebAssembly para la web. Campos y geodésicas. | Rust |
| [`solvers/cpp/`](solvers/cpp/), [`solvers/matlab/`](solvers/matlab/) | Implementaciones independientes para validación cruzada. | C++20, MATLAB/Octave |
| [`packages/formula/`](packages/formula/) | Motor de fórmulas propio: parser, compilación, derivación simbólica, MathML. | TypeScript |
| [`apps/web/`](apps/web/) | Web: página única, ecuaciones vivas, laboratorio (Rust/WASM, Python/Pyodide, fórmulas), biblioteca y buscador. | Next.js |
| [`apps/desktop/`](apps/desktop/) | App nativa para macOS, Windows y Linux, siempre en la misma versión. Incluye el núcleo Rust paralelo, Python en el navegador (Pyodide) y Python nativo (uv instala Python 3.12 con numpy, sympy, scipy y matplotlib la primera vez). | Tauri (Rust) |
| [`benchmarks/`](benchmarks/) | Mismo cálculo en C++, Rust, Go y Python, con la decisión de lenguajes. | Varios |

Plan con fases y criterios de salida: [`ROADMAP.md`](ROADMAP.md). Qué impide construirlo hoy: [`docs/obstaculos.md`](docs/obstaculos.md).

## Primeros pasos

```bash
bun install
bun run dev            # web en http://localhost:3000
bun run test           # fórmulas + Python + Rust + C++
bun run desktop        # app de escritorio en modo desarrollo
```

Requisitos: [Bun](https://bun.sh) ≥ 1.3, [uv](https://docs.astral.sh/uv/), [Rust](https://rustup.rs) con `wasm32-unknown-unknown`, un compilador C++20.

### Biblioteca y RAG

```bash
bun run library:harvest                                   # arXiv + OpenAlex, lo más reciente primero
python3 -I library/tools/verify.py --write                # título y licencia contra arXiv
python3 -I library/tools/relevance.py                     # alta, media, baja
python3 -I library/tools/extract.py <id>                  # resumen y fuente si la licencia lo permite
bun run library:index                                     # library/index/chunks.jsonl
python3 -I library/rag/query.py "positive energy shell"   # búsqueda con citas
uv run --with fastembed --with numpy library/rag/embed.py # embeddings opcionales (búsqueda híbrida)
```

Para que Claude consulte la biblioteca directamente, copia `.mcp.json.example` a `.mcp.json`.

## Descargas

Las versiones de escritorio se publican en [GitHub Releases](https://github.com/pablonolascoo/curvatura/releases) con cada etiqueta `vX.Y.Z` (flujo `release.yml`).

## Licencia y cita

- Código: [PolyForm Noncommercial 1.0.0](LICENSE). Uso libre para investigación, docencia y estudio, con atribución.
- Contenidos: [CC BY-NC-SA 4.0](LICENSE-CONTENT.md).
- Uso comercial, industrial o de patente: requiere licencia escrita del autor.
- Papers de terceros: cada uno conserva su licencia original. Texto completo solo con CC BY, CC BY-SA o CC0.

Cita el proyecto con [`CITATION.cff`](CITATION.cff).

© 2026 Pablo Nolasco
