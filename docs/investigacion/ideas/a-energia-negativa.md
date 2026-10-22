# Frente A · Energía negativa (obstáculos 1 y 3)

Sprint de investigación de unos 35 minutos. Herramientas: solo el MCP `curvatura` (`buscar`, `leer_seccion`, `lab_*`). Unidades SI salvo que se diga. Constantes usadas en el laboratorio: $\hbar c = 3{,}16152677\times10^{-26}$ J·m, $G = 6{,}6743\times10^{-11}$, $c = 299\,792\,458$ m/s, $\ell_P = 1{,}616255\times10^{-35}$ m, $c^2/G = 1{,}3466\times10^{27}$ kg/m.

Todo lo marcado **[especulación]** no está respaldado por un cálculo ni por una cita.

## Resumen

| # | Idea | Separación TRIZ | Cifra clave (laboratorio) | Veredicto |
|---|---|---|---|---|
| A1 | Pared de vacío con fronteras (Casimir apilado): esquiva la QEI de Ford-Roman, que no aplica con fronteras | Por condición | Una pila de placas nunca viola la NEC promediada si $a \ge 10^{-10}$ m y la placa pesa $\ge 10^{-6}$ kg/m² (demostrado con Z3). Velocidad máxima sostenible con Casimir a 1 nm y $\sigma = 1$ m⁻¹: $v \approx 4\times10^{-17}\,c$ | **Descartada** como fuente. Ley: el coste se traslada a las placas |
| A2 | Torsión de espín (Einstein-Cartan): la pared cumple WEC/NEC con espín polarizado | Por condición (otra teoría) | Densidad de espín pedida $3{,}5\times10^{68}\,\hbar$/m³ frente a $8{,}1\times10^{43}\,\hbar$/m³ de materia nuclear totalmente polarizada: faltan $4{,}3\times10^{24}$ | **Viva** (teórica). El coste se mueve, no se disuelve |
| A3 | Burbuja microscópica (separación por escala) y prueba de la QEI en laboratorio | Por escala | Con la pared de la QEI, $M \approx (c^2/G)\,v R^2/(3600\,\ell_P)$. Para 1 t a $v = 1$ hace falta $R \approx 2\times10^{-27}$ m | **Descartada** para transporte. **Viva** como banco de pruebas de la QEI |

## Contradicción de partida

- **Obstáculo 1.** Toda burbuja de la clase de Natário viola la NEC; no depende del observador [santiago-2022].
- **Obstáculo 3.** La energía negativa cuántica existe, pero la QEI la limita: cuanto más intensa, más breve y más fina. La pared queda en $\Delta \lesssim 10^2 v\,\ell_P$ y la energía total se dispara [pfenning-ford-1997].
- **Contradicción técnica:** queremos una pared **gruesa** (energía total baja) y **muy negativa** (para curvar), pero la QEI impone pared **fina** si es negativa.

## Lluvia de ideas (iteración 0)

Generadas con separación TRIZ, inversión y analogía. Las tres elegidas van en negrita.

1. **Vacío con fronteras (Casimir): la QEI de espacio libre no aplica.** (condición)
2. **Otra teoría: espín y torsión dan un término extra que cancela la violación.** (condición)
3. **Burbuja diminuta: la energía baja con $R^2$.** (escala)
4. Campos de Horndeski o galileones que violan la NEC de forma clásica y estable (sin QEI). Los «no-go» de estabilidad cosmológica están vivos; existen violaciones sanas en la versión teleparalela [ahmedov-2023]. Sin cálculo aquí.
5. Dimensiones extra: ajustar el radio compacto para cambiar la constante cosmológica local [obousy-2007]. Sin cálculo de la energía en este sprint.
6. Pulsos alternos (separación en el tiempo): la energía negativa paga «interés cuántico» con un pulso positivo mayor [abreu-2008, borde-2001b]. Una burbuja a velocidad constante necesita la pared negativa siempre: no encaja.
7. Inversión: «la pared no necesita energía negativa, sino tensiones». Cerrado: la NEC ya mezcla densidad y presión y se viola igual [santiago-2022].
8. Luz comprimida como fuente: tiene densidad negativa, pero está sujeta a la QEI sin fronteras. Útil como experimento (va en A3).

