# IA de investigación de Curvatura

Una IA a la que escribir que conoce **toda** la base: el texto completo de cada paper (secciones, ecuaciones en LaTeX, figuras, tablas y referencias), las patentes relacionadas y la documentación del proyecto. Busca, abre fuentes, mira gráficas, comprueba fórmulas en un laboratorio rápido y riguroso, se llama a sí misma para investigar subpreguntas y genera ideas nuevas con técnicas de pensamiento lateral. Cita cada fuente.

Todo funciona en local, en macOS, Windows y Linux.

## Qué hace cada pieza

| Pieza | Qué hace | Orden |
|---|---|---|
| Corpus | Descarga la fuente LaTeX de cada paper de arXiv (o el PDF en acceso abierto) a `datos/corpus/`. Respeta el ritmo que pide arXiv (una petición cada 3 s). | `curvatura-ia corpus` |
| Análisis | Saca de cada paper secciones, ecuaciones con su contexto, figuras (PNG), tablas y referencias a `datos/analisis/<id>.json`. | `curvatura-ia analizar` |
| Patentes | Vigila patentes relacionadas (propulsión sin propelente, inercia, gravedad, Casimir, F03H, B64G 1/409…). Guarda ficha, reivindicaciones y dibujos. | `curvatura-ia patentes` |
| Fichas | Una ficha de análisis por paper escrita por IA (aportación, supuestos, resultados, ecuaciones clave, limitaciones, obstáculos que ataca, relación con otros papers, ideas abiertas) en `library/papers/<id>/analisis.yaml`. Es pública y se vectoriza. | `curvatura-ia fichas generar` |
| Resúmenes propios | Para papers cuyo resumen no se puede publicar: reúne lo público (arXiv, OpenAlex, Semantic Scholar, Crossref, página del editor, texto descargado) y escribe un resumen con nuestras palabras en es/en/fr, marcado como IA. | `curvatura-ia fuentes` · `fuentes resumir` |
| Vectores | Base multimodal LanceDB en `datos/vectores/`: texto, ecuaciones, pies de figura, patentes y docs (multilingüe), y las imágenes en un espacio texto↔imagen. Búsqueda híbrida (vectores + palabras). | `curvatura-ia vectorizar` |
| Laboratorio | Igualdades, unidades, cotas rigurosas, demostraciones con Z3, evaluación de millones de puntos, tensores desde la métrica y descubrimiento de fórmulas. | `curvatura-lab …` |
| Agente | Responde con citas, usa el laboratorio y abre subagentes en paralelo que pueden abrir otros. | `curvatura-ia preguntar "…"` |
| Lluvia de ideas | Documentalista → ideadores con técnicas distintas → abogado del diablo → formulista → síntesis. | `curvatura-ia lluvia "…"` |
| Vigilancia | Un ciclo diario: papers nuevos, corpus, análisis, patentes y vectores. | `curvatura-ia vigilar` |

## Instalar

Requisitos: [uv](https://docs.astral.sh/uv/) y unos 15 GB libres para el corpus completo.

```bash
cd ia
uv sync                      # CPU (cualquier ordenador)
uv sync --extra gpu          # con GPU de Apple o NVIDIA: vectores de calidad en horas, no en días
```

Opcional: `brew install ghostscript` (o el de tu sistema) para convertir figuras EPS antiguas.

## Usar

### 1. Construir la base (una vez; luego se mantiene sola)

```bash
.venv/bin/curvatura-ia corpus        # unas horas: una petición cada 3 s
.venv/bin/curvatura-ia analizar      # minutos, en paralelo
.venv/bin/curvatura-ia patentes      # se puede repetir: cada ronda amplía el grafo
.venv/bin/curvatura-ia vectorizar    # incremental
.venv/bin/curvatura-ia estado
```

### 2. Escribirle

Hay tres formas. Elige la que te venga mejor.

**a) Desde Claude Code (sin clave de API).** En la raíz del repo, copia `.mcp.json.example` a `.mcp.json` y abre una conversación nueva. Tendrás las herramientas `buscar`, `ver_figura`, `ecuaciones`, `lab_*`… y las skills `investigar`, `lluvia-de-ideas`, `formulas`, más los subagentes `investigador`, `ideador`, `abogado-del-diablo` y `formulista`. Ejemplo: «/lluvia-de-ideas ¿cómo reducir la energía negativa de la pared por debajo de la cota cuántica?».

**b) Web local.**

```bash
.venv/bin/curvatura-ia web           # http://localhost:8765
```

«Buscar» y «Figuras» funcionan siempre. «Preguntar» y «Lluvia de ideas» necesitan un modelo (punto c).

**c) Terminal o web con un modelo.**

```bash
export ANTHROPIC_API_KEY=…                         # Claude (recomendado)
# o un modelo local y gratuito con Ollama:
export CURVATURA_LLM_URL=http://localhost:11434/v1 CURVATURA_LLM_MODELO=qwen3:32b
.venv/bin/curvatura-ia preguntar "¿Qué cota cuántica limita la pared de Alcubierre?"
.venv/bin/curvatura-ia chat
.venv/bin/curvatura-ia lluvia "Energía negativa en la pared de la burbuja"
```

