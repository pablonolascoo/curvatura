---
title: Primer cálculo verificado
date: 2026-10-21
summary: Del tensor de Einstein a la energía de la burbuja de Alcubierre, en tres lenguajes y con el mismo resultado.
---

El primer hito técnico del proyecto es pequeño a propósito: comprobar que sabemos pasar de una métrica a su contenido de energía sin errores.

## Qué se ha hecho

1. `physics/` construye la métrica de Alcubierre en forma 3+1, calcula los símbolos de Christoffel, el tensor de Ricci y el tensor de Einstein de forma simbólica, y proyecta sobre el observador euleriano.
2. El resultado se compara en puntos de la pared con la expresión cerrada

$$\rho_E = -\frac{1}{8\pi}\,\frac{v_s^2\,\rho^2}{4 r_s^2}\left(\frac{df}{dr_s}\right)^2$$

La diferencia relativa es menor que $10^{-9}$.

3. La energía total se reduce a una integral radial:

$$E = -\frac{v_s^2}{12}\int_0^\infty r^2 \left(\frac{df}{dr}\right)^2 dr \;\approx\; -\frac{v_s^2 R^2 \sigma}{36}\quad(\sigma R \gg 1)$$

4. La misma integral en C++ (`solvers/cpp`) y en el motor de fórmulas de la web da $E = -0.223342$ para $v_s = 1$, $R = 1$, $\sigma = 8$.

## Por qué importa

Cada familia de métricas que entre en el proyecto pasará por este mismo camino. Si el camino falla con Alcubierre, fallará con todo lo demás.

## Siguiente paso

Natário y Van Den Broeck con el mismo test, y después la solución de velocidad constante de Fuchs y colaboradores, que tiene texto completo en la biblioteca.
