# Registro de cambios

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado semántico con codename (`version.json`).

## Sin publicar

## Alcubierre v0.5.0 · 2026-10-22

### Añadido
- Investigador IA con varios motores, por orden de preferencia: el CLI instalado en el ordenador (Claude Code, Codex o Cursor, con su propia sesión y en directo), un modelo local (Ollama, que la app arranca y para, con el modelo recomendado según la memoria; o en el navegador con WebGPU y WebAssembly) y, en último lugar, una clave de Anthropic u OpenAI.
- Patentes en la biblioteca y en la portada: oficina, país de prioridad, inventores, titular, estado legal, CPC, resumen oficial y enlaces a Google Patents y Espacenet, con búsqueda y filtros. La IA también busca en ellas.

### Cambiado
- Fuera la opción «Web» del investigador: cada motor usa sus propias herramientas.

## Alcubierre v0.4.0 · 2026-10-22

### Añadido
- Laboratorio con IA: investigador que corre en el navegador con la clave de Anthropic de cada uno (nunca pasa por nuestros servidores). Busca en el texto completo de la biblioteca, abre papers, calcula y barre cotas con el motor de fórmulas y las ecuaciones del proyecto, y termina con un veredicto. Búsqueda web opcional y exportación en Markdown.
- Tablero de investigación: el camino que sobrevive, las 5 leyes, los 14 obstáculos, descartes, objeciones y experimentos; cada tarjeta se manda al investigador IA.
- Biblioteca: buscador con IA y mapa semántico 3D (UMAP de los vectores multilingual-e5-large, 14 grupos y vecinos por IA); la cámara viaja a la zona de los resultados.
- Prototipo: despiece 3D del demostrador de mesa y del vehículo conceptual, ficha de ingeniería por pieza y bocetos a mano.

### Cambiado
- Fuera la pestaña Buscar: la búsqueda vive en la biblioteca (las URL antiguas redirigen).

### Corregido
- La búsqueda en texto completo ya no se queda colgada si falla el índice.
- Aviso de React al escribir los filtros de la biblioteca en la URL.

## Alcubierre v0.3.0 · 2026-10-22

### Añadido
- Núcleo Rust en la GPU con wgpu (Metal, DirectX 12, Vulkan): 4.000 millones de puntos/s de cálculo en un M4; la app de escritorio la usa para mapas grandes, con transferencia binaria, y muestra el motor usado.
- Laboratorio: barridos de hasta 8 variables y miles de millones de puntos en la GPU de cualquier equipo (SymPy → WGSL) o en todos los núcleos con numba; herramienta `lab_barrido`.
- `curvatura-ia hardware`: detecta CPU, GPU, PyTorch y aceleradores ONNX (CUDA, DirectML, QNN, OpenVINO) y elige motor; `--banco` lo mide.
- Resúmenes: 527 resúmenes originales de arXiv recuperados (CC0) y resúmenes propios con IA, en es/en/fr, para los papers cuyo resumen no se puede publicar, a partir de fuentes públicas (OpenAlex, Semantic Scholar, Crossref, páginas de editoriales, texto descargado).

### Cambiado
- Campo de Alcubierre en CPU tres veces más rápido: f'(r) se calcula una sola vez por punto.
- IA de investigación (`ia/`): descarga del texto completo de cada paper (LaTeX de arXiv o PDF en acceso abierto), análisis de secciones, ecuaciones con contexto, figuras, tablas y referencias, y base vectorial multimodal local (LanceDB: texto multilingüe con multilingual-e5-large y figuras con SigLIP 2), con búsqueda híbrida y atribución en cada fragmento.
- Agente con RAG, laboratorio y subagentes recursivos; lluvia de ideas multiagente (documentalista, ideadores con técnicas distintas, abogado del diablo, formulista, síntesis). Terminal, web local, servidor MCP para Claude Code; Anthropic o modelos locales compatibles con OpenAI.
- Laboratorio de fórmulas (`curvatura-lab`): igualdades (symengine, 50 dígitos, SymPy), unidades, cotas rigurosas con Arb, demostraciones con Z3, evaluación con numba, tensor de Einstein con symengine y descubrimiento de fórmulas.
- Fichas de análisis por paper escritas por IA (`library/papers/<id>/analisis.yaml`), empezando por los 233 de relevancia alta.
- Vigilancia de patentes (Google Patents sin clave; EPO, USPTO y Lens con clave) e índice público en `library/patentes/`. Vigilancia diaria local y semanal en GitHub Actions.
- Skills: `formulas`, `investigar`, `lluvia-de-ideas`, `primeros-principios-fisica`, `auditoria-teoremas`, `triz-espaciotiempo`, y 17 de terceros (MIT) de pensamiento lateral, TRIZ, hipótesis y crítica. Subagentes `investigador`, `ideador`, `abogado-del-diablo` y `formulista`.