Modelos: `CURVATURA_MODELO` (principal, por defecto `claude-opus-5-5`) y `CURVATURA_MODELO_SUB` (subagentes, `claude-sonnet-5-5`).

### 3. Laboratorio de fórmulas

```bash
.venv/bin/curvatura-lab igual "tanh(2*x) = 2*tanh(x)/(1+tanh(x)^2)"
.venv/bin/curvatura-lab unidades "E = m*c^2" m=masa c=velocidad E=energia
.venv/bin/curvatura-lab cota "-(v^2*rho^2)/(32*pi*r^2)*(sigma*(sech(sigma*(r+1))^2 - sech(sigma*(r-1))^2)/(2*tanh(sigma)))^2" v=0.1:2 rho=0:3 r=0.1:4 sigma=1:10 --signo "<=0"
.venv/bin/curvatura-lab z3 "x^3 - x > 0" --si "x > 0"
.venv/bin/curvatura-lab banco "exp(-x^2)*tanh(y)*sqrt(x*y+1)/(1+x^4)"
.venv/bin/curvatura-lab tensor alcubierre
```

Garantías: «demostrada» es simbólica o exacta; «numerica» es igualdad a 50 dígitos en puntos aleatorios; «falsa» trae contraejemplo; una cota «parcial» no está demostrada.

### 4. Vigilancia continua

```bash
bash vigilar-instalar.sh            # macOS (LaunchAgent) o Linux (cron): cada día a las 03:30
bash vigilar-instalar.sh --quitar
# Windows (PowerShell):  .\vigilar-instalar.ps1
```

En GitHub, `.github/workflows/vigilar.yml` hace cada lunes la parte pública (papers nuevos e índice de patentes).

Claves opcionales para más fuentes de patentes (gratuitas, hay que registrarse): `EPO_OPS_KEY` y `EPO_OPS_SECRET` (developers.epo.org), `USPTO_ODP_API_KEY` (data.uspto.gov), `LENS_API_TOKEN` (lens.org). Sin claves se usa el grafo de citas de las fichas públicas de Google Patents.

## Rendimiento: todo el hardware del equipo

`curvatura-ia hardware` muestra qué detecta y qué motor usa cada parte; `--banco` lo mide.

| Parte | Motor |
|---|---|
| App nativa (Rust) | GPU con wgpu (Metal en Mac, DirectX 12 o Vulkan en Windows, Vulkan en Linux) para mapas grandes; todos los núcleos con rayon para el resto. Resultados en binario, sin JSON. |
| Laboratorio: barridos | La misma GPU desde Python (wgpu): la rejilla se genera en la GPU y solo vuelven mínimo, máximo, media y signo. Sin GPU, numba en todos los núcleos. |
| Laboratorio: evaluar | numba compilado y paralelo (f64). |
| Vectores de texto | GPU con PyTorch (CUDA en NVIDIA, Metal en Apple, media precisión, con vigilante que reinicia si se cuelga). Sin PyTorch: ONNX con el mejor acelerador (CUDA, DirectML en Windows para cualquier GPU o NPU, QNN en Snapdragon, OpenVINO en Intel). Sin acelerador: un proceso por núcleo. |
| Análisis de papers | Un proceso por núcleo. |

Medido en un Mac mini M4 (10 núcleos), con 16,8 millones de puntos del campo de Alcubierre:

| Motor | Tiempo | Millones de puntos/s |
|---|---|---|
| Rust, 1 hilo | 240 ms | 70 |
| Rust, 10 hilos | 40 ms | 416 |
| Rust, GPU (solo cálculo, 67 M puntos) | 17 ms | 4.036 |
| Python, barrido en GPU (4.295 millones de puntos, densidad de energía) | 2,4 s | 1.800 |

El Neural Engine de Apple (vía CoreML) se probó: con el modelo de vectores es mucho más lento que la GPU, así que no se usa por defecto (`CURVATURA_COREML=1` para activarlo).

En Windows, para usar la GPU o la NPU con DirectML: `uv pip install onnxruntime-directml` dentro de `ia/` (sustituye a `onnxruntime`).

## Memoria: un solo modelo cargado

Cada proceso que busca carga el modelo de vectores (unos 2,5 GB). Varios a la vez agotan la memoria de un equipo de 16 GB.
- Para agentes y Claude Code, usa el servidor MCP: un proceso compartido.
- En la terminal, deja abierta `curvatura-ia web`: `curvatura-ia herramienta …` le pasa las consultas y no carga otro modelo.
- No vectorices mientras trabajan varios agentes.

## Licencias y datos

- `datos/` no entra en git. El texto completo de papers sin licencia abierta es para investigación privada: cada persona lo descarga en su equipo con estas herramientas. Lo público es el código, los metadatos y el índice bibliográfico de patentes (`library/patentes/indice.yaml`).
- Cada fragmento lleva su atribución (autores, año, título, revista, DOI/arXiv, licencia, enlace). La IA tiene la orden de citarla siempre.
- Skills de terceros en `.claude/skills/` con su licencia MIT y su origen (`ORIGEN.md`).
