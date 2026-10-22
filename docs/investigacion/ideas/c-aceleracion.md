# Frente C · Aceleración (obstáculos 2 y 12)

Sprint de unos 35 minutos. Herramientas: MCP `curvatura` (`buscar`, `leer_seccion`, `referencias`, `aplicar_tecnica`) y el laboratorio (`lab_igual`, `lab_cota`, `lab_evaluar`, `lab_unidades`). Cada cifra sale de una ejecución del laboratorio o de un paper citado. Lo especulativo va marcado con **[especulación]**.

Caso de referencia: la cáscara de [fuchs-2024], con $R_1 = 10$ m, $R_2 = 20$ m, $M = 4{,}49\times10^{27}$ kg (2,365 masas de Júpiter) y $\beta_{\rm warp} = 0{,}02$ sin violar condiciones de energía.

## Resumen

| # | Idea | ¿Disuelve o mueve el coste? | Cifra clave (lab) | Veredicto |
|---|---|---|---|---|
| 1 | Cohete de radiación: fotones u ondas gravitacionales (OG) asimétricas | Mueve el coste a masa radiada | Fotones: $0{,}0198\,M = 8{,}89\times10^{25}$ kg para $v=0{,}02$. OG con eficiencia direccional $\eta=0{,}005$: $3{,}96\,M$, imposible | Fotones: posible pero caro. OG: **descartada** |
| 2 | Invertir quién se mueve: la burbuja nace ya en movimiento (se ensambla con materia lanzada desde fuera) o se empuja contra infraestructura | Disuelve el problema de RG (no hay métrica acelerada). Mueve el coste a propulsión convencional | Energía cinética $8{,}07\times10^{40}$ J ($2{,}0\times10^{-4}\,Mc^2$) frente a $7{,}99\times10^{42}$ J del cohete de fotones: 99 veces menos | **Prometedora**, la mejor |
| 3 | Caer en gradientes ajenos: asistencia gravitatoria en una binaria compacta | Disuelve el coste de propelente. El momento lo absorbe la binaria | Para $\Delta v = 0{,}02c$, binaria de dos estrellas de neutrones de 1,4 $M_\odot$ con $a = 1{,}03\times10^{7}$ m; se fusiona en $4{,}19\times10^{7}$ s; marea de 54 m/s² en 20 m a $r = a/2$ | **Viva**, muy limitada por el entorno |
| — | Autoaceleración por redistribución interna o por gradientes propios | No | Teorema del centro de masas | **Ley**: imposible sin flujo en el infinito |

## La contradicción (común a las tres iteraciones)

- Un sistema aislado y asintóticamente plano conserva su cuadrimomento ADM salvo flujo en el infinito [fuchs-2024, bobrick-martire-2021, lobo-visser-2004]. Para pasar de $v=0$ a $v$, $P_{\rm ADM}$ debe cambiar en $\gamma M v$.
- Si se impone a la vez $E_{\rm ADM}=0$ y $P_{\rm ADM}\neq0$ (modelos R-Warp), el cuadrimomento es espacial. El teorema de energía positiva exige entonces que se viole la DEC; con DEC, el espacio-tiempo es Minkowski [barzegar-2026]. Por tanto, una burbuja física que gana momento necesita $E_{\rm ADM} \ge |P_{\rm ADM}|$ y masa positiva. Eso descarta las burbujas de masa nula como punto de partida.
- Mover el centro de la cáscara entre cortes sin más («Schwarzschild drive») exige energía negativa en todo el espacio [schuster-2022; fuchs-2024, sección *Acceleration*].
- Formulación TRIZ: queremos que $P$ cambie (para viajar) y que no cambie (sistema cerrado). Separación posible: en el **espacio** (otro cuerpo cambia su $P$), en el **tiempo** (el cambio ocurre antes de que exista la burbuja) o en el **sistema** (escape sin masa en reposo).

Técnica aplicada: inversión de supuestos (`aplicar_tecnica("inversion")`). Supuestos invertidos:
1. «La burbuja tiene que acelerar» → la burbuja nunca acelera; nace moviéndose. **Vivo** (idea 2).
2. «El momento sale de la burbuja» → sale de un tercer cuerpo. **Vivo** (ideas 2 y 3).
3. «El escape es materia» → el escape es radiación o OG. **Vivo pero caro** (idea 1).
4. «La burbuja es aislada» → la burbuja cae en un campo externo. **Vivo** (idea 3).
5. «Hay que conservar el momento» → no se conserva. **Muerto**: es teorema con flujo nulo en el infinito.
6. «La redistribución interna mueve el todo» → **Muerto**: centro de masas fijo.

