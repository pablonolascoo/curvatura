# Registro de cambios

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado semántico con codename (`version.json`).

## Sin publicar

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