---

## A1 · Pared de vacío con fronteras (Casimir apilado)

### Mecanismo

Las QEI con fronteras son **de diferencia**: comparan con el vacío de referencia de las propias fronteras. Kontou señala que esas desigualdades no sirven para descartar espacios exóticos cuando la materia exótica sale del vacío con fronteras [kontou-2015b]. Por tanto, la cota $\Delta \lesssim 10^2 v\,\ell_P$ no obliga a una pared de Casimir. Idea: llenar la pared con una pila de cavidades de Casimir. La pared puede ser gruesa.

### Literatura

- A favor: [kontou-2015b] Eleni-Alexandra Kontou (2015). Averaged null energy condition and quantum inequalities in curved spacetime. arXiv:1507.06299. https://arxiv.org/abs/1507.06299
- A favor (contexto): la energía negativa estática del vacío vive en regiones estrechas, como una cavidad de Casimir [maclay-2018]. G. Jordan Maclay, Eric W. Davis (2018). Testing a Quantum Inequality with a Meta-analysis of Data from Squeezed Light. Foundations of Physics 49, 797. https://arxiv.org/abs/1806.01269
- En contra: la energía total del sistema (placas más vacío) se cree siempre positiva [maclay-2018, misma sección].
- Escala: `docs/obstaculos.md` §9 (Casimir a 10 nm, unos $-4\times10^4$ J/m³).

### Cálculos

**C1. NEC en la dirección normal a las placas.** Con $\rho_C = -\pi^2\hbar c/(720a^4)$ y $p_z = -\pi^2\hbar c/(240a^4)$:

```
lab_igual(a="-pi^2/720 - pi^2/240", b="-pi^2/180")  →  demostrada
```

Así que $\rho + p_z = -\pi^2\hbar c/(180\,a^4)$. Hay violación de la NEC dentro de la cavidad.

**C2. Déficit de NEC por unidad de área de una cavidad,** $\pi^2\hbar c/(180\,a^3)$:

```
lab_evaluar("pi^2*H/(180*x^3)", H=3.16152677e-26, x=[1e-6,1e-7,1e-8,1e-9])
→ [1,73e-9, 1,73e-6, 1,73e-3, 1,73] J/m²
```

**C3. Placa que lo compensa.** La placa aporta $\sigma_m c^2$ por unidad de área ($\sigma_m$ = masa por área). La pila viola la NEC promediada solo si $\sigma_m c^2 < \pi^2\hbar c/(180a^3)$. Separación crítica $a^* = (\pi^2\hbar c / 180\,\sigma_m c^2)^{1/3}$:

```
lab_evaluar("(pi^2*H/(180*m*c^2))^(1/3)", m=[1e-9,1e-6,1e-3,1])
→ a* = [2,7e-12, 2,7e-13, 2,7e-14, 2,7e-15] m
```

Prueba exacta de que no hay violación promediada en el rango físico:

```
lab_z3(objetivo="m*89875517873681764*x^3 > 17336/10^31",
       hipotesis=["m >= 1/10^6", "x >= 1/10^10"])  →  demostrada
```

(El 17336e-31 redondea hacia arriba $\pi^2\hbar c/180 = 1{,}7335\times10^{-27}$ J·m, así que la cota es conservadora.) Con placas de al menos $10^{-6}$ kg/m² y huecos de al menos 1 Å, el balance $\rho+p_z$ promediado sobre la celda es positivo.

**C4. Aunque se aceptara una NEC solo local, la magnitud no llega.** Velocidad que sostiene una pared de Alcubierre con $|\rho| = |\rho_C(a)|$ y $\sigma = 1$ m⁻¹, usando $|\rho_E| \approx v^2\sigma^2 c^4/(128\pi G)$ (obstáculo 9):

```
lab_unidades("sqrt(128*pi*G*rho/(c^4*s^2))")  →  adimensional (ok)
lab_evaluar("sqrt(128*pi*G*pi^2*H/(720*x^4)/(c^4*s^2))", s=1, x=[1e-8,1e-9])
→ v/c = [3,8e-19, 3,8e-17]
```

### Registro de iteraciones