Ideas sueltas antes de elegir: recoil por OG asimétricas; cohete de fotones; vela láser; catapulta o empuje contra un planeta; ensamblar la cáscara con corrientes de materia ya lanzadas; asistencia gravitatoria; «nadar» en el espacio-tiempo curvo con cambios cíclicos de forma; par de masa positiva y negativa de Bondi; redistribuir la densidad de energía de delante a detrás [fell-heisenberg-2021]; tubos de energía negativa externa [pieri-2023]; transferir el momento a los pasajeros y no a la cáscara. Elegidas: 1, 2 y 3, por ser las más distintas (escape propio, infraestructura, campo ajeno).

---

## Idea 1 · Cohete de radiación (fotones u OG)

### Mecanismo

La cáscara convierte parte de su masa en radiación sin masa emitida hacia atrás. El momento ADM perdido sale por el infinito como flujo. Variante OG: la cáscara oscila de forma asimétrica y emite OG con momento neto. [fuchs-2024] sugiere explícitamente «la emisión focalizada de radiación gravitacional» como alternativa, citando el recoil de una fusión de agujeros negros (Varma et al. 2022, PRL 128, 191102; cita secundaria, el paper no está en la biblioteca).

### Literatura

- A favor: [fuchs-2024] plantea la vía del cohete y la de OG focalizadas, y admite que «no se ha construido en detalle más allá de cohetes de fotones simples». Cita: Jared Fuchs, Christopher Helmerich, Alexey Bobrick et al. (2024). Constant velocity physical warp drive solution. Classical and Quantum Gravity 41, 095013. https://arxiv.org/abs/2405.02709
- A favor (método): la evolución 3+1 de [clough-2024] mide flujos de materia y de OG al infinito. Es la herramienta para contabilizar $\Delta P$. Cita: Katy Clough, Tim Dietrich, Sebastian Khan (2024). What no one has seen before: gravitational waveforms from warp drive collapse. The Open Journal of Astrophysics 7. https://arxiv.org/abs/2406.02466
- En contra: en [clough-2024] el flujo de OG es «mucho menor» que el de materia. Las OG son un canal pobre.
- En contra: la revisión de [millis-2011] clasifica el «cohete de ondas gravitacionales» como «conversión de empuje no viable». Cita: Marc G. Millis (2011). Progress in revolutionary propulsion physics. arXiv:1101.1063. https://arxiv.org/abs/1101.1063
- En contra (coste): [fuchs-2024] avisa de que cancelar la aceleración dentro exige más materia y, por tanto, más expulsión.

### Cálculos

| Paso | Entrada al lab | Resultado |
|---|---|---|
| Ecuación del cohete de fotones. De energía y momento: $M_f/M_i = \sqrt{1-v^2}/(1+v)$. Igualdad con $\sqrt{(1-v)/(1+v)}$ | `lab_igual` de los cuadrados: `(1-v^2)/(1+v)^2` = `(1-v)/(1+v)` | **demostrada** (sympy). Ambos lados son positivos en $(-1,1)$, así que la igualdad vale también para las raíces. |
| Masa radiada $M[1-\sqrt{(1-v)/(1+v)}]$, $M = 4{,}49\times10^{27}$ kg | `lab_evaluar`, $v$ = 0,001, 0,01, 0,02, 0,04, 0,1 | $4{,}49\times10^{24}$; $4{,}47\times10^{25}$; $8{,}89\times10^{25}$; $1{,}76\times10^{26}$; $4{,}29\times10^{26}$ kg |
| Energía radiada $f\,Mc^2$ | `lab_evaluar`, $v$ = 0,02 y 0,04 | $7{,}99\times10^{42}$ J y $1{,}58\times10^{43}$ J |
| Energía cinética $(\gamma-1)Mc^2$ | `lab_evaluar`, $v$ = 0,02 y 0,04 | $8{,}07\times10^{40}$ J y $3{,}23\times10^{41}$ J |
| Cociente radiada / cinética | `lab_evaluar` | 1999 ($v$=0,001); 199 (0,01); **99** (0,02); 49 (0,04); 18,9 (0,1); 2,73 (0,5). Es $\approx 2/v$. |
| Signo: el cohete de fotones gasta más que la energía cinética | `lab_cota`, signo > 0, $v\in[10^{-4}, 0{,}5]$ | **demostrada** en todo el dominio (13 cajas). Falla por encima: contraejemplo en $v = 0{,}866$. |
| Tiempo hasta $v=0{,}02$ con aceleración $a$ | `lab_evaluar` `v*c/a` | 1 g: $6{,}11\times10^{5}$ s (≈7 días); 10 g: $6{,}11\times10^{4}$ s; 100 g: $6{,}11\times10^{3}$ s |
| Potencia del chorro $Mac$ | `lab_unidades`: dimensión $L^2MT^{-3}$ (potencia). `lab_evaluar` | 1 g: $1{,}32\times10^{37}$ W; 100 g: $1{,}32\times10^{39}$ W |
| Límite de potencia $c^5/G$ | `lab_evaluar` | $3{,}63\times10^{52}$ W. No limita. |

