# Curvatura

Programa abierto de investigación para llevar el motor de curvatura de la relatividad general a la ingeniería.

*An open research programme to take the warp drive from general relativity to engineering. Documentation is in Spanish first; the website is in Spanish, English and French.*

---

## Qué hay aquí

| Carpeta | Contenido | Lenguaje |
|---|---|---|
| [`library/`](library/) | Biblioteca de papers: fichas verificadas, resúmenes, textos completos con licencia abierta y traducciones (es, en, fr). | YAML, Markdown, Python |
| [`docs/`](docs/) | Especificación de los nueve subsistemas del motor. | Markdown |
| [`physics/`](physics/) | Núcleo de cálculo: tensor de Einstein desde la métrica, condiciones de energía, presupuestos de energía. | Python (SymPy, NumPy, SciPy) |
| [`solvers/`](solvers/) | Implementaciones independientes para validación cruzada y mallas grandes. | C++20, MATLAB/Octave |
| [`packages/formula/`](packages/formula/) | Motor de fórmulas propio: parser, evaluación compilada, derivación simbólica y render MathML. | TypeScript |
| [`apps/web/`](apps/web/) | Web: página única, biblioteca y notas. Renders con Three.js. | Next.js |

El plan completo, con fases y criterios de salida, está en [`ROADMAP.md`](ROADMAP.md).

## Punto de partida

La métrica de Alcubierre (1994) es una solución exacta de las ecuaciones de Einstein, pero exige energía negativa. Desde 2021 existen soluciones subluminales con energía positiva (Bobrick y Martire; Fuchs y colaboradores). El proyecto empieza por reproducirlas, después busca fuentes físicas y, en paralelo, un análogo hidrodinámico construible en laboratorio.

## Primeros pasos

```bash
bun install
bun run dev                              # web en http://localhost:3000
bun run test                             # motor de fórmulas + física + C++
```

Requisitos: [Bun](https://bun.sh) ≥ 1.3, [uv](https://docs.astral.sh/uv/) para Python, un compilador C++20.

```bash
uv --directory physics run python -m curvatura.cli alcubierre --v 1 --R 100 --sigma 0.1
python3 -I library/tools/verify.py       # verifica las fichas contra arXiv
python3 -I library/tools/extract.py      # resúmenes y fuentes con licencia abierta
```

## Estado

| Hito | Estado |
|---|---|
| Biblioteca inicial (23 papers, 20 verificados contra arXiv) | Hecho |
| Tensor de Einstein simbólico, validado contra Alcubierre (error < 10⁻⁹) | Hecho |
| Validación cruzada Python / C++ / web | Hecho |
| Texto completo y traducción: Fuchs et al. 2024 | Hecho |
| Natário, Van Den Broeck y Fuchs reproducidos | Siguiente |

## Contribuir

Lee [`CONTRIBUTING.md`](CONTRIBUTING.md). Toda afirmación cuantitativa lleva cita o test.

## Licencia y cita

- Código: [PolyForm Noncommercial 1.0.0](LICENSE). Uso libre para investigación, docencia y estudio, con atribución.
- Contenidos: [CC BY-NC-SA 4.0](LICENSE-CONTENT.md).
- Uso comercial, industrial o de patente: requiere licencia escrita del autor.
- Papers de terceros: cada uno conserva su licencia original.

Cita el proyecto con [`CITATION.cff`](CITATION.cff).

© 2026 Pablo Nolasco
