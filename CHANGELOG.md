# Registro de cambios

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado semántico con codename (`version.json`).

## Sin publicar

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
