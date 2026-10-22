# Frente D · Horizontes y vacío

Obstáculos 4 (horizontes y control causal), 5 (inestabilidad semiclásica) y 10 (partículas y frenado) de `docs/obstaculos.md`. Sprint de unos 35 minutos. Todas las cifras salen del laboratorio de Curvatura (`lab_*`) o de un paper citado. Lo especulativo va marcado con **[especulativo]**.

## Resumen

| Idea | Mecanismo | Obstáculos | Número clave | Veredicto |
|---|---|---|---|---|
| A · Ley del horizonte + raíl previo (Krasnikov) | Un horizonte es inevitable si la nave va a $v>1$ por un exterior plano. Solo se evita cambiando el exterior antes (tubo). | 4 (y 5, 10 a cambio) | $h=v(1-f)-\alpha$: en el centro $h\in[-101{,}4;\,-0{,}0047]<0$; lejos $h\in[0{,}0100;\,99{,}0]>0$ (Arb) | **Ley** para la nave sola. Con tubo el coste **se mueve** a infraestructura, energía negativa y cronología. |
| B · Burbuja que respira (pulsos sub/supraluminales) | Fases supraluminales más cortas que $1/\kappa$ y fases subluminales que vacían la pared. Sin horizonte de sucesos global. | 5, 10, parte de 4 | $\kappa=2\sigma(1-1/v)$ (demostrada). Con $v=10$, $u=0{,}9$, $G=10$: velocidad media $\bar v=1{,}93\,c$, sin depender del grosor de pared | **Prometedora y abierta.** Acota el desplazamiento al azul por pulso. Falta el $\langle T_{\mu\nu}\rangle_{\rm ren}$ periódico. |
| C · Crucero subluminal con escudo deflector | $v<1$: no hay horizontes ni crecimiento exponencial. Escudo de Sanches para el polvo. | 4, 5, 10 | Doppler de proa $\sqrt{(1+\beta)/(1-\beta)}$: 1,11 · 1,73 · 4,36 · 14,1 para $\beta$ = 0,1 · 0,5 · 0,9 · 0,99 | **Disuelve** 4 y 5, pero renuncia a ir más rápido que la luz. Base segura del programa. |

## Contradicciones de partida

1. **Control frente a desconexión causal.** Queremos guiar la pared desde dentro. Pero si $v_s>1$, el borde delantero queda fuera del cono de luz del centro [everett-roman-1997, alcubierre-2021].
2. **Régimen supraluminal frente a estabilidad del vacío.** El horizonte blanco delantero hace crecer $\langle T_{\mu\nu}\rangle_{\rm ren}$ de forma exponencial, en un tiempo $\sim 1/\kappa$ [finazzi-2009].
3. **Llegar frente a no arrasar el destino.** Las partículas atrapadas delante ganan energía de forma exponencial mientras están dentro. Al frenar salen en un haz hacia el destino [mcmonigal-2012, pieri-2023].

## Iteración 1 · Lluvia de ideas

Separación en espacio, en tiempo y por condición (lógica TRIZ):

- Tubo de Krasnikov o raíl tendido antes, a velocidad subluminal (separación en espacio-tiempo: la infraestructura está en el pasado causal).
- Quedarse subluminal (separación por condición).
- Perfil de desplazamiento sin horizonte, jugando con el lapso $\alpha$ o la métrica espacial.
- Pared dependiente del tiempo que nunca forma un horizonte de sucesos: pulsos (separación en tiempo).
- Escudo deflector que aparta las partículas antes de entrar en la pared.
- Purga controlada: soltar las partículas poco a poco en vez de un estallido final.
- Lecciones de gravedad análoga: dispersión modificada que estabiliza horizontes blancos.

Elegidas, por ser distintas entre sí: **A** (cambiar el exterior), **B** (cambiar el tiempo) y **C** (cambiar el régimen). La dispersión modificada se descarta pronto: en warp supraluminal con dispersión superlumínica el flujo detectado sigue creciendo de forma lineal en el tiempo [finazzi-2012]. La purga controlada se integra en B.

---

## Idea A · Ley del horizonte y raíl previo

### Mecanismo

