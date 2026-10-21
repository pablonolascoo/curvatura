---
name: primeros-principios-fisica
description: Razonar desde primeros principios en relatividad general y teoría cuántica de campos para propuestas de motores de curvatura: partir de las ecuaciones de Einstein, la descomposición 3+1, las condiciones de energía y las leyes de conservación, y reconstruir qué es estrictamente necesario y qué es herencia de un diseño concreto. Úsala al evaluar o generar ideas de propulsión por geometría, al detectar supuestos implícitos o cuando una línea de trabajo se ha quedado en «así se ha hecho siempre».
---

# Primeros principios para el motor de curvatura

## 1. Lo irreducible (no se negocia)

- Ecuaciones de Einstein: G_μν = 8πG/c⁴ · T_μν. La geometría se elige; la materia que exige sale de la ecuación. Toda «métrica de diseño» implica un T_μν que hay que poder fabricar.
- Conservación: ∇_μ T^μν = 0 (identidad de Bianchi). La fuente debe ser dinámicamente consistente, no solo existir en un instante.
- Causalidad local: nada supera la velocidad de la luz respecto a los conos de luz locales. Lo superlumínico es global (geometría), nunca local.
- Formalismo 3+1: lapso α, desplazamiento β^i, métrica espacial γ_ij, curvatura extrínseca K_ij. Ligaduras hamiltoniana y de momento: la densidad de energía euleriana está fijada por γ_ij y K_ij.

## 2. Preguntas que cortan

1. ¿Qué exige **exactamente** el objetivo? (¿llegar antes que la luz por fuera?, ¿aceleración sin propelente?, ¿velocidad constante subluminal?) Cada objetivo tiene requisitos distintos de energía.
2. ¿Qué parte del T_μν es necesaria por el objetivo y qué parte por la forma elegida (función de forma, simetría, perfil de la pared)?
3. ¿Qué observador mide la energía? El euleriano no basta: comprueba todos los observadores (condiciones de energía con barrido; ver `physics/curvatura/energy_conditions.py`).
4. ¿Cuál es el presupuesto mínimo según los teoremas (Ford–Roman, masa positiva, Olum)? Busca en la base y calcula con `lab_*`.
5. ¿Qué escala gobierna el problema (grosor de pared, radio, velocidad, longitud de Planck)? Haz el análisis dimensional (`lab_unidades`) antes que nada.
6. ¿Qué pasa en los límites (v → 0, v → c, pared delgada, campo débil)? ¿Recupera la física conocida?
7. ¿Cómo se acelera la burbuja desde el reposo y cómo se controla desde dentro (horizontes)?

## 3. Reconstrucción

1. Escribe el objetivo como condición sobre la geometría (p. ej. «trayectoria temporal con dτ/dt = 1 dentro y desplazamiento neto Δx > c·Δt fuera»).
2. Elige la familia más general de métricas compatible (no una forma concreta).
3. Calcula G_μν (`lab_tensor` o `physics/`), proyecta en tétradas, barre observadores.
4. Minimiza el coste (energía negativa total, energía positiva total, ADM) sobre la familia.
5. Compara con los mínimos teóricos citados. Si el mínimo choca con un teorema, identifica **qué hipótesis del teorema** habría que romper y si eso es físico (pasa a `auditoria-teoremas`).

Toda afirmación con cita (`buscar`) o cálculo (`lab_*`).
