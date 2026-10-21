---
name: triz-espaciotiempo
description: TRIZ adaptado a la relatividad general y la propulsión por geometría. Convierte los compromisos del motor de curvatura («más velocidad exige más energía negativa», «pared delgada reduce energía pero aumenta densidades») en contradicciones físicas y aplica separación en espacio, tiempo, escala y condición, con un inventario de recursos (vacío cuántico, Casimir, dimensiones extra, metamateriales, campos no mínimos, gravedad análoga). Úsala para generar soluciones estructurales a obstáculos del motor; combínala con triz-dissolve y auditoria-teoremas.
---

# TRIZ para el espaciotiempo

Base: `triz-dissolve` (estructura frente a ley) y `triz-engineering-solver` (40 principios). Aquí, su traducción a GR.

## 1. Contradicciones típicas

| Mejorar | Empeora | Contradicción física |
|---|---|---|
| Velocidad v | Energía negativa ∝ v² (Alcubierre) | La pared debe tener mucha y poca curvatura extrínseca |
| Pared delgada (menos volumen) | Densidad de energía mayor, cotas cuánticas más duras | La pared debe ser delgada (energía total) y gruesa (desigualdades cuánticas) |
| Burbuja grande (pasajeros) | Energía total crece con R² | El interior debe ser grande para la nave y pequeño para el presupuesto |
| Energía positiva en todas partes | Solo subluminal | La materia debe ser ordinaria y comportarse como exótica |
| Control desde dentro | Horizonte si v > c | La nave debe estar causalmente conectada con la pared y no estarlo |

## 2. Separaciones

- **En el espacio**: distinto T_μν en regiones distintas (capas, cáscaras anidadas, pared con estructura, geometría tipo Van Den Broeck: interior grande, superficie exterior pequeña).
- **En el tiempo**: régimen pulsado; energía negativa solo durante intervalos que respetan las desigualdades cuánticas; fases de aceleración distintas de las de crucero.
- **En la escala**: microestructura cuántica (Casimir, estados comprimidos) que promedia a un T_μν efectivo distinto a escala macroscópica.
- **Por condición**: efectos que aparecen solo en ciertas orientaciones, frecuencias o estados (vacío entre placas, campos acoplados no mínimamente, términos efectivos de teorías modificadas).
- **Entre el sistema y el entorno**: ¿puede el entorno (campo de fondo, cosmología, materia oscura hipotética) aportar parte del T_μν?

## 3. Inventario de recursos (búscalos en la base antes de usarlos)

Vacío cuántico y efecto Casimir · estados comprimidos · campos escalares no mínimos · teorías modificadas (f(R), Einstein–Gauss–Bonnet, teleparalelo, dimensiones extra/branas) · metamateriales y gravedad análoga (solo como simulador o analogía) · plasma y campos EM intensos (contribución positiva) · rotación (Kerr, frame dragging) · topología (agujeros de gusano, cuerdas cósmicas).

## 4. Principios TRIZ con traducción directa

1 Segmentación (cáscaras anidadas) · 2 Extracción (separar la región exótica de la habitable) · 3 Calidad local (perfil de pared optimizado) · 10 Acción previa (preparar el vacío antes) · 13 Al revés (mover el espacio, no la nave; o la nave cae, no empuja) · 15 Dinamismo (métrica dependiente del tiempo) · 17 Otra dimensión (dimensión extra, compactificación) · 19 Acción periódica (pulsos que cumplen las desigualdades cuánticas) · 24 Intermediario (campo mediador con energía positiva que reestructura la geometría) · 28 Sustituir lo mecánico (campos en vez de materia) · 35 Cambio de parámetros (otra teoría de gravedad en régimen extremo) · 40 Materiales compuestos (combinación de fuentes con signos distintos).

## 5. Disolver o mover

Para cada propuesta: ¿el coste (energía negativa, ADM, horizonte) **sale del sistema** o solo **se mueve** a otra región o fase? Si se mueve, cuantifícalo con `lab_*` y dilo. Si no hay forma estructural de disolverlo, es **ley**: pasa a `auditoria-teoremas` para ver qué hipótesis habría que romper.