En coordenadas comóviles, sobre el eje, los rayos cumplen $d\xi/dt=\pm\alpha-v(1-f)$ (con métrica espacial plana; con $\gamma_{xx}\neq1$ se cambia $\alpha$ por $\alpha/\sqrt{\gamma_{xx}}$). Hay horizonte donde $h(\xi)=v(1-f)-\alpha=0$, la condición $|\beta|=\alpha$.

Si el exterior es plano ($\alpha\to1$, $f\to0$) y la nave va a $v>1$, entonces $h\to v-1>0$ lejos. En el centro $f=1$ y $h=-\alpha<0$. Por continuidad, $h$ se anula en algún punto. **Ningún perfil de lapso o de desplazamiento evita el horizonte** mientras el exterior sea plano y estacionario en el sistema de la nave.

La única salida es cambiar el exterior: tender antes un raíl donde los conos ya estén abiertos. Es el tubo de Krasnikov [everett-roman-1997].

### Literatura

- A favor de la ley: Fell y Heisenberg sugieren que se forman horizontes al pasar del régimen subluminal al supraluminal, e impiden la transición [fell-heisenberg-2021]. Lentz reconoce los horizontes como desafío pendiente [lentz-2021b].
- A favor del raíl: el tubo de Krasnikov no tiene el problema de control. Toda la modificación ocurre en el futuro causal del punto de salida [everett-roman-1997].
- En contra del raíl: el viaje de ida no se acorta. Dos tubos forman una máquina del tiempo. El tubo exige capas de energía negativa de pocos miles de longitudes de Planck y energías negativas totales enormes [everett-roman-1997]. La densidad $T_{tt}$ del tubo viola la WEC en un rango de $\rho$ [lobo-2002].
- Energía generada a lo largo de un tubo, separando el control de la nave: [pieri-2023].

### Cálculos

| Comprobación | Herramienta y entrada | Resultado |
|---|---|---|
| $h$ en el centro, perfil tanh de Alcubierre y lapso arbitrario $\alpha=1+A\,(1-\tanh\sigma(r-R))/2$ | `lab_cota`, $h=v(1-(1-\tanh\sigma(r-R))/2)-(1+A(1-\tanh\sigma(r-R))/2)$, $r=0$, $v\in[1{,}01;100]$, $\sigma\in[0{,}5;10]$, $R\in[1;10]$, $A\in[0;100]$ | intervalo garantizado $[-101{,}43;\,-0{,}0047]$: siempre negativo |
| $h$ lejos, mismo dominio, $r=1000$ | `lab_cota` | intervalo $[0{,}0100;\,99{,}0]$: siempre positivo |

Conclusión: incluso con un lapso hasta 101 veces mayor dentro de la pared, $h$ cambia de signo. El horizonte existe. El argumento general es el teorema del valor intermedio; el cálculo solo lo ilustra en una familia.

### Impedimentos y arreglos

- **It. 2.** ¿Y si $\alpha$ crece sin límite en la pared? No sirve: $h$ depende de los extremos, no del interior.
- **It. 2.** ¿Y si $\gamma_{xx}$ varía? Cambia $\alpha$ por $\alpha/\sqrt{\gamma_{xx}}$; los extremos son los mismos. No sirve.
- **It. 3.** Cambiar el extremo exterior: hay que preparar el espacio por delante. Eso es el tubo. El coste pasa a la ida subluminal, a la energía negativa del tubo y a la cronología (dos tubos dan curvas temporales cerradas, y la protección de la cronología vuelve a traer divergencias en el horizonte de Cauchy [liberati-2016]).

### Veredicto

**Ley:** una burbuja aislada a $v>1$ sobre un exterior plano siempre tiene horizonte. El control desde dentro es imposible. El tubo **mueve** el coste, no lo disuelve. Sirve para rutas fijas y repetidas (un «metro»), no para exploración.

### Siguiente paso

Mapa de horizontes $h=0$ en `solvers/rust/src/geodesic.rs` para Alcubierre, Natário, Lentz y la cáscara de [fuchs-2024], con lapso y métrica espacial generales.

---

## Idea B · Burbuja que respira

### Mecanismo **[especulativo]**