1. **Impedimento:** la pared necesita violar la NEC a escala de la geometría (metros). La métrica solo ve el $T_{\mu\nu}$ promediado sobre escalas mucho mayores que $a$. **Intento de disolverlo:** hacer las placas más ligeras. **Resultado:** C3. Hace falta $a^* \sim 10^{-12}$–$10^{-15}$ m, por debajo del átomo. Ahí la placa deja de ser un conductor y la fórmula de Casimir no vale. **Se declara ley (local):** una pila de Casimir con materia ordinaria no viola la NEC promediada. El coste se **traslada** a las placas; no se disuelve.
2. **Impedimento:** aunque se acepte una pared «granular», C4 da $v \sim 10^{-17}c$, es decir, unos pocos nm/s. **Intento:** bajar $\sigma$ (pared más gruesa). $v_{\max} \propto 1/\sigma$, así que con $\sigma = 10^{-3}$ m⁻¹ se gana un factor $10^3$ (cálculo propio por escalado). Sigue sin servir. **Ley práctica.**
3. **Impedimento:** sin fronteras (luz comprimida, sin placas) se vuelve a la QEI de Ford-Roman. **Intento:** el metaanálisis de [maclay-2018] dice que los datos de luz comprimida violan una QI propuesta. **Crítica:** lo medido es ruido de cuadratura en homodina, no la densidad de energía renormalizada; los propios autores dan explicaciones alternativas. No basta para reabrir la vía. Pasa a A3 como experimento.

### Veredicto

**Descartada** como fuente de la pared. Queda un resultado útil para `obstaculos.md` §9: la desigualdad C3, demostrada.

### Siguiente paso

Añadir a `library/equations/` la condición $\sigma_m c^2 \ge \pi^2\hbar c/(180a^3)$ y su prueba Z3. Repetirla con la corrección de conductividad finita (placas reales), que solo reduce $|\rho_C|$.

---

## A2 · Torsión de espín (Einstein-Cartan)

### Mecanismo

En Einstein-Cartan el espín es fuente de torsión. En las ecuaciones aparece un término en $s^2$. DeBenedictis e Ilijic prueban un lema: ese término puede hacerse tan positivo como haga falta para que la WEC (y la NEC) se cumplan en toda la burbuja de Alcubierre y de Van Den Broeck [debenedictis-2018]. La nave queda en vacío, sin torsión, y sigue geodésicas.

### Literatura

- A favor: [debenedictis-2018] Andrew DeBenedictis, Sasa Ilijic (2018). Energy condition respecting warp drives: The role of spin in Einstein-Cartan theory. Class. Quantum Grav. 35 215001. https://arxiv.org/abs/1807.09745
- Matiz: los propios autores admiten que las densidades de espín son «rather large» y difíciles de imaginar (conclusiones).
- En contra: incluso en gravedad modificada la burbuja viola la condición de convergencia nula, que es geométrica [santiago-2022]. Jessica Santiago, Sebastian Schuster, Matt Visser (2022). Generic warp drives violate the null energy condition. PRD 105, 064038. https://arxiv.org/abs/2105.03079
- Dato de referencia: densidad de saturación nuclear $\rho_0 \approx 2{,}7\times10^{14}$ g/cm³ [albino-2025]. Milena Albino et al. (2025). A Bayesian Inference of Hybrid Stars with Large Quark Cores. https://arxiv.org/abs/2511.02653

### Cálculos

Números del paper (Alcubierre, $v_s = 1{,}2$, $\sigma = 5$): $\kappa^2 s^2 \approx 5$ m⁻², densidad de espín $\mathcal{L} \approx 3{,}5\times10^{68}\,\hbar$/m³, densidad de energía $3{,}64\times10^{43}$ J/m³ [debenedictis-2018].

Materia nuclear con todos los espines alineados ($\hbar/2$ por neutrón, $m_n = 1{,}6749275\times10^{-27}$ kg):

```
lab_evaluar("r/(2*m)", r=2.7e17, m=1.6749275e-27)   →  8,06e43 ħ/m³
lab_evaluar("L/(r/(2*m))", L=3.5e68, ...)            →  4,34e24
```

Faltan unos **24 órdenes** frente a la materia más densa conocida, y totalmente polarizada (suposición muy optimista).

