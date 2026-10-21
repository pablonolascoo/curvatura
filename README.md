# Curvatura

**Español** · [English](README.en.md) · [Français](README.fr.md) · [中文](README.zh.md)

Programa abierto de investigación para llevar el motor de curvatura de la relatividad general a la ingeniería.

Web: <https://curvatura.consultora-bim.workers.dev> · Versión actual: ver [`version.json`](version.json) y [`CHANGELOG.md`](CHANGELOG.md).

---

## 1. Qué es

Curvatura reúne en un solo sitio tres cosas:

1. **Una biblioteca** de papers sobre motores de curvatura, agujeros de gusano, energía negativa y temas cercanos, clasificada y traducida.
2. **Herramientas de cálculo** para comprobar las ecuaciones por uno mismo: en la web, en la app de escritorio y en código (Python, Rust, C++, MATLAB).
3. **Un plan de trabajo** que dice qué impide construir un motor útil hoy y cómo atacarlo.

## 2. Qué está hecho

| Parte | Estado |
|---|---|
| Biblioteca | 3362 papers de arXiv, OpenAlex y fuentes chinas. Todos con título traducido (es, en, fr). 2109 con resumen traducido. Países de los autores en 2645. |
| Ecuaciones vivas | 20 ecuaciones clave animadas, con símbolos explicados y cálculo en directo. |
| Laboratorio | Núcleo Rust en WebAssembly, Python (Pyodide) y motor de fórmulas propio, en el navegador. |
| App de escritorio | macOS, Windows y Linux, siempre en la misma versión. Se actualiza sola y trae Python nativo. |
| Buscador y RAG | 10205 fragmentos indexados con citas exactas. Servidor MCP para Claude. |
| Valoraciones | Estrellas de 1 a 5 con identidad ORCID. Mención de honor para titulados y profesionales verificados. |
| IA de investigación | RAG multimodal sobre el texto completo de cada paper (secciones, ecuaciones, figuras, referencias) y las patentes. Agente con subagentes recursivos, citas exactas y lluvia de ideas multiagente. Funciona en local. |
| Laboratorio de fórmulas | Igualdades a 50 dígitos, unidades, cotas rigurosas, demostraciones con Z3, evaluación con numba y tensores desde la métrica, en cualquier ordenador. |
| Patentes | Vigilancia diaria de patentes relacionadas (propulsión sin propelente, inercia, gravedad, Casimir). Índice en `library/patentes/`. |
| Plan | Fases y criterios de salida en [`ROADMAP.md`](ROADMAP.md). Obstáculos en [`docs/obstaculos.md`](docs/obstaculos.md). |

Las traducciones de títulos y resúmenes están hechas con IA y pueden contener errores. La web lo indica en cada ficha.

## 3. Cómo usarlo

### 3.1 En la web

Abre <https://curvatura.consultora-bim.workers.dev>. No hace falta instalar nada.

- **Biblioteca**: filtra por subsistema, tipo, país, año o relevancia. Cada ficha enlaza al original.
- **Ecuaciones**: pasa el ratón por un símbolo para ver qué significa. Cambia los valores y mira el resultado.
- **Laboratorio**: ejecuta cálculos en Rust, Python o con fórmulas propias.
- **Buscar**: busca en toda la biblioteca a la vez.

### 3.2 App de escritorio