La burbuja alterna fases supraluminales de duración $\tau_s$ y fases subluminales de duración $\tau_b$.

- En la fase supraluminal hay un horizonte blanco **temporal**. El desplazamiento al azul crece como $e^{\kappa t}$. Se corta en $\tau_s=\ln G/\kappa$, con $G$ el factor máximo tolerado.
- En la fase subluminal ($v=u<1$) desaparece el horizonte. Las partículas atrapadas salen de la pared con un factor acotado por $G$. La tripulación recupera el contacto causal con la pared y puede corregir el rumbo: **ventana de control**.
- No hay horizonte de sucesos global: solo regiones atrapadas transitorias.

Así la purga es continua y controlada. No hay un único haz al llegar.

### Literatura

- A favor: Barceló y colaboradores probaron trayectorias con fases subluminales periódicas. No eliminan del todo el punto de desplazamiento al azul infinito, pero dispersan mucho las geodésicas cercanas y reducen la acumulación [barcelo-2022].
- A favor: la escala de crecimiento es $1/\kappa_2$ y la inestabilidad aparece poco después de formarse el horizonte blanco [finazzi-2009]. Si no se deja pasar ese tiempo, no se llega al régimen divergente.
- A favor: la energía de las partículas atrapadas crece de forma exponencial con el tiempo que pasan dentro, y se liberan al bajar de $c$ [mcmonigal-2012]. Acotar el tiempo acota la energía.
- En contra: hay que crear el horizonte muy rápido para no acumular polarización del vacío al formarlo [finazzi-2009]. Aquí se forma millones de veces.
- En contra: dos horizontes (negro detrás, blanco delante) forman una cavidad. En análogos, con dispersión superlumínica, esto da el «láser de agujero negro», una inestabilidad que se amplifica [finazzi-2012, barcelo-2011].

### Cálculos

| Magnitud | Herramienta y entrada | Resultado |
|---|---|---|
| Gravedad superficial delantera con $f\approx(1-\tanh\sigma(r-R))/2$ | `lab_igual`: $v(\sigma/2)(1-(2/v-1)^2)$ frente a $2\sigma(1-1/v)$ | **demostrada**: $\kappa=2\sigma(1-1/v)$ (unidades $c=1$) |
| Dimensiones de $\hbar c\kappa$ | `lab_unidades` | energía ($L^2MT^{-2}$), correcto |
| $T_H=\hbar c\kappa/(2\pi k_B)$, $v=2$, $\sigma=1/\Delta$ | `lab_evaluar`, $\Delta$ = 1 m · 100 m · $3\times10^8$ m | $3{,}6\times10^{-4}$ K · $3{,}6\times10^{-6}$ K · $1{,}2\times10^{-12}$ K |
| Ídem con pared de Planck | $\Delta=1{,}6\times10^{-33}$ m (≈100 $L_P$) | $2{,}3\times10^{29}$ K |
| Tiempo de crecimiento $1/\kappa=\Delta/(2c(1-1/v))$, $v=2$ | `lab_evaluar` | 1 m → $3{,}3\times10^{-9}$ s; $3\times10^8$ m → 1,0 s; $10^9$ m → 3,3 s |
| Exponente sin pulsos, viaje de 4,24 años luz a $v=2$: $\kappa T$ | `lab_evaluar` | $\Delta$=1 m → $2{,}0\times10^{16}$; 100 m → $2{,}0\times10^{14}$; $3\times10^8$ m → $6{,}7\times10^{7}$ |
| Velocidad media $\bar v=\dfrac{v\,\ln G/(2(1-1/v))+u/(1-u)}{\ln G/(2(1-1/v))+1/(1-u)}$, con $\tau_b=\Delta/(c(1-u))$ | `lab_evaluar`, $u=0{,}5$, $G=10$, $v$ = 1,5 · 2 · 5 · 10 · 100 | 1,13 · 1,30 · 2,38 · 4,21 · 37,1 |
| Ídem $u=0{,}9$; $v=2$ con $G$ = e · 10 · 100 | `lab_evaluar` | 1,00 · 1,11 · 1,25 |
| Ídem $u=0{,}9$; $v=10$ con $G$ = e · 10 · 100 | `lab_evaluar` | 1,38 · 1,93 · 2,75 |
| Duración de ciclo $\tau_s+\tau_b$, $v=10$, $u=0{,}9$, $G=10$ | `lab_evaluar` | $\Delta$=100 m → $3{,}76\times10^{-6}$ s ($\tau_s=4{,}3\times10^{-7}$ s); $\Delta=3\times10^8$ m → 11,3 s ($\tau_s$=1,28 s) |
| Viaje de 4,24 años luz a $\bar v=1{,}93$ | `lab_evaluar` | 2,19 años |
| Número de ciclos en ese viaje | `lab_evaluar` | $\Delta$=100 m → $1{,}8\times10^{13}$; $\Delta=3\times10^8$ m → $6{,}1\times10^{6}$ |

