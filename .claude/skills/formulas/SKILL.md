---
name: formulas
description: Generar, transformar y VALIDAR fórmulas a toda velocidad con el laboratorio de Curvatura (symengine, Arb/python-flint, Z3, numba, regresión simbólica). Úsala siempre que una respuesta contenga una ecuación, una cifra derivada, una simplificación, un signo que demostrar (p. ej. «la energía es negativa en toda la pared»), un análisis dimensional, una métrica nueva o datos de los que sacar una ley. No la uses para texto sin matemáticas.
---

# Laboratorio de fórmulas

Ninguna fórmula se da por buena sin pasar por aquí. El laboratorio corre en cualquier ordenador (CPU, sin GPU) y responde en milisegundos o segundos.

## Cómo llamarlo

- Desde Claude Code con el MCP `curvatura` cargado: herramientas `lab_*` (ver tabla).
- Desde la terminal (`ia/.venv`): `ia/.venv/bin/curvatura-lab <orden> … [--json]`.
- Desde Python: `from curvatura.lab import igualdad, unidades, cotas, prueba, rapido, tensores, descubrir`.

Sintaxis: `a^2`, `sqrt()`, `exp()`, `tanh()`, `sech()`, `pi`, `diff(f(r), r)`, igualdades con `=`. LaTeX entre `$…$`.

## Qué herramienta para qué

| Pregunta | Herramienta | Garantía |
|---|---|---|
| ¿A = B? ¿se simplifica a esto? | `lab_igual` / `curvatura-lab igual "a = b"` | «demostrada» (simbólica), «numerica» (50 dígitos en puntos aleatorios: error ~1e-50), «falsa» con contraejemplo |
| ¿Cuadran las unidades? | `lab_unidades` / `curvatura-lab unidades "E = m*c^2" m=masa c=velocidad E=energia` | Exacta. `--geometricas` para G = c = 1 |
| ¿Qué valores toma en esta región? ¿Es negativa en todo el dominio? | `lab_cota` / `curvatura-lab cota "expr" x=0:1 r=0.1:4 --signo "<=0"` | Rigurosa (aritmética de bolas Arb + ramificación y poda + análisis de signo por factores) |
| Desigualdad polinómica o racional con hipótesis | `lab_z3` / `curvatura-lab z3 "a^2+b^2 >= 2*a*b" --si "a>0"` | Exacta (Z3). Contraejemplo exacto si es falsa |
| Evaluar millones de puntos, barridos, mapas | `lab_evaluar` / `curvatura-lab banco "expr"` | numba paralelo: cientos de millones de puntos/s |
| De la métrica a G_μν y ρ euleriana; contrastar con un paper | `lab_tensor` / `curvatura-lab tensor alcubierre --comparar "ρ del paper"` | symengine (ms); contraste a 50 dígitos |
| Sacar la ley que explica unos datos | `lab_descubrir` / `curvatura-lab descubrir datos.csv --y col` | Frente de Pareto error/complejidad. PySR si `uv sync --extra descubrir` en physics/ |
| Comprobar las ecuaciones vivas de la biblioteca | `curvatura-lab biblioteca` | Lectura y evaluación de todas |

## Protocolo para generar una fórmula nueva

1. **Plantea** la fórmula a partir de una fuente (cítala con `buscar`/`ecuaciones`) o de un razonamiento explícito.
2. **Unidades** primero (`lab_unidades`). Si fallan, la fórmula está mal: no sigas.
3. **Casos límite**: evalúa (`lab_evaluar`) en límites conocidos (v → 0, R → ∞, σ → ∞, campo débil) y compáralos con la literatura.
4. **Equivalencias**: si dices que se reduce a otra (de un paper), demuéstralo con `lab_igual`. Si sale «falsa», enseña el contraejemplo.
5. **Signos y cotas**: cualquier afirmación «siempre negativa», «acotada por», «mínimo en» se demuestra con `lab_cota` (o `lab_z3` si es polinómica).
6. **Números**: toda cifra (energía total, masa equivalente, grosor de pared) sale de `lab_evaluar` con los parámetros escritos, en unidades geométricas y SI.
7. **Informa** en tabla: fórmula · prueba · resultado · garantía · fuente.

## Trucos de velocidad

- `simplify` es lo lento: el laboratorio lo evita (symengine expande, mpmath compara). Pide `simbolica=False` en `lab_igual` si solo necesitas certeza numérica.
- Para funciones sin definir (`f(r)`) la igualdad se prueba con varias funciones concretas (tanh, gaussiana, lorentziana).
- Una cota «parcial» significa que hay que partir más el dominio (`--max-cajas`) o reducirlo; nunca la presentes como demostrada.
