---
title: First verified computation
date: 2026-10-21
summary: From the Einstein tensor to the energy of the Alcubierre bubble, in three languages and with the same result.
---

The project's first technical milestone is deliberately small: checking that we can go from a metric to its energy content without mistakes.

## What was done

1. `physics/` builds the Alcubierre metric in 3+1 form, computes the Christoffel symbols, the Ricci tensor and the Einstein tensor symbolically, and projects onto the Eulerian observer.
2. The result is compared at points inside the wall with the closed-form expression

$$\rho_E = -\frac{1}{8\pi}\,\frac{v_s^2\,\rho^2}{4 r_s^2}\left(\frac{df}{dr_s}\right)^2$$

The relative difference is below $10^{-9}$.

3. The total energy reduces to a radial integral:

$$E = -\frac{v_s^2}{12}\int_0^\infty r^2 \left(\frac{df}{dr}\right)^2 dr \;\approx\; -\frac{v_s^2 R^2 \sigma}{36}\quad(\sigma R \gg 1)$$

4. The same integral in C++ (`solvers/cpp`) and in the web formula engine gives $E = -0.223342$ for $v_s = 1$, $R = 1$, $\sigma = 8$.

## Why it matters

Every metric family that enters the project will go through this same path. If the path fails for Alcubierre, it will fail for everything else.

## Next step

Natário and Van Den Broeck with the same test, then the constant-velocity solution by Fuchs and collaborators, whose full text is in the library.