### Registro de iteraciones

1. **Impedimento (teorema):** [santiago-2022] dice que la NCC se viola en gravedad modificada. **Intento:** en Einstein-Cartan la métrica es la de Alcubierre, así que el tensor de Einstein riemanniano sí viola la NCC. Lo que cambia es la fuente: la parte en $s^2$ actúa como una energía efectiva que reequilibra. **Lectura honesta:** la violación geométrica sigue; lo que se gana es que la **materia** cumpla la NEC. El coste se **mueve** al sector de espín. No contradice el teorema.
2. **Impedimento (escala):** C de arriba, $4\times10^{24}$ por encima de la materia nuclear polarizada. **Intento:** Van Den Broeck reduce el volumen de la pared; los autores dicen que el espín total podría bajar aunque la densidad suba. **Estado:** no hay cifra del espín total en el paper. Pendiente.
3. **Impedimento (física de partículas):** fuentes de espín alto son resonancias inestables; un campo de fotones acoplado a torsión rompe la invariancia gauge U(1) [debenedictis-2018]. **[especulación]** Un condensado de fermiones con espín alineado (estado tipo ferromagnético nuclear) es la única fuente estable concebible; su estabilidad frente a la interacción espín-espín de contacto no está estudiada aquí.

### Veredicto

**Viva** como resultado teórico: es una de las pocas vías publicadas en que la materia cumple WEC/NEC dentro de la burbuja. **No prometedora** como ingeniería: 24 órdenes.

### Siguiente paso

Calcular el **espín total** $\int s\,d^3x$ para Alcubierre y Van Den Broeck con `lab_tensor` (el lema da $\kappa^2 s^2$ en función de $G_{\mu\nu}$) y compararlo con el momento angular de una estrella de neutrones. Comprobar también si el término en $s^2$, visto como energía efectiva, cumple alguna QEI.

---

## A3 · Burbuja microscópica y prueba de la QEI

### Mecanismo

La energía total de Alcubierre en pared delgada es $E \approx v^2R^2\sigma/36$ con $\sigma\sim1/\Delta$ (obstáculo 3). Si la QEI fija $\Delta$, basta reducir $R$. Pfenning y Ford ya lo apuntan: una burbuja del tamaño de la longitud de onda Compton del electrón pide unas $400\,M_\odot$ [pfenning-ford-1997].

### Literatura

- A favor: [pfenning-ford-1997] Michael J. Pfenning, L. H. Ford (1997). The unphysical nature of 'warp drive'. CQG 14, 1743. https://arxiv.org/abs/gr-qc/9702026
- A favor: [krasnikov-2002] S. Krasnikov (2002). The quantum inequalities do not forbid spacetime shortcuts. PRD 67, 104013. https://arxiv.org/abs/gr-qc/0207057
- En contra: [fewster-2004c] C. J. Fewster (2004). Comments on "Counter example to the quantum inequality". https://arxiv.org/abs/gr-qc/0409043 — la QEI plana aproxima bien la curva para muestreos cortos frente a las escalas geométricas.
- Experimento: [maclay-2018] (arriba).

### Cálculos

**D1. De dónde sale $\Delta \propto v\,\ell_P$.** En la pared, $|\rho| \sim v^2/\Delta^2$ (unidades geométricas) y el radio de curvatura es $\sim\Delta/v$. Si el tiempo de muestreo es una fracción $q$ de ese radio, $\tau_0 = q\Delta/v$, la QEI da $v^2/\Delta^2 \lesssim K\ell^2 v^4/(q^4\Delta^4)$, con $K$ numérico. La saturación es $\Delta = \sqrt{K}\,\ell\,v/q^2$:

```
lab_igual(a="v^2/(sqrt(K)*l*v/q^2)^2 - K*l^2*v^4/(q^4*(sqrt(K)*l*v/q^2)^4)", b="0")
→ demostrada
```

Así se reproduce la forma $\Delta \lesssim 10^2 v\,\ell_P$ de [pfenning-ford-1997] con $q$ del orden de 0,1. (Es un argumento de escala, no la deducción del paper.)