**Variante OG [especulación, estimación de orden de magnitud].** Escala cuadrupolar $L \sim (G/c^5)(MR^2\omega^3)^2$ (`lab_unidades`: potencia, correcto). Para radiar $1{,}32\times10^{37}$ W con $M$ y $R = 20$ m, la velocidad interna es $\omega R/c = 0{,}0049$; para $1{,}32\times10^{39}$ W, $0{,}0105$ (`lab_evaluar`). El momento neto de las OG nace de la interferencia entre multipolos. Supongo una eficiencia direccional $\eta \sim \omega R/c$ (suposición mía, no sale de un paper de la biblioteca). La masa radiada necesaria es $f/\eta$ (`lab_evaluar`, $v=0{,}02$): $\eta=1$ → $0{,}0198\,M$; $\eta=0{,}1$ → $0{,}198\,M$; $\eta=0{,}02$ → $0{,}990\,M$; $\eta=0{,}005$ → **$3{,}96\,M$**. Con movimientos internos lentos hace falta más masa de la que hay.

### Registro de iteraciones

1. *Iteración 1.* Impedimento: la masa radiada es $\approx v\,M$, unas 99 veces la energía cinética a $v=0{,}02$. Arreglo intentado: OG en vez de fotones. Resultado: peor. Las OG no tienen más momento por unidad de energía que los fotones ($p = E/c$ en ambos), y además pierden el factor $\eta$.
2. *Iteración 2.* Impedimento: con $\eta \lesssim v$ se radia toda la masa. Arreglo intentado: movimientos internos relativistas ($\eta \to 1$). Coste: la cáscara debería tener flujos internos casi a $c$ con masa del orden de $M$. Eso choca con la regla de que el flujo de momento euleriano sea menor que la densidad de energía [fuchs-2024, sección *The Problem of Physicality*]. Sin cerrar.
3. *Iteración 3.* Impedimento: no hay métrica de una cáscara warp que expulse radiación. Arreglo: pegar la cáscara de [fuchs-2024] a un exterior de cohete de fotones (tipo Kinnersley, al que [fuchs-2024] remite como «simple photon rockets») con condiciones de unión. Pendiente (siguiente paso).

### Veredicto

Mueve el coste; no lo disuelve. El de fotones es físico y caro: $8{,}89\times10^{25}$ kg de masa radiada para $v=0{,}02$. El de OG queda **descartado**: es siempre peor que el de fotones y, con movimientos internos no relativistas, inviable.

### Siguiente cálculo

Exterior de cohete de fotones (polvo nulo con flujo anisótropo) unido a la cáscara de [fuchs-2024] en $R_2$. Condiciones de Israel. Comprobar la NEC en la cáscara cuando $dv/dt \neq 0$. En `solvers/cpp`, como primera aproximación axisimétrica.

---

## Idea 2 · Invertir quién se mueve: la burbuja nace en movimiento

### Mecanismo

La métrica de velocidad constante de [fuchs-2024] ya es física. Entonces no se acelera la burbuja. Se acelera la **materia antes de ser burbuja**: corrientes de masa lanzadas desde una infraestructura convergen y forman la cáscara ya con velocidad $v$. O bien la cáscara se empuja contra un cuerpo masivo (planeta, estación) que absorbe $-\Delta P$. Al llegar, otra infraestructura frena las piezas. **[especulación]** sobre la ingeniería; la física de conservación es estándar.

