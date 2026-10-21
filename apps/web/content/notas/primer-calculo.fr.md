---
title: Premier calcul vérifié
date: 2026-10-21
summary: Du tenseur d'Einstein à l'énergie de la bulle d'Alcubierre, en trois langages et avec le même résultat.
---

Le premier jalon technique du projet est volontairement modeste : vérifier que nous savons passer d'une métrique à son contenu énergétique sans erreur.

## Ce qui a été fait

1. `physics/` construit la métrique d'Alcubierre sous forme 3+1, calcule symboliquement les symboles de Christoffel, le tenseur de Ricci et le tenseur d'Einstein, puis projette sur l'observateur eulérien.
2. Le résultat est comparé en des points de la paroi avec l'expression fermée

$$\rho_E = -\frac{1}{8\pi}\,\frac{v_s^2\,\rho^2}{4 r_s^2}\left(\frac{df}{dr_s}\right)^2$$

L'écart relatif est inférieur à $10^{-9}$.

3. L'énergie totale se réduit à une intégrale radiale :

$$E = -\frac{v_s^2}{12}\int_0^\infty r^2 \left(\frac{df}{dr}\right)^2 dr \;\approx\; -\frac{v_s^2 R^2 \sigma}{36}\quad(\sigma R \gg 1)$$

4. La même intégrale en C++ (`solvers/cpp`) et dans le moteur de formules du site donne $E = -0.223342$ pour $v_s = 1$, $R = 1$, $\sigma = 8$.

## Pourquoi c'est important

Chaque famille de métriques qui entrera dans le projet suivra ce même chemin. S'il échoue avec Alcubierre, il échouera avec tout le reste.

## Étape suivante

Natário et Van Den Broeck avec le même test, puis la solution à vitesse constante de Fuchs et ses collaborateurs, dont le texte intégral est dans la bibliothèque.