**D2. Masa de la burbuja con la pared de la QEI.** Con $\Delta = 100\,v\,\ell_P$: $M = (c^2/G)\,v R^2/(3600\,\ell_P)$.

```
lab_evaluar("C*v*R^2/(3600*P)", C=1.3466e27, P=1.616255e-35, v=1,
            R=[100, 1, 1e-6, 3.8616e-13, 1e-15])
→ M = [2,3e62, 2,3e58, 2,3e46, 3,5e33, 2,3e28] kg
```

- $R = 100$ m da $2{,}3\times10^{62}$ kg, igual que `obstaculos.md` §3 (control).
- $R$ = longitud Compton reducida del electrón: $3{,}5\times10^{33}$ kg, unas $1{,}7\times10^3\,M_\odot$ (cálculo propio, con $M_\odot \approx 2\times10^{30}$ kg). Del orden de las 400 $M_\odot$ de [pfenning-ford-1997]; la diferencia es el factor numérico de la pared.

**D3. Radio para una masa de laboratorio** ($M = 1000$ kg):

```
lab_evaluar("sqrt(3600*P*M/(C*v))", M=1000, v=[1, 0.01])
→ R = [2,1e-28, 2,1e-27] m
```

Es decir $R \approx 2\times10^{-28}$ m a $v = 1$ y $2\times10^{-27}$ m a $v = 0{,}01$: unos $10^7$–$10^8\,\ell_P$. Ojo: a menor $v$ hace falta **mayor** $R$ para la misma masa porque la pared se adelgaza con $v$.

### Registro de iteraciones

1. **Impedimento:** D2. Ninguna burbuja por encima de $10^{-27}$ m baja de una tonelada. **Intento:** Krasnikov argumenta que la QEI no siempre implica densidades de Planck [krasnikov-2002]. **Respuesta:** Fewster muestra que la QEI plana es buena aproximación a escalas cortas [fewster-2004c], y `obstaculos.md` ya anota que el argumento no cambia el orden para burbujas macroscópicas. **Ley** para transporte.
2. **Impedimento:** subluminal no ayuda: $\Delta \propto v$ adelgaza la pared y $M \propto v$ solo baja linealmente (D2, D3). **Intento:** Van Den Broeck (bolsillo interior grande, superficie pequeña) [vandenbroeck-1999] reduce a pocas masas solares. Sigue lejos. Además el mínimo exacto de Natário crece como $R^4/\Delta^3$ [bolivar-2026]: con la pared de la QEI empeora. **Ley.**
3. **Reformulación útil:** si la QEI es la que fija la pared, medirla vale más que optimizar la geometría. **Intento:** el metaanálisis con luz comprimida a −15 dB encuentra datos incompatibles con una QI propuesta [maclay-2018]. **Crítica:** el test usa una QI concreta (de Marecki), con funciones de muestreo elegidas y una lectura indirecta de la densidad de energía. **Estado:** abierto y barato de rehacer.

### Veredicto

**Descartada** como transporte (ley de escala D2). **Viva** como banco de pruebas: la QEI es la pieza que fija el coste de todo el frente, y es medible con óptica cuántica.

### Siguiente paso

Rehacer el análisis de [maclay-2018] con la QEI rigurosa para el campo electromagnético (Fewster) y la función de respuesta real del detector homodino. Pregunta concreta: ¿con −15 dB y el ancho de banda del OPA, el cociente medido/cota cruza 1 o no?

---

## Para soluciones.md

- **Ley nueva (A1):** una pila de cavidades de Casimir con placas de al menos $10^{-6}$ kg/m² y huecos de al menos 1 Å nunca viola la NEC promediada (prueba Z3). El vacío con fronteras esquiva la QEI pero no la NEC macroscópica: el coste va a las placas.
- **Mejor vía viva (A2):** Einstein-Cartan con espín polarizado cumple WEC/NEC en la materia de la burbuja [debenedictis-2018]. Falta un factor $4\times10^{24}$ frente a materia nuclear polarizada. Siguiente: espín total para Van Den Broeck.
- **Experimento (A3):** contrastar la QEI electromagnética con luz comprimida a −15 dB [maclay-2018]; es la cota que fija $M \approx (c^2/G)\,vR^2/(3600\,\ell_P)$ en todo el frente.
