# Ecuaciones

Una ecuación por fichero, en el DSL de `@curvatura/formula`. La web las anima, colorea y calcula.

```yaml
id: identificador
paper: id de library/papers (fuente)
subsystem: G | C | E | S | D | Q | M | P | V
title: { es, en, fr }
expr: fórmula en el DSL (relaciones =, >=, <=, ~; índices x_sub y x__sup)
symbols:                         # grupo: geometry (azul), energy (rojo), velocity (amarillo), matter (verde), constant (gris)
  v_s: { group: velocity, es: ..., en: ..., fr: ... }
compute:                         # opcional: cálculo en vivo
  result: expresión (lado derecho), en unidades SI o geométricas
  unit: unidad del resultado
  inputs:
    v_s: { min, max, default, unit, log }
  constants: [hbar, c, G]        # de constants.yaml
  also: { label: {es,en,fr}, expr, unit }   # segundo resultado opcional
```
