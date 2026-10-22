# Curvatura

[Español](README.md) · **English** · [Français](README.fr.md) · [中文](README.zh.md)

An open research programme to take the warp drive from general relativity to engineering.

Website: <https://curvatura.consultora-bim.workers.dev> · Current version: see [`version.json`](version.json) and [`CHANGELOG.md`](CHANGELOG.md).

---

## 1. What it is

Curvatura brings three things together:

1. **A library** of papers on warp drives, wormholes, negative energy and related topics, classified and translated.
2. **Computing tools** to check the equations yourself: on the web, in the desktop app and in code (Python, Rust, C++, MATLAB).
3. **A work plan** that states what prevents building a useful drive today and how to tackle it.

## 2. What is done

| Part | Status |
|---|---|
| Library | 3362 papers from arXiv, OpenAlex and Chinese sources. Every title translated (es, en, fr). 2109 with translated abstracts. Author countries on 2645. |
| Live equations | 20 key equations, animated, with every symbol explained and live computation. |
| Lab | AI researcher: uses whichever CLI you have (Claude Code, Codex or Cursor), a local model (Ollama, or in the browser with WebGPU and WebAssembly) or, as a last resort, an Anthropic or OpenAI key. Searches the library and patents, computes with the project's equations and gives a verdict. Board with the 14 obstacles. Rust core in WebAssembly, Python (Pyodide) and formula engine, in the browser. |
| Desktop app | macOS, Windows and Linux, always on the same version. Updates itself and ships native Python. |
| Search and RAG | 10205 chunks indexed with exact citations. MCP server for Claude. |
| Ratings | 1 to 5 stars with ORCID identity. Honour mention for verified graduates and professionals. |
| Research AI | Multimodal RAG over the full text of every paper (sections, equations, figures, references) and patents. Agent with recursive sub-agents, exact citations and multi-agent brainstorming. Runs locally. |
| Formula lab | Identities to 50 digits, units, rigorous bounds, Z3 proofs, numba evaluation and tensors from the metric, on any computer. |
| Patents | Daily watch of related patents (propellantless propulsion, inertia, gravity, Casimir), newest first: office, priority country, inventors, holder, legal status, CPC, official abstract and link. In the library, on the home page and in `library/patentes/`. |
| Plan | Phases and exit criteria in [`ROADMAP.md`](ROADMAP.md). Obstacles in [`docs/obstaculos.md`](docs/obstaculos.md). |

Title and abstract translations are made with AI and may contain errors. The website says so on every paper.

## 3. How to use it

### 3.1 On the web

Open <https://curvatura.consultora-bim.workers.dev>. Nothing to install.

- **Library**: AI search with a 3D semantic map; filter by subsystem, type, country, year or relevance. Every entry links to the original.
- **Equations**: hover a symbol to see its meaning. Change the values and watch the result.
- **Lab**: research an obstacle or an idea with AI, and run computations in Rust, Python or with your own formulas.
- **Prototype**: 3D exploded view of the tabletop demonstrator and the concept vehicle, with the material, electronics and cabling of each part.

### 3.2 Desktop app

