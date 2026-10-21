---
name: auditoria-teoremas
description: Auditoría roja de propuestas de motor de curvatura, agujero de gusano o propulsión exótica contra los teoremas de imposibilidad y los resultados negativos conocidos (condiciones de energía, desigualdades cuánticas de energía, masa positiva, censura topológica y superlumínica, protección cronológica, horizontes e inestabilidades semiclásicas). Para cada teorema dictamina viola / evita / abierto, con citas de la base. Úsala para criticar ideas, antes de dar por viable una propuesta, o como abogado del diablo técnico.
---

# Auditoría de teoremas de imposibilidad

Los nombres de abajo son **pistas para buscar en la base**; las citas, enunciados exactos y cifras salen de `buscar`/`leer_seccion`, nunca de memoria.

## Lista de control

| # | Resultado | Qué exige / qué prohíbe | Hipótesis que hay que mirar | Buscar |
|---|---|---|---|---|
| 1 | Condiciones de energía puntuales (NEC, WEC, SEC, DEC) | T_ab k^a k^b ≥ 0 (NEC), T_ab u^a u^b ≥ 0 (WEC)… | Son condiciones, no leyes: la teoría cuántica las viola localmente | «null energy condition violation warp», Santiago Schuster Visser 2022 |
| 2 | Condiciones promediadas (ANEC, AWEC) | Integral de T_ab k^a k^b a lo largo de geodésicas nulas completas ≥ 0 | Geodésicas acronales completas; espacio plano o curvo | «averaged null energy condition» |
| 3 | Desigualdades cuánticas de energía (Ford–Roman) | La energía negativa muestreada en un tiempo τ está acotada (∝ −1/τ⁴ en 4D sin masa) | Campo libre, función de muestreo, curvatura pequeña en la escala τ | «quantum inequality warp drive», Pfenning Ford 1997 |
| 4 | Teoremas de masa positiva (Schoen–Yau, Witten) | Masa ADM ≥ 0 con la DEC y asintóticamente plano | DEC en todas partes; datos iniciales regulares | «positive mass theorem warp shell», Lobo Visser 2004 |
| 5 | Superlumínico exige energía negativa (Olum; Visser–Bassett–Liberati) | Atajos superlumínicos (definición global) violan la NEC/WEC | Definición de «superlumínico»; condiciones genéricas | «superluminal travel requires negative energy», «superluminal censorship» |
| 6 | Censura topológica (Friedman–Schleich–Witt) | Sin violar ANEC no hay atajos topológicos atravesables | ANEC y globalmente hiperbólico | «topological censorship» |
| 7 | Protección cronológica (Hawking) y causalidad con dos burbujas (Everett) | Las curvas temporales cerradas se autodestruyen por divergencias cuánticas | Aproximación semiclásica | «chronology protection», «warp drive closed timelike curves» |
| 8 | Horizontes y control (Hiscock; Finazzi–Liberati–Barceló) | Una burbuja superlumínica tiene horizontes: no se controla desde dentro y el tensor renormalizado diverge | Superlumínico, formación desde el reposo | «warp drive horizon semiclassical instability» |
| 9 | Acumulación de partículas y desplazamiento al azul (McMonigal–Lewis–O'Byrne) | Al frenar, la burbuja libera energía acumulada | Velocidad, duración del viaje | «warp drive particle accumulation blueshift» |
| 10 | Burbujas de energía positiva (Fell–Heisenberg; Lentz; Bobrick–Martire; Fuchs et al.) | Hay soluciones subluminales físicas; lo superlumínico sigue exigiendo violar condiciones | Observador, velocidad, simetría | «positive energy warp soliton», «physical warp drive» |

## Procedimiento

1. Resume la propuesta como métrica o como mecanismo físico con su T_μν.
2. Para cada fila: dictamen **viola** (y por qué es fatal o no), **evita** (qué hipótesis no se cumple y si eso es físico) o **abierto**. Cita a favor y en contra.
3. Calcula lo que se pueda: energía negativa total frente a la cota cuántica, masa ADM, grosor mínimo de pared (`lab_evaluar`, `lab_cota`).
4. Veredicto: descartada / viva / prometedora, y la prueba concreta que decidiría.

Romper una hipótesis no es un fallo: es exactamente donde puede estar la idea nueva. Pero hay que decir qué precio físico tiene.
