# Guion del proyecto

Objetivo: llevar el motor de curvatura de solución de las ecuaciones de Einstein a especificación de ingeniería verificable. Cada fase tiene un criterio de salida medible. No se pasa de fase sin cumplirlo.

Convenio: unidades geométricas `G = c = 1` salvo que se indique; signatura `(-,+,+,+)`; formalismo 3+1 (ADM) con lapso `α`, desplazamiento `β^i` y métrica espacial `γ_ij`.

## Estado de partida (2026)

| Hecho | Fuente |
|---|---|
| La métrica de Alcubierre es solución exacta, pero exige densidad de energía euleriana negativa en la pared de la burbuja. | Alcubierre 1994 |
| Las desigualdades cuánticas acotan el grosor de pared y llevan la energía total a órdenes absurdos (≈ 10⁶² kg · v_s para R ≈ 100 m). | Pfenning & Ford 1997 |
| La geometría puede reducir la energía requerida muchos órdenes de magnitud. | Van Den Broeck 1999 |
| Toda burbuja genérica viola la condición de energía nula (NEC). | Santiago, Schuster & Visser 2022 |
| Existen soluciones subluminales con energía positiva: cáscara de materia con desplazamiento interno. | Bobrick & Martire 2021; Fuchs et al. 2024 |
| La forma de Alcubierre es idéntica a la métrica acústica de un fluido en movimiento. Se puede construir un análogo en laboratorio. | Unruh 1981; Barceló, Liberati & Visser 2011 |

Conclusión operativa: el camino viable empieza **subluminal, con energía positiva y con masa**. La supraluminalidad queda como pregunta abierta, no como requisito de las primeras fases.

## Arquitectura del motor

Nueve subsistemas. Cada uno tiene su documento en [`docs/subsistemas/`](docs/subsistemas/).

| Código | Subsistema | Pregunta que responde |
|---|---|---|
| G | Geometría | ¿Qué métrica queremos producir? |
| C | Condiciones de energía | ¿Qué tensor energía-momento exige y es admisible? |
| E | Fuente | ¿Qué materia real produce ese tensor? |
| S | Estructura | ¿Cómo se confina y soporta la cáscara? |
| D | Dinámica y control | ¿Cómo se acelera, se guía y se detiene? |
| Q | Estabilidad semiclásica | ¿Sobrevive a los efectos cuánticos? |
| M | Medio | ¿Qué pasa con las partículas y la radiación del entorno? |
| P | Potencia | ¿Cuál es el balance de masa-energía y potencia? |
| V | Verificación | ¿Cómo se demuestra cada afirmación? |

## Fases

### F0 · Biblioteca y estado del arte
- Catalogar todo paper relevante con ficha (`library/papers/<id>/meta.yaml`).
- Clasificar por subsistema, tipo (solución, restricción, fuente, numérico, experimental, análogo) y licencia.
- Extraer ecuaciones clave a formato máquina (`equations.yaml`) para el motor de fórmulas.
- **Salida:** 60 fichas verificadas contra arXiv/DOI y un mapa de dependencias entre papers.

### F1 · Motor de cálculo verificado
- `physics/`: tensores de Einstein desde la métrica (SymPy simbólico, NumPy numérico).
- `solvers/cpp`: evaluación de campos sobre mallas grandes.
- `solvers/matlab`: puente con Warp Factory (Helmerich et al. 2024) para validación cruzada.
- Reproducir: densidad euleriana de Alcubierre, Natário, Van Den Broeck y la solución de velocidad constante de Fuchs et al.
- **Salida:** cada resultado publicado reproducido con error relativo < 10⁻⁶ en malla de referencia y test automático en CI.

### F2 · Espacio de diseño
- Parametrizar familias de métricas (función de forma, lapso, desplazamiento, cáscara).
- Funcional de coste: energía total, violación de NEC/WEC/DEC, tensión máxima, masa ADM.
- Optimización restringida para encontrar soluciones con energía positiva y masa mínima.
- **Salida:** frente de Pareto masa / velocidad / tensión publicado con datos reproducibles.

### F3 · Fuentes físicas
- Traducir el `T_μν` requerido a modelos de materia: fluido perfecto, cáscara anisótropa, plasma Einstein-Maxwell (Lentz 2021).
- Ecuaciones de estado admisibles y estabilidad lineal.
- **Salida:** al menos un modelo de materia con ecuación de estado física que reproduzca una métrica de F2.

### F4 · Dinámica
- Evolución temporal en relatividad numérica (3+1): arranque, aceleración, frenado.
- Firma en ondas gravitacionales de la formación y colapso de la burbuja.
- **Salida:** simulación estable de una aceleración subluminal con energía positiva y su forma de onda.

### F5 · Análogo de laboratorio
- La métrica `ds² = -c² dt² + (dx - v(x,t) dt)² + dy² + dz²` es la métrica acústica de un flujo con campo de velocidades `v`.
- Diseñar un canal hidráulico o un condensado donde `v = v_s f(r_s)` reproduzca la burbuja para las perturbaciones del medio.
- Medir propagación de ondas, horizontes acústicos y amplificación en la pared.
- **Salida:** banco de ensayo construido, medidas publicadas y comparadas con el modelo.

### F6 · Prototipo de ingeniería
- Solo si F3 encuentra una fuente física viable.
- Especificación de componentes, tolerancias, presupuesto de masa y potencia, plan de ensayos.
- **Salida:** documento de diseño preliminar (PDR) revisable por terceros.

## Preguntas abiertas

- ¿Existe una solución supraluminal sin violar la NEC? Santiago, Schuster & Visser indican que no en el caso genérico.
- ¿Cómo se acelera una burbuja sin intercambio de momento con el exterior?
- ¿Qué control causal tiene la tripulación sobre la pared en régimen supraluminal? (Problema del horizonte, Krasnikov 1998.)
- ¿Es estable la cáscara frente a perturbaciones y frente al tensor de energía cuántico renormalizado?

## Reglas de trabajo

- Toda afirmación cuantitativa lleva cita o test que la reproduce.
- Cada cambio de comportamiento lleva entrada en [`CHANGELOG.md`](CHANGELOG.md).
- Versionado: `version.json` con codename y semver, etiqueta `vX.Y.Z` en cada publicación.