## Alcubierre v0.2.1 · 2026-10-21

## Alcubierre v0.2.0 · 2026-10-21

### Añadido
- Valoraciones de 1 a 5 estrellas con identidad ORCID (Cloudflare Worker + D1).
- Mención de honor para titulados (grado, máster, posgrado, doctorado) y profesionales del área. Verificación automática con afiliaciones validadas por la institución en ORCID; si no, documento revisado a mano y borrado tras la revisión.
- Página «Cuenta»: inicio de sesión, solicitud de verificación y cola de revisión para administradores.
- Resúmenes traducidos al español y al francés en 2109 papers. Aviso de traducción con IA en títulos y resúmenes.
- README en español, inglés, francés y chino, con comprobación automática (`bun run readme:check`) en la CI, en los tests y antes de cada despliegue.

### Cambiado
- Banderas y países ya no se solapan en la ficha del paper.
- En la app de escritorio, los enlaces externos se abren en el navegador predeterminado.

## Alcubierre v0.1.2 · 2026-10-21

### Añadido
- Títulos de los 3367 papers traducidos al español, inglés y francés; papers en chino y de instituciones chinas.
- País de los autores (OpenAlex) con banderas en círculo y filtro por país en la biblioteca.
- Python nativo en las apps de macOS, Windows y Linux: uv incluido instala Python 3.12 con numpy, sympy, scipy y matplotlib.
- Núcleo Rust paralelo en la app de escritorio; banco de pruebas C++, Rust, Go y Python con la decisión documentada.
- Cabecera editorial, bento y bloques fijados (gpt-taste) en todas las páginas interiores.

## Alcubierre v0.1.1 · 2026-10-21

### Añadido
- SEO, GEO y AEO: canónicas y hreflang, sitemap, robots abierto a buscadores y asistentes de IA, llms.txt, datos estructurados (WebSite, ResearchProject, Dataset, ScholarlyArticle), favicon e imagen para redes.
- App de escritorio: firma estable y actualizaciones automáticas firmadas.
- Skills de venta, psicología de venta y SEO/GEO/AEO en el equipo.

## Alcubierre v0.1.0 · 2026-10-21

### Añadido
- Guion del proyecto (`ROADMAP.md`) y especificación de los nueve subsistemas (`docs/subsistemas/`).
- Biblioteca: 23 fichas, 20 verificadas contra arXiv; resúmenes originales y traducciones al español y francés.
- Texto completo de Fuchs et al. 2024 (CC BY 4.0) en inglés, español y francés, con 43 ecuaciones y 16 figuras.
- Fuente LaTeX de los cuatro papers con licencia CC BY: Fell y Heisenberg 2021, Helmerich et al. 2024, Fuchs et al. 2024, Clough et al. 2024.
- `physics/`: tensor de Einstein simbólico desde la métrica 3+1, métrica de Alcubierre, condiciones de energía con barrido de observadores.
- `solvers/cpp` y `solvers/matlab`: implementaciones independientes de Alcubierre.
- `@curvatura/formula`: parser, compilación, derivación simbólica y render MathML.
- Web estática en español, inglés y francés: página única con render Three.js, laboratorio interactivo de la métrica, biblioteca y notas.
- Herramientas `library/tools/verify.py` y `library/tools/extract.py`.
- Despliegue versionado `bun run deploy`.