Separación TRIZ **en el tiempo**: el cambio de momento ocurre cuando todavía no hay geometría warp que proteger.

### Literatura

- A favor: la solución de velocidad constante con energía positiva existe [fuchs-2024]. Toda burbuja es una cáscara que se mueve por inercia y necesita propulsión [bobrick-martire-2021, citado en `docs/obstaculos.md`]. Esta idea acepta ese resultado en vez de pelear con él.
- A favor (precedente de fuente externa): [pieri-2023] propone acelerar y frenar con energía generada **fuera**, a lo largo de un tubo. Cita: Lorenzo Pieri (2023). Hyperwave: Hyper-Fast Communication within General Relativity. arXiv:2311.12069. https://arxiv.org/abs/2311.12069. Diferencia: allí la energía es negativa; aquí basta materia ordinaria.
- A favor (idea de redistribución): [fell-heisenberg-2021] propone redistribuir la energía de la cáscara (más detrás, menos delante) «sin crear ni destruir energía». Cita: Shaun D. B. Fell, Lavinia Heisenberg (2021). Positive energy warp drive from hidden geometric structures. Classical and Quantum Gravity 38, 155020. https://arxiv.org/abs/2104.06488. Ojo: eso cambia la burbuja, pero no $P_{\rm ADM}$ (ver «Ley»).
- En contra: [millis-2011] recuerda que las velas pasivas violan la conservación y que el «campo de gradiente inducido» «requiere conexión con un medio de reacción». Aquí el medio de reacción es explícito (la infraestructura), así que no se viola nada; pero se pierde la autonomía.

### Cálculos

| Paso | Entrada al lab | Resultado |
|---|---|---|
| Energía mínima (cinética) a $v=0{,}02$ y $0{,}04$ | `lab_evaluar` $(\gamma-1)Mc^2$ | $8{,}07\times10^{40}$ J y $3{,}23\times10^{41}$ J ($2{,}0\times10^{-4}$ y $8{,}0\times10^{-4}\,Mc^2$) |
| Vela con haz reflejado (espejo perfecto, sin Doppler): $E = \gamma Mvc/2$, en unidades de $Mc^2$ | `lab_evaluar` `g*v/2` | $0{,}0100\,Mc^2$ ($v=0{,}02$) y $0{,}0200\,Mc^2$ ($v=0{,}04$). Solo la mitad que el cohete de fotones (0,0198). |
| Ventaja de empujar contra materia frente al cohete de fotones | cociente de la idea 1 | **99 veces menos energía** a $v=0{,}02$ |
| Retroceso de la cáscara si el momento se da solo a la carga útil dentro ($m = 10^6$ kg, supuesto) | `lab_evaluar` `m*v*c/M` | $1{,}34\times10^{-15}$ m/s. La cáscara apenas se mueve, pero la carga sale de ella: no sirve. |

### Registro de iteraciones

1. *Iteración 1.* Idea inicial: empujar la cáscara ya formada contra un planeta. Impedimento: hay que aplicar una fuerza enorme a 2,4 masas de Júpiter, y las tensiones en la cáscara pueden romper su equilibrio TOV. Arreglo: no empujar la cáscara, sino ensamblarla en movimiento.
2. *Iteración 2.* Impedimento: el ensamblaje de una cáscara con compacidad $2GM/(Rc^2)$ de 0,333 en $R=20$ m y 0,667 en $R=10$ m (`lab_evaluar`) es en sí un problema dinámico abierto (obstáculo 12). Arreglo: no hay; el problema se traslada a la formación, que de todos modos hay que resolver también para la burbuja en reposo. Coste movido, no creado.
3. *Iteración 3.* Impedimento: frenar. Hace falta infraestructura en el destino o repetir el truco al revés (desensamblar en piezas y frenarlas por separado). Arreglo parcial: combinar con la idea 3 (asistencia gravitatoria) para frenar.

### Veredicto

**Prometedora. Disuelve el obstáculo de relatividad general**: no hace falta ninguna métrica acelerada, solo la de velocidad constante, que ya cumple las condiciones de energía [fuchs-2024]. **Mueve el coste** a propulsión convencional y a infraestructura. El coste energético es el mínimo posible, $8{,}07\times10^{40}$ J a $v=0{,}02$. Límite honesto: a $v=0{,}02$ la burbuja de [fuchs-2024] no ofrece todavía ventaja de viaje frente a una nave sin burbuja. La idea solo merece la pena si la burbuja aporta algo dentro (amortiguar fuerzas, o una métrica de mayor $\beta$).