Lecturas:

- Las cifras de $T_H$ y de $1/\kappa$ cuadran en orden de magnitud con [finazzi-2009]: pared de 1 m → unos 0,003 K con su perfil; $\tau\sim1$ s exige una pared de $3\times10^8$ m.
- Sin pulsos, el factor $e^{\kappa T}$ tiene exponentes de $10^{7}$ a $10^{16}$. Es la forma cuantitativa del obstáculo 5 y del 10.
- Con pulsos, **la velocidad media no depende del grosor de pared**: $\tau_s$ y $\tau_b$ escalan los dos con $\Delta$. Con $v=10$, $u=0{,}9$ y $G=10$ sale $\bar v=1{,}93\,c$.
- El modelo de $\tau_b$ (luz que cruza la pared a velocidad $\ge c(1-u)$) es una cota para fotones. Para partículas masivas lentas es más largo. **[especulativo]**

### Impedimentos y arreglos (registro de iteraciones)

- **It. 1.** Objeción: el punto de desplazamiento al azul infinito no se elimina con pulsos [barcelo-2022]. Arreglo: ese resultado es asintótico, para burbujas eternas. En un viaje finito solo cuenta la acumulación a tiempo finito, que sí se reduce.
- **It. 2.** Objeción: cada formación del horizonte deja un transitorio de polarización del vacío [finazzi-2009]. Con $10^{13}$ ciclos se suma. Arreglo propuesto: paredes gruesas ($\Delta\sim3\times10^8$ m) bajan a $6\times10^6$ ciclos y alargan cada fase a segundos. Pero paredes gruesas chocan con las desigualdades cuánticas (obstáculo 3): **coste movido**, no disuelto.
- **It. 2.** Objeción: frenar de $10c$ a $0{,}9c$ en $\sim10^{-6}$ s millones de veces exige intercambiar momento con algo (obstáculo 2). La tripulación va en caída libre, pero la fuente de la burbuja no. Sin arreglo aún.
- **It. 3.** Objeción: láser de agujero negro en la cavidad entre horizontes [finazzi-2012]. Arreglo: el láser necesita tiempo para crecer; en el experimento del Technion la duración fue demasiado corta para verlo [finazzi-2012]. Pulsos cortos podrían cortar también ese crecimiento. **[especulativo]**
- **It. 3.** Control: en cada fase subluminal no hay horizonte, así que la tripulación puede reprogramar el siguiente pulso. El control pasa de continuo a **discreto**. Disuelve en parte el obstáculo 4.
- **It. 3.** Partículas: cada liberación tiene un factor acotado por $G$ y se reparte a lo largo de toda la ruta. El destino no recibe un haz acumulado. Disuelve el obstáculo 10 en su forma de «estallido final»; queda el flujo distribuido.

### Veredicto

**Prometedora y abierta.** Es la única de las tres que mantiene una velocidad media superior a $c$ y ataca 4, 5 y 10 a la vez. Pero apoya su promesa en algo no calculado: que $\langle T_{\mu\nu}\rangle_{\rm ren}$ quede acotado con una $v(t)$ periódica. Mueve coste al obstáculo 2 (aceleraciones repetidas) y, si se usan paredes gruesas, al 3.

### Siguiente paso