1. Download the latest version from [GitHub Releases](https://github.com/pablonolascoo/curvatura/releases/latest).
2. Install it like any other app (`.dmg` on macOS, `.msi` or `.exe` on Windows, `.AppImage` or `.deb` on Linux).
3. Open it. The first time, it installs Python 3.12 with numpy, sympy, scipy and matplotlib. Your system Python is left untouched.
4. Updates arrive on their own. The app checks every 6 hours and asks before restarting.

External links open in your default browser.

### 3.3 Rating papers

1. Go to **Account** and click **Sign in with ORCID**. ORCID confirms you are a real person with a research identity.
2. You can now give 1 to 5 stars to any paper.
3. For the **honour mention**, request verification in **Account**: type of degree or job, institution, year and field.
4. If your ORCID already lists that degree validated by the institution, it is approved automatically.
5. If not, upload a document (PDF, PNG or JPG, 5 MB max). A person reviews it and the document is deleted afterwards.

### 3.4 The library on your machine (RAG)

```bash
python3 -I library/rag/query.py "positive energy shell"   # search with citations
```

To let Claude query the library directly, copy `.mcp.json.example` to `.mcp.json`.

### 3.5 Research AI

An AI that knows the whole database, cites every source and checks formulas. Full guide in [`ia/README.md`](ia/README.md).

```bash
cd ia && uv sync                       # add --extra gpu if you have an Apple or NVIDIA GPU
.venv/bin/curvatura-ia corpus          # downloads the papers (once, a few hours)
.venv/bin/curvatura-ia analizar        # equations, figures and references of each paper
.venv/bin/curvatura-ia vectorizar      # local multimodal database
.venv/bin/curvatura-ia web             # http://localhost:8765
```

From Claude Code: copy `.mcp.json.example` to `.mcp.json` and use the `investigar`, `lluvia-de-ideas` and `formulas` skills.

## 4. How to install it for development

Requirements: [Bun](https://bun.sh) 1.3 or later, [uv](https://docs.astral.sh/uv/), [Rust](https://rustup.rs) with `wasm32-unknown-unknown` and a C++20 compiler.

```bash
git clone https://github.com/pablonolascoo/curvatura.git
cd curvatura
bun install
bun run dev            # website at http://localhost:3000
bun run test           # formulas + Python + Rust + C++
bun run desktop        # desktop app in development mode
```

### Repository map

| Folder | Contents | Language |
|---|---|---|
| [`library/papers/`](library/papers/) | Paper entries: metadata, abstract, translations and full text when the licence allows it. | YAML, Markdown |
| [`library/equations/`](library/equations/) | Key equations in machine format. | YAML |
| [`library/rag/`](library/rag/) | RAG index with exact citations and MCP server. | Python |
| [`docs/`](docs/) | Drive subsystems and obstacle synthesis. | Markdown |
| [`physics/`](physics/) | Einstein tensor, energy conditions, budgets. | Python |
| [`solvers/rust/`](solvers/rust/) | Numerical core: native for the app and WebAssembly for the web. | Rust |
| [`solvers/cpp/`](solvers/cpp/), [`solvers/matlab/`](solvers/matlab/) | Independent implementations for cross-validation. | C++20, MATLAB |
| [`packages/formula/`](packages/formula/) | Our own formula engine: parser, derivatives, integrals, MathML. | TypeScript |
| [`apps/web/`](apps/web/) | Static website and ratings API (Cloudflare Worker + D1). | Next.js |
| [`apps/desktop/`](apps/desktop/) | Desktop app. | Tauri (Rust) |
| [`ia/`](ia/) | Research AI: corpus, analysis, vectors, patents, agent, local web and MCP server. | Python |
| [`.claude/`](.claude/) | Skills (formulas, research, lateral thinking, TRIZ) and sub-agents. | Markdown |
| [`benchmarks/`](benchmarks/) | Same computation in C++, Rust, Go and Python. | Several |

## 5. Workflow

### 5.1 Every change

1. Update the branch: `git fetch origin && git pull --ff-only`.
2. Make the change and run the tests: `bun run test`.
3. If you change website text, change all three dictionaries (`es`, `en`, `fr`).
4. If you change the README, change **all four** (`README.md`, `README.en.md`, `README.fr.md`, `README.zh.md`) and run `bun run readme:check`.
5. Note the change in `CHANGELOG.md`.
6. Commit and push together.

### 5.2 Growing the library

```bash
bun run library:harvest                                   # arXiv + OpenAlex, newest first
python3 -I library/tools/verify.py --write                # title and licence against arXiv
python3 -I library/tools/relevance.py                     # high, medium, low
python3 -I library/tools/enrich.py countries              # author countries
python3 -I library/tools/extract.py <id>                  # abstract and source if the licence allows
bun run library:index                                     # rebuild the RAG index
```

### 5.3 Releasing a version

```bash
bun run deploy          # bumps the version, dates the CHANGELOG, builds and publishes the website
git push --tags         # the vX.Y.Z tag builds the macOS, Windows and Linux apps
```

Details in [`docs/PUBLICAR.md`](docs/PUBLICAR.md).

## 6. Licence and citation

- Code: [PolyForm Noncommercial 1.0.0](LICENSE). Free for research, teaching and study, with attribution to Pablo Nolasco.
- Content: [CC BY-NC-SA 4.0](LICENSE-CONTENT.md).
- Commercial, industrial or patent use: requires written permission from the author.
- Third-party papers keep their own licence. Full text only under CC BY, CC BY-SA or CC0.

Cite the project with [`CITATION.cff`](CITATION.cff).

© 2026 Pablo Nolasco