### Siguiente cálculo

Relatividad numérica esférica (1+1) de una cáscara que colapsa desde polvo en caída hasta el equilibrio TOV de [fuchs-2024]. Después, un impulso de Lorentz de los datos iniciales para que el colapso ocurra en movimiento. Medir si se llega a la cáscara estática sin horizonte y cuánta energía se radia. Es el paso «Evolución en 1+1 con simetría esférica» que ya pide el obstáculo 12.

---

## Idea 3 · Caer en gradientes ajenos: asistencia gravitatoria

### Mecanismo

La burbuja, con masa ADM positiva, sigue una geodésica en el campo de un sistema externo que se mueve. En un paso cercano por una binaria, intercambia momento con ella: $\Delta v \le 2U$, con $U$ la velocidad del cuerpo. No hay escape. Los pasajeros caen libres con la cáscara y solo sienten la marea. El momento perdido lo absorbe la binaria, y la energía sale de su órbita. Separación TRIZ **en el espacio**.

Variante «nadar»: un cuerpo que cambia de forma cíclicamente en un campo **no homogéneo** puede ganar una fuerza sin expulsar masa; en campo homogéneo o sin campo, no [anon-2022]. Cita: Семиколенов Андрей Владимирович (2022). The case of a repulsive force in an inhomogeneous gravitational field without shedding momentum. Research Square. https://doi.org/10.21203/rs.3.rs-1093271/v1 (preprint sin revisión; prueba débil).

### Literatura

- A favor: [anon-2022] afirma que sin campo «las fuerzas internas no pueden cambiar el momento de un sistema cerrado», y que hace falta un campo no homogéneo. Coincide con la ley de abajo: el momento siempre viene de fuera.
- A favor: [schuster-2022] discute una burbuja que «maniobra alrededor» de un agujero negro de Schwarzschild como caso C (burbuja en un fondo con masa propia). Cita: Sebastian Schuster, Jessica Santiago, Matt Visser (2022). ADM mass in warp drive spacetimes. arXiv:2205.15950. https://arxiv.org/abs/2205.15950
- En contra: [schuster-2022] avisa de que separar masas en situaciones no estáticas tiene «problemas sutiles». Y la masa positiva no puede apantallar la marea: el interior de la cáscara deja de ser plano en un campo externo.

### Cálculos

| Paso | Entrada al lab | Resultado |
|---|---|---|
| Separación de una binaria de dos estrellas de neutrones de 1,4 $M_\odot$ ($m_{\rm tot}=5{,}569\times10^{30}$ kg) con velocidad relativa $w$: $a = Gm_{\rm tot}/w^2$ | `lab_evaluar`, $w = 3\times10^6$ y $6\times10^6$ m/s | $4{,}13\times10^{7}$ m y $1{,}03\times10^{7}$ m |
| Para $\Delta v = 0{,}02c$ hace falta $U = 0{,}01c$ por estrella, o sea $w = 0{,}02c \approx 6\times10^6$ m/s | — | $a \approx 1{,}03\times10^{7}$ m |
| Vida de esa binaria por emisión de OG (fórmula de Peters, $T = \tfrac{5}{256}c^5a^4/[G^3 m_1 m_2 (m_1+m_2)]$) | `lab_evaluar` | $4{,}19\times10^{7}$ s (≈1,3 años) para $a=1{,}03\times10^{7}$ m; $1{,}07\times10^{10}$ s para $a=4{,}13\times10^{7}$ m |
| Marea sobre 20 m, $2Gm\ell/r^3$, a $r = a/2$ y $r = a$ | `lab_evaluar` | 54,0 m/s² y 6,76 m/s² |
| Gravedad local $Gm/r^2$ (no se siente en caída libre) | `lab_evaluar` | $6{,}97\times10^{6}$ y $1{,}74\times10^{6}$ m/s² |
| Masa de la burbuja frente a la binaria | $4{,}49\times10^{27} / 5{,}569\times10^{30}$ | $8\times10^{-4}$: la binaria apenas nota el intercambio |

### Registro de iteraciones