1. Descarga la última versión en [GitHub Releases](https://github.com/pablonolascoo/curvatura/releases/latest).
2. Instálala como cualquier otra app (`.dmg` en macOS, `.msi` o `.exe` en Windows, `.AppImage` o `.deb` en Linux).
3. Ábrela. La primera vez instala Python 3.12 con numpy, sympy, scipy y matplotlib. No toca el Python de tu sistema.
4. Las actualizaciones llegan solas. La app comprueba cada 6 horas y pide permiso antes de reiniciar.

Los enlaces externos se abren en tu navegador predeterminado.

### 3.3 Valorar papers

1. Entra en **Cuenta** y pulsa **Iniciar sesión con ORCID**. ORCID confirma que eres una persona real con identidad investigadora.
2. Ya puedes dar de 1 a 5 estrellas a cualquier paper.
3. Para la **mención de honor**, pide la verificación en **Cuenta**: tipo de estudio o trabajo, institución, año y área.
4. Si tu ORCID ya tiene esa titulación validada por la institución, se aprueba sola.
5. Si no, sube un documento (PDF, PNG o JPG, máximo 5 MB). Una persona lo revisa y el documento se borra al terminar.

### 3.4 Biblioteca en tu equipo (RAG)

```bash
python3 -I library/rag/query.py "positive energy shell"   # búsqueda con citas
```

Para que Claude consulte la biblioteca directamente, copia `.mcp.json.example` a `.mcp.json`.

### 3.5 IA de investigación

Una IA que conoce toda la base, cita cada fuente y comprueba las fórmulas. Guía completa en [`ia/README.md`](ia/README.md).

```bash
cd ia && uv sync                       # añade --extra gpu si tienes GPU de Apple o NVIDIA
.venv/bin/curvatura-ia corpus          # descarga los papers (una vez, unas horas)
.venv/bin/curvatura-ia analizar        # ecuaciones, figuras y referencias de cada paper
.venv/bin/curvatura-ia vectorizar      # base multimodal local
.venv/bin/curvatura-ia web             # http://localhost:8765
```

Desde Claude Code: copia `.mcp.json.example` a `.mcp.json` y usa las skills `investigar`, `lluvia-de-ideas` y `formulas`.

## 4. Cómo instalarlo para desarrollar

Requisitos: [Bun](https://bun.sh) 1.3 o superior, [uv](https://docs.astral.sh/uv/), [Rust](https://rustup.rs) con `wasm32-unknown-unknown` y un compilador C++20.

```bash
git clone https://github.com/pablonolascoo/curvatura.git
cd curvatura
bun install
bun run dev            # web en http://localhost:3000
bun run test           # fórmulas + Python + Rust + C++
bun run desktop        # app de escritorio en modo desarrollo
```

### Mapa del repositorio

| Carpeta | Contenido | Lenguaje |
|---|---|---|
| [`library/papers/`](library/papers/) | Fichas de papers: datos, resumen, traducciones y texto completo si la licencia lo permite. | YAML, Markdown |
| [`library/equations/`](library/equations/) | Ecuaciones clave en formato máquina. | YAML |
| [`library/rag/`](library/rag/) | Índice RAG con citas exactas y servidor MCP. | Python |
| [`docs/`](docs/) | Subsistemas del motor y síntesis de obstáculos. | Markdown |
| [`physics/`](physics/) | Tensor de Einstein, condiciones de energía, presupuestos. | Python |
| [`solvers/rust/`](solvers/rust/) | Núcleo numérico: nativo para la app y WebAssembly para la web. | Rust |
| [`solvers/cpp/`](solvers/cpp/), [`solvers/matlab/`](solvers/matlab/) | Implementaciones independientes para validación cruzada. | C++20, MATLAB |
| [`packages/formula/`](packages/formula/) | Motor de fórmulas propio: parser, derivadas, integrales, MathML. | TypeScript |
| [`apps/web/`](apps/web/) | Web estática y API de valoraciones (Cloudflare Worker + D1). | Next.js |
| [`apps/desktop/`](apps/desktop/) | App de escritorio. | Tauri (Rust) |
| [`ia/`](ia/) | IA de investigación: corpus, análisis, vectores, patentes, agente, web local y servidor MCP. | Python |
| [`.claude/`](.claude/) | Skills (fórmulas, investigación, pensamiento lateral, TRIZ) y subagentes. | Markdown |
| [`benchmarks/`](benchmarks/) | Mismo cálculo en C++, Rust, Go y Python. | Varios |

## 5. Proceso de trabajo

### 5.1 Cada cambio

1. Trae la rama: `git fetch origin && git pull --ff-only`.
2. Haz el cambio y pasa los tests: `bun run test`.
3. Si cambias textos de la web, cambia los tres diccionarios (`es`, `en`, `fr`).
4. Si cambias el README, cambia **los cuatro** (`README.md`, `README.en.md`, `README.fr.md`, `README.zh.md`) y pasa `bun run readme:check`.
5. Apunta el cambio en `CHANGELOG.md`.
6. Commit y push juntos.

### 5.2 Ampliar la biblioteca

```bash
bun run library:harvest                                   # arXiv + OpenAlex, lo más reciente primero
python3 -I library/tools/verify.py --write                # título y licencia contra arXiv
python3 -I library/tools/relevance.py                     # alta, media, baja
python3 -I library/tools/enrich.py countries              # países de los autores
python3 -I library/tools/extract.py <id>                  # resumen y fuente si la licencia lo permite
bun run library:index                                     # reconstruye el índice RAG
```

### 5.3 Publicar una versión

```bash
bun run deploy          # sube la versión, fecha el CHANGELOG, compila y publica la web
git push --tags         # la etiqueta vX.Y.Z lanza las apps de macOS, Windows y Linux
```

Detalles en [`docs/PUBLICAR.md`](docs/PUBLICAR.md).

## 6. Licencia y cita

- Código: [PolyForm Noncommercial 1.0.0](LICENSE). Libre para investigación, docencia y estudio, con atribución a Pablo Nolasco.
- Contenidos: [CC BY-NC-SA 4.0](LICENSE-CONTENT.md).
- Uso comercial, industrial o de patente: requiere permiso escrito del autor.
- Papers de terceros: cada uno conserva su licencia. Texto completo solo con CC BY, CC BY-SA o CC0.

Cita el proyecto con [`CITATION.cff`](CITATION.cff).

© 2026 Pablo Nolasco
