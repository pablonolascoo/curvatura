# Soluciones y leyes encontradas

Estado a 2026-10-22, tras la sesión 1 de ideas (cinco frentes + crítica cruzada). Todo generado con IA: cada cifra sale del laboratorio o de un paper citado en los informes de [`ideas/`](ideas/), y la crítica cruzada ([`ideas/f-critica-cruzada.md`](ideas/f-critica-cruzada.md)) ya corrigió las que estaban mal. Hay que verificarlo antes de darlo por bueno.

Leyenda: **viva** (sigue en pie, con cálculo siguiente claro) · **ley** (límite que no se ha podido disolver; romperlo exige cambiar un supuesto físico) · **descartada**.

## El camino que sobrevive

Una **cáscara subluminal de energía positiva** (la solución de velocidad constante de Fuchs et al. 2024), **montada ya en movimiento** en lugar de acelerada, y **sin superar la velocidad de la luz**, para no crear horizontes ni inestabilidades del vacío.

No es un motor útil todavía: a v = 0,02 c, con masas de una fracción de Júpiter. Pero es lo único que hoy cumple todas las condiciones de energía, y cada pieza tiene un cálculo siguiente concreto.

| Pieza | Estado | Cifra clave (corregida) | Siguiente cálculo | Informe |
|---|---|---|---|---|
| Masa mínima de la cáscara | viva | M ≳ ⅔·β·R₁·c²/G más un término de pared: ≈ 0,18 M_J para β = 0,02 (Fuchs publica 2,37: ~13 veces menos) | Optimizador 1D con certificados LMI del prefactor M/(β·R₁) | [B](ideas/b-masa-cascara.md) |
| Arranque sin aceleración | viva | Ensamblar la cáscara ya en movimiento: cota inferior 8,07×10⁴⁰ J a v = 0,02 (~101 veces menos que un cohete de fotones) | Colapso esférico 1+1 de una cáscara hasta la de Fuchs | [C](ideas/c-aceleracion.md) |
| Régimen subluminal | viva | Sin horizonte ni divergencia del tensor renormalizado; Doppler de proa ≤ 4,36 con β ≤ 0,9 | — | [D](ideas/d-horizontes.md) |
| Materia de la cáscara | viva con conflicto | Densidad nuclear: faltan ~3,5 órdenes de densidad de energía para R = 100 m; pero a densidad nuclear la masa sube a 3–7,7 M_J (choca con la cáscara ligera) | TOV anisótropa con ecuación de estado nuclear y β máximo | [E](ideas/e-fuente-material.md), [F](ideas/f-critica-cruzada.md) |
| Espín y torsión (Einstein-Cartan) | viva (lejana) | La materia de la burbuja cumple NEC/WEC; faltan 4,3×10²⁴ en densidad de espín frente a materia nuclear polarizada | Espín total en una burbuja tipo Van Den Broeck | [A](ideas/a-energia-negativa.md) |
| Burbuja que «respira» (supraluminal a pulsos) | viva (teórica) | κ = 2σ(1 − 1/v) confirmada; con v = 10, fases a 0,9 c y ganancia ≤ 10: 1,93 c de media (optimista: no cuenta los cambios de velocidad) | Tensor renormalizado con v(t) periódica en 1+1 | [D](ideas/d-horizontes.md) |

## Leyes (límites que no se han podido disolver)

1. **Energía negativa cuántica:** |ρ| ≲ ħc/L⁴. Para una burbuja de 100 m a 0,1 c haría falta L ≲ 0,2 fm. Con Casimir a 10 nm faltan ~35 órdenes. ([E](ideas/e-fuente-material.md))
2. **Casimir apilado:** con placas reales (≥ 10⁻⁶ kg/m², huecos ≥ 1 Å) la pila nunca viola la NEC promediada; el coste lo pagan las placas (prueba Z3). ([A](ideas/a-energia-negativa.md))
3. **Horizonte:** una burbuja aislada a v > 1 sobre exterior plano siempre tiene horizonte, para cualquier lapso. Solo un tubo previo tipo Krasnikov lo evita, moviendo el coste. ([D](ideas/d-horizontes.md))
4. **Momento:** con energía positiva y sin flujo en el infinito, el momento ADM no cambia: acelerar exige escape o un tercer cuerpo. ([C](ideas/c-aceleracion.md))
5. **Materiales de laboratorio:** arrastre máximo ≈ 12σ/(ρc), entre 0,2 y 4 m/s, sea cual sea el tamaño. ([B](ideas/b-masa-cascara.md))

## Descartadas

Placas de Casimir como fuente macroscópica · cohete de ondas gravitacionales · cáscara cargada (mueve el coste al límite de Schwinger) · Van Den Broeck sin energía negativa · cáscaras anidadas · escalar no mínimo (exige un campo 14–16 órdenes por encima del Higgs).

## Objeciones abiertas al camino

- La solución de Fuchs está discutida en la literatura (Barzegar 2026) y podría no aportar nada sobre una cáscara normal (Idrissov 2026). Ver [F](ideas/f-critica-cruzada.md).
- Inestabilidad no radial de la cáscara: sin estudiar.
- «Más ligera» y «materia nuclear» chocan: hay que resolver juntas la masa y la ecuación de estado.

## Experimentos de mesa que sí se pueden hacer ya

- Contrastar la desigualdad cuántica electromagnética con luz comprimida a −15 dB ([A3](ideas/a-energia-negativa.md)).
- Análogos de laboratorio (fluidos, condensados) para la cinemática de la burbuja que respira (obstáculo 14).