Cálculo en 1+1 dimensiones, con la anomalía de traza, del $\langle T_{\mu\nu}\rangle_{\rm ren}$ para $v(t)$ periódica entre $u=0{,}9$ y $v=10$. Método: trazar rayos nulos para obtener la función $p(u)$ y aplicar la fórmula de [finazzi-2009]. Pregunta: ¿el máximo por ciclo queda acotado y no crece de ciclo a ciclo? Va en `physics/`.

---

## Idea C · Crucero subluminal con escudo deflector

### Mecanismo

Con $v<1$ no hay puntos con $h=0$ (el exterior da $h\to v-1<0$). No hay horizontes, ni flujo de Hawking, ni crecimiento en el horizonte blanco. Las partículas no quedan atrapadas: cruzan la burbuja. Un término extra de desplazamiento aparta el polvo [sanches-2026].

### Literatura

- A favor: en régimen subluminal «no se forman horizontes, no se crea radiación de Hawking» y desaparece la inestabilidad del horizonte blanco [finazzi-2009]. Hay modelos subluminales de energía positiva [fuchs-2024, bobrick-martire-2021].
- A favor: la burbuja ya protege del polvo, y un «escudo deflector» aparta partículas sin acelerarlas en exceso [sanches-2026].
- En contra: el escudo de Sanches es de clase Natário y viola todas las condiciones de energía [sanches-2026]. La presión del polvo y los fotones crece con $v_s$; las fuerzas de distorsión, como $v_s^2$ y $v_s^4$ [bian-2022].
- En contra: en la región P⁻ (partículas que la burbuja subluminal alcanza), el desplazamiento al azul crece sin límite cuando $v\to1$ [mcmonigal-2012]. Hay que mantener margen.

### Cálculos

| Magnitud | Herramienta y entrada | Resultado |
|---|---|---|
| Doppler de proa $\sqrt{(1+\beta)/(1-\beta)}$ | `lab_evaluar`, $\beta$ = 0,1 · 0,5 · 0,9 · 0,99 | 1,11 · 1,73 · 4,36 · 14,1 |
| Signo de $h$ lejos con $v<1$ | límite $h\to v-1$ | negativo: no hay horizonte |

### Impedimentos y arreglos

- **It. 1.** Renuncia al viaje más rápido que la luz. No tiene arreglo: es la condición de la idea.
- **It. 2.** El desplazamiento al azul P⁻ diverge cerca de $v=1$ [mcmonigal-2012]. Arreglo: techo operativo, por ejemplo $\beta\le0{,}9$, con factor de proa 4,36.
- **It. 3.** El escudo cuesta energía exótica [sanches-2026]. Arreglo: buscar un deflector de energía positiva con dos componentes del desplazamiento, como pide [fell-heisenberg-2021]. **[especulativo]**

### Veredicto

**Disuelve** los obstáculos 4 y 5, y reduce el 10 a un problema de blindaje acotado. El precio es explícito: no hay superluminalidad. Es la base segura sobre la que probar B (B empieza y acaba en este régimen).

### Siguiente paso

Calcular el $\langle T_{\mu\nu}\rangle_{\rm ren}$ en 1+1 de la cáscara de [fuchs-2024] a $\beta=0{,}9$, como pide `docs/obstaculos.md` §5, y comprobar que es pequeño.

---

## Para soluciones.md

- **Ley (obstáculo 4):** una burbuja aislada a $v>1$ sobre un exterior plano siempre tiene un horizonte $v(1-f)=\alpha$, para cualquier lapso (comprobado con Arb en una familia con $A\le100$). Solo un raíl previo tipo Krasnikov lo evita, y eso **mueve** el coste a infraestructura, energía negativa y cronología.
- **Vía abierta (obstáculos 5 y 10):** la «burbuja que respira» acota el desplazamiento al azul por pulso a $G=e^{\kappa\tau_s}$, con $\kappa=2\sigma(1-1/v)$ demostrada. Con $v=10$, $u=0{,}9$ y $G=10$ da una velocidad media de 1,93 $c$, independiente del grosor de pared. Falta el $\langle T_{\mu\nu}\rangle_{\rm ren}$ periódico en 1+1.
- **Base segura:** el crucero subluminal disuelve 4 y 5; con $\beta\le0{,}9$ el Doppler de proa es como mucho 4,36.
