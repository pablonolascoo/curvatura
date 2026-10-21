---
name: lluvia-de-ideas
description: Lluvia de ideas multiagente para resolver obstáculos del motor de curvatura (energía negativa, horizontes, inestabilidades, masa-energía enorme, control de la burbuja…) combinando pensamiento lateral, TRIZ, inversión, analogía y primeros principios con el RAG completo de papers y patentes, una crítica adversaria contra los teoremas de imposibilidad y la validación de cada fórmula en el laboratorio. Úsala cuando pidan ideas nuevas, «pensar fuera de la caja», «think different», «pensamiento lateral» o soluciones a un problema abierto.
---

# Lluvia de ideas con base RAG

Objetivo: ideas **nuevas y comprobables**, no listas genéricas. Cada idea sale apoyada en papers reales, atacada por un crítico y medida con el laboratorio.

## Fases (en Claude Code, con subagentes en paralelo)

1. **Encuadre (tú)**: formula el problema como contradicción («queremos X, pero X exige Y que la física prohíbe o encarece»). Usa `aplicar_tecnica triz-dissolve` para separar lo que es **estructura** (disoluble) de lo que es **ley** (no disoluble).
2. **Documentalista** (1 subagente `investigador`): estado del arte con citas, cifras y ecuaciones; qué se intentó y por qué falló. Incluye patentes (`buscar` con `tipos: ["patente"]`).
3. **Ideadores** (5–6 subagentes `ideador` en paralelo, uno por técnica): `triz-espaciotiempo`, `inversion`, `analogy`, `provocation`, `creative-thinking-for-research`, `primeros-principios-fisica` (opcionales: `scamper`, `six-hats`, `random-stimulus`, `worst-idea`, `concept-fan`). Cada uno: carga el protocolo con `aplicar_tecnica`, lee el informe del documentalista, propone 3 ideas con mecanismo, fórmula/estimación, papers de apoyo y prueba que la mataría.
4. **Abogado del diablo** (1 subagente `abogado-del-diablo`): skills `the-fool` y `auditoria-teoremas`. Cada idea contra cada teorema: viola / evita / abierto, con citas a favor y en contra.
5. **Formulista** (1 subagente `formulista`): skill `formulas`. Unidades, límites, signos y cifras de las ideas vivas.
6. **Síntesis (tú)**: tabla ordenada por promesa, con por qué podría funcionar, por qué no, comprobaciones hechas, y el siguiente paso concreto (cálculo, simulación, lectura o experimento de mesa).

Sin Claude Code: `ia/.venv/bin/curvatura-ia lluvia "problema"` hace lo mismo con la API (Anthropic o un modelo local).

## Reglas para no producir humo

- Ninguna idea «viva» sin al menos una cita que la apoye y una prueba que la pueda matar.
- Distingue **disolver** un coste de **moverlo** (p. ej. esconder la energía negativa en una capa que requiere más energía positiva no la elimina).
- Las provocaciones son escalones, no conclusiones: siempre se vuelve a la física.
- Los números grandes se calculan, no se adjetivan: «10⁶⁴ kg» con su cálculo, no «enorme».
- Si una idea ya existe en la literatura, dilo y cita; el valor está en la variante nueva.