1. *Iteración 1.* Impedimento: con cuerpos lentos (planetas) el $\Delta v$ es pequeño. Arreglo: usar un sistema compacto y rápido. Resultado: binaria de estrellas de neutrones con $a\approx1{,}03\times10^{7}$ m.
2. *Iteración 2.* Impedimento: esa binaria vive unos $4{,}19\times10^{7}$ s antes de fusionarse, y hace falta una en la salida y otra en la llegada. Arreglo: aceptar varios pasos más lentos (binarias más anchas, $\Delta v$ menor por paso). Mueve el coste a tiempo de viaje y a disponibilidad. Sin cerrar.
3. *Iteración 3.* Impedimento: marea de 54 m/s² sobre 20 m a $r=a/2$, unas 5,5 g. Además rompe la hipótesis de interior plano de [fuchs-2024] y tensa la cáscara. Arreglo: paso más lejano ($r=a$: 6,76 m/s²) a cambio de menos $\Delta v$. Falta calcular la respuesta de la cáscara a la marea.

### Veredicto

**Viva.** Disuelve el coste de propelente de forma legítima: el momento lo cede un tercer cuerpo. No viola nada. Está muy limitada por el entorno (pocas binarias compactas) y por las mareas. Útil sobre todo para **frenar** en el destino, que es el punto débil de la idea 2.

### Siguiente cálculo

Respuesta de la cáscara de [fuchs-2024] a un campo de marea cuadrupolar externo: perturbaciones estáticas $\ell=2$ (número de Love de la cáscara) y comprobación de la NEC y de la presión con la marea de 6,76 m/s² en 20 m. Es un cálculo perturbativo 1D, barato.

---

## Ley (lo que no se puede disolver)

En un espacio-tiempo asintóticamente plano sin flujo de energía ni de momento en el infinito, $P_{\rm ADM}$ es constante. Con energía positiva, el centro de masas se mueve en línea recta a velocidad constante. Consecuencias:

- Redistribuir la energía dentro de la cáscara [fell-heisenberg-2021] cambia la geometría interior, pero no $P_{\rm ADM}$. Todo lo que avanza hacia delante se compensa con algo que va hacia atrás. El desplazamiento neto queda acotado por el tamaño del sistema.
- Dar momento solo a la carga útil desde dentro hace retroceder la cáscara $1{,}34\times10^{-15}$ m/s (para $m=10^6$ kg), pero la carga sale de la cáscara. Tampoco sirve.
- Un cuadrimomento con $E_{\rm ADM}=0$ y $P_{\rm ADM}\neq0$ solo es posible violando la DEC [barzegar-2026]. Cita: Hamed Barzegar, Thomas Buchert, Quentin Vigneron (2026). General formalism, classification, and demystification of the current warp-drive spacetimes. arXiv:2602.16495. https://arxiv.org/abs/2602.16495
- Toda aceleración necesita flujo en el infinito (idea 1) o un tercer cuerpo (ideas 2 y 3). No hay cuarta vía en relatividad general con energía positiva. Esto es una ley, no un obstáculo técnico.

Obstáculo 12: ninguna de las tres ideas se puede cerrar sin evolución. La única evolución 3+1 de la biblioteca es el colapso de [clough-2024]. El orden de cálculo propuesto, de más barato a más caro: (a) marea sobre la cáscara (perturbativo); (b) colapso 1+1 hasta la cáscara de [fuchs-2024]; (c) cáscara con exterior de cohete de fotones (axisimétrico).

## Para soluciones.md

- **No acelerar la burbuja: ensamblarla ya en movimiento.** La métrica de velocidad constante de [fuchs-2024] basta. El coste mínimo es la energía cinética, $8{,}07\times10^{40}$ J a $v=0{,}02$, 99 veces menos que un cohete de fotones (lab). Disuelve el problema de RG y mueve el coste a infraestructura.
- **El cohete de ondas gravitacionales queda descartado**: nunca gana al de fotones y, con eficiencia direccional $\eta \sim \omega R/c \approx 0{,}005$, pediría radiar $3{,}96\,M$ (estimación de orden de magnitud).
- **Ley**: con energía positiva y sin flujo en el infinito, $P_{\rm ADM}$ no cambia. Toda aceleración necesita escape o un tercer cuerpo (infraestructura o asistencia gravitatoria, útil para frenar).
