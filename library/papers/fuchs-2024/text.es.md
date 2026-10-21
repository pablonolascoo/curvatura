# Solución física de motor de curvatura a velocidad constante

**Jared Fuchs**$^{\dagger\,1,2}$, **Christopher Helmerich**$^{1,2}$, **Alexey Bobrick**$^{2,3}$, **Luke Sellers**$^{2,4}$, **Brandon Melcher**$^{2}$ y **Gianni Martire**$^{2}$

> Fuente original: https://arxiv.org/abs/2405.02709
> Revista: Classical and Quantum Gravity 41, 095013 (2024)
> Licencia: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). © Los autores.
> Traducción: proyecto Curvatura. Texto original en inglés.

$^{1}$ The University of Alabama in Huntsville, 301 Sparkman Drive, Huntsville, Alabama, 35899, EE. UU.
$^{2}$ Advanced Propulsion Laboratory at Applied Physics, 477 Madison Avenue, Nueva York, 10022, EE. UU.
$^{3}$ Technion - Israel Institute of Technology, Departamento de Física, Haifa 32000, Israel
$^{4}$ UCLA Department of Physics & Astronomy, 475 Portola Plaza, Los Ángeles, CA 90095, EE. UU.

Correo electrónico: $^\dagger$ jef0011@uah.edu y jared@appliedphysics.org

Agosto de 2023

## Resumen

Los motores de curvatura son soluciones exóticas de la relatividad general que ofrecen medios de transporte novedosos. En este estudio presentamos una solución de motor de curvatura subluminal a velocidad constante que satisface todas las condiciones de energía. La solución consiste en combinar una cáscara de materia estable con una distribución del vector de desplazamiento que reproduce fielmente soluciones de motor de curvatura bien conocidas, como la métrica de Alcubierre. Generamos numéricamente la métrica del espaciotiempo, evaluamos las condiciones de energía y confirmamos que la distribución del vector de desplazamiento no puede reducirse a una transformación de coordenadas. Este estudio demuestra que los espaciotiempos clásicos de motor de curvatura pueden hacerse compatibles con las condiciones de energía añadiendo una cáscara de materia ordinaria con masa ADM positiva.

## 1. Introducción

Los espaciotiempos de motor de curvatura, introducidos por primera vez por Alcubierre [1] y posteriormente por otros autores [19, 14], ofrecen varias propiedades de transporte singulares para observadores de tipo tiempo. Entre ellas figuran la posibilidad de acelerar mediante movimiento geodésico, de desplazarse superlumínicamente o de encontrarse en regiones de espaciotiempo modificado, todo ello respecto a observadores externos de tipo tiempo en movimiento inercial. Todos estos espaciotiempos clásicos de motor de curvatura violan algunas, si no todas, las condiciones de energía [10, 15] y, por ello, su construcción se ha considerado en general inviable. Sin embargo, trabajos recientes [13, 4, 9] han sugerido que podrían construirse «motores de curvatura físicos» que satisfagan algunas o todas las condiciones de energía, lo que ha reavivado el interés por el tema.

Debido a la complejidad de las ecuaciones de Einstein, el avance hacia soluciones físicas de motor de curvatura por medios puramente analíticos ha sido lento. En particular, dos factores que aumentan considerablemente la complejidad de estas ecuaciones son las funciones de lapso no unitarias y las métricas espaciales no planas; ambos han estado ausentes de la mayoría de las soluciones de motor de curvatura anteriores y de ambos se ha argumentado que son necesarios para satisfacer las condiciones de energía [4]. Para afrontar este reto se desarrolló el conjunto de herramientas computacionales *Warp Factory* [11], que proporciona métodos numéricos para explorar de forma más exhaustiva los espaciotiempos de motor de curvatura. Aprovechando la nueva flexibilidad que ofrece *Warp Factory*, presentamos aquí una nueva solución de motor de curvatura subluminal a velocidad constante, con lapso no unitario y métrica espacial no plana, que satisface todas las condiciones de energía.

### 1.1. Características clave de un espaciotiempo de motor de curvatura

En [11] puede encontrarse una discusión detallada de las propiedades de los espaciotiempos de motor de curvatura; aquí resumimos sus características clave para mayor claridad. Los espaciotiempos de motor de curvatura pueden verse como modificaciones de un espaciotiempo de fondo globalmente hiperbólico y asintóticamente plano, que contiene una trayectoria en general no geodésica $\mathcal{C}_{\rm background}$ que une dos puntos arbitrarios A y B. Un espaciotiempo de motor de curvatura modifica este espaciotiempo de fondo de modo que se cumple lo siguiente:

1. *Transporte geodésico:* La trayectoria en general no geodésica $\mathcal{C}_{\rm background}$ del espaciotiempo de fondo se transforma en una trayectoria geodésica $\mathcal{C}_{\rm background} \rightarrow \mathcal{C}_{\rm warp}$ en el nuevo espaciotiempo de motor de curvatura. En otras palabras, los espaciotiempos de motor de curvatura permiten a los pasajeros viajar entre los puntos A y B a lo largo de una trayectoria geodésica $\mathcal{C}_{\rm warp}$. Esto significa que los pasajeros dentro del motor de curvatura no experimentan aceleración local mientras son transportados[^1]. Para que la solución no sea trivial, la trayectoria original $\mathcal{C}_{\rm background}$ no debe ser una geodésica, es decir, los pasajeros no deben estar «ya yendo» del punto A al punto B. Un ejemplo de solución no trivial es un pasajero en un espaciotiempo de fondo estático que se encuentra inicialmente en reposo en el punto A (respecto al sistema de reposo local), es transportado al punto B y queda después, de nuevo, en reposo respecto al punto B. Además, la modificación de curvatura debe afectar mínimamente a las distancias propias entre A y B medidas a lo largo del camino, tal como se definen originalmente en el espaciotiempo de fondo.

2. *Región de pasajeros vacía:* El espaciotiempo de motor de curvatura tiene una región de pasajeros compacta y de vacío ($T^{\mu\nu} = 0$)[^2], libre de fuerzas de marea, que encierra la trayectoria de los pasajeros $\mathcal{C}_{\rm warp}$.

3. *Una burbuja espacialmente acotada y comóvil:* El espaciotiempo de motor de curvatura tiene una región compacta no vacía ($T^{\mu\nu} \neq 0$) que encierra la trayectoria de los pasajeros $\mathcal{C}_{\rm warp}$ en cada hipersuperficie de tipo espacio. Esto significa que la distribución de energía-momento necesaria para el transporte geodésico no se extiende hasta el infinito[^3] y se desplaza junto con los observadores transportados. El requisito de moverse con los pasajeros distingue las soluciones de motor de curvatura de, por ejemplo, los tubos de Krasnikov [8].

### 1.2. Diseño de espaciotiempos de motor de curvatura

El elemento de transporte de los motores de curvatura consiste en diseñar curvas de tipo tiempo para que los pasajeros viajen entre los puntos A y B del espaciotiempo. En este artículo desarrollaremos una solución de curvatura siguiendo estos pasos:

1. Partir de un fondo de Minkowski.
2. Definir dos puntos A y B en el espaciotiempo.
3. Definir las condiciones inicial y final de los pasajeros que viajarán entre A y B. Por ejemplo, los pasajeros podrían comenzar en reposo en el punto A y terminar en reposo en el punto B. Tales condiciones iniciales pueden definirse respecto a un observador exterior situado en un espacio de Minkowski.
4. Definir una curva entre los puntos A y B a lo largo de la cual viajarán el motor de curvatura y los pasajeros.
5. Construir una solución métrica que desplace a los pasajeros, dentro de las condiciones de contorno de (iii), a lo largo de geodésicas ajustadas a la curva de (iv). Existen múltiples métricas posibles que permiten estas geodésicas concretas, pero basta con una.

En general, hay muchas maneras de conseguirlo. En el formalismo 3+1, la métrica viene dada por:

$$
ds^2 = -\alpha^2 dt^2 + \gamma_{ij} (dx^i + \beta^i dt)(dx^j + \beta^j dt), \tag{1}
$$

donde $\alpha$ es la función lapso, $\beta^i$ es el vector de desplazamiento y $\gamma_{ij}$ es la métrica espacial. Podemos considerar las ecuaciones geodésicas generales en el formalismo 3+1, parametrizadas por el tiempo coordenado [3], como:

$$
\begin{aligned}
&\frac{d x^i}{d t}=\gamma^{i j} \frac{u_j}{u^0}-\beta^i \\
&\frac{d u_i}{d t}=-\alpha u^0 \partial_i \alpha+u_k \partial_i \beta^k-\frac{u_j u_k}{2 u^0} \partial_i \gamma^{j k} \\
&u^0=\left(\gamma^{j k} u_j u_k+\epsilon\right)^{1 / 2} / \alpha
\end{aligned}
\tag{2}
$$

donde $u^\mu = dx^\mu/d\tau$ y $\epsilon =$ 1 o 0 para geodésicas de tipo tiempo o nulas. Las magnitudes $dx^i/dt$ y $du_i/dt$ dependen de las coordenadas, pero en un espaciotiempo y un sistema de coordenadas completamente definidos adquieren un significado concreto. Para ilustrarlo, consideremos la métrica de Alcubierre [1], dada por:

$$
ds^2 = -d t^2+\left(d x-v_s f\left(r_s\right) d t\right)^2+d y^2+d z^2 \tag{3}
$$

donde $r_s= \sqrt{(x-x_s(t))^2 + y^2 + z^2}$. $x_s(t)$ y $v_s(t)$ son, respectivamente, la posición del centro y la velocidad del motor de curvatura, y $f(r_s)$ es una función de forma que define la extensión de la burbuja de curvatura desde el centro. La solución de Alcubierre consiste en añadir un vector de desplazamiento a un espaciotiempo que, por lo demás, es de Minkowski. Así, es evidente que todas las características propias de un motor de curvatura en este espaciotiempo proceden exclusivamente del vector de desplazamiento. Podemos entenderlo desde otra perspectiva, utilizando los pasos y las ecuaciones geodésicas (2) anteriores. Dentro de la región del volumen de pasajeros (definida como $r_s < R$) se impone que el espaciotiempo sea plano, lo que significa que $\partial_i g_{\mu\nu} = 0$ y, por tanto, $du_i/dt = 0$. El movimiento geodésico de los pasajeros en el sistema de coordenadas dentro de esa región es:

$$
\frac{dx^i}{dt} = v_s = \delta^{ij}\frac{u_j}{u^0} - \beta^i \tag{4}
$$

Como se ve en la ecuación anterior, el transporte geodésico de los pasajeros depende de sus $u_i$ al principio y al final del transporte. La solución de Alcubierre admite aceleración mediante una $v_s(t)$ variable en el tiempo. Si consideramos la condición inicial en la que los observadores están inicialmente en reposo ($u^i = u_i = 0$) en algún punto e imaginamos que se forma una burbuja de curvatura alrededor de los pasajeros con las mismas restricciones ($du_i/dt = 0$ para $r_s < R$), entonces $u_i(t) = 0$ en todo instante $t$ y el transporte de los pasajeros dentro de la burbuja en este escenario viene dado por:

$$
\frac{dx^i}{dt} = v_s(t) = -\beta^i(t) \tag{5}
$$

En este contexto, podemos considerar que la solución de motor de curvatura de Alcubierre es capaz de transportar observadores inicialmente en reposo respecto a un observador externo estacionario hasta una velocidad relativa $v_s$, todo ello mediante un vector de desplazamiento localizado en el espaciotiempo con una región interior plana. Este ejemplo de viaje por curvatura se ilustra en la figura 1.

![Figura 1. Ejemplo de trayectoria de curvatura de Alcubierre con tres fases de vuelo: (i) El pasajero entra en la burbuja de curvatura en reposo respecto al observador de referencia en el punto A. El pasajero no tendrá velocidad coordenada alguna respecto al observador de referencia (dx^i/dt = u_i = 0). (ii) La burbuja de curvatura inicia su viaje acelerando hasta una velocidad constante. El pasajero del interior es transportado geodésicamente hasta la velocidad coordenada del motor de curvatura, pero sigue teniendo velocidad nula medida en su tiempo propio (dx^i/dt = v_warp). (iii) La burbuja de curvatura decelera hasta detenerse en el punto B, en reposo respecto al observador de referencia, y el pasajero sale del motor.](figures/warp_example_v3a.png)

**Figura 1.** Ejemplo de trayectoria de curvatura de Alcubierre con tres fases de vuelo:
*(i)* El pasajero entra en la burbuja de curvatura en reposo respecto al observador de referencia en el punto A. El pasajero no tendrá velocidad coordenada alguna respecto al observador de referencia ($dx^i/dt = u_i = 0$)
*(ii)* La burbuja de curvatura inicia su viaje acelerando hasta una velocidad constante. El pasajero del interior es transportado geodésicamente hasta la velocidad coordenada del motor de curvatura, pero sigue teniendo velocidad nula medida en su tiempo propio ($dx^i/dt = v_{warp}$).
*(iii)* La burbuja de curvatura decelera hasta detenerse en el punto B, en reposo respecto al observador de referencia, y el pasajero sale del motor.

En este artículo nos centraremos en analizar la fase de velocidad constante del vuelo por curvatura. Este enfoque en la velocidad constante plantea algunas dificultades, ya que, sin aceleración, las condiciones de contorno de los pasajeros que entran en el motor resultan menos interesantes en el caso comóvil simple. Por ejemplo, si el motor de curvatura se mueve siempre a velocidad constante y sus pasajeros han existido siempre en reposo comóvil en su interior, no se necesita vector de desplazamiento alguno, puesto que para los pasajeros $u_i/u^0 = v_s$ por definición. Bobrick y Martire discuten este ejemplo de caso a velocidad constante como base de una solución de curvatura física en [4], que da lugar a una cáscara de materia ordinaria. En el ejemplo de Alcubierre, la fase de velocidad constante adquiere un contexto importante cuando se conecta con una fase previa de aceleración en la que definimos cómo entran los pasajeros en el motor. Si el motor acelera con la condición $du_i/dt = 0$, es necesario un vector de desplazamiento durante la fase de velocidad constante, ya que antes de ese punto los pasajeros tenían $u_i/u^0 < v_s$ y solo un vector de desplazamiento puede proporcionar el $dx^i/dt$ requerido bajo las restricciones de curvatura impuestas en el volumen de pasajeros.

Casi todas las soluciones de curvatura propuestas en la literatura son esencialmente variaciones de la solución de Alcubierre y se basan en el vector de desplazamiento para transportar a los pasajeros en el mismo sentido que el aquí discutido. El término espacial añadido por Van Den Broeck [19] solo se utiliza para aprovechar mejor la densidad de energía mediante una expansión de volumen, pero el desplazamiento sigue desempeñando el mismo papel impulsor del transporte que en la solución de Alcubierre, pues el término espacial es plano en el volumen de pasajeros[^4]. Las métricas de curvatura de Lentz [13, 12], de Fell y Heisenberg [9] y la clase más general de Natário [14] utilizan varias componentes del vector de desplazamiento, pero siguen en esencia la misma dinámica aquí descrita. En la métrica con simetría esférica [4] no se usa vector de desplazamiento, pero, de nuevo, se trata de una solución a velocidad constante, y podría ser necesario añadir un vector de desplazamiento al extenderla a una solución acelerada más general.

Aunque los vectores de desplazamiento se han utilizado ampliamente en la literatura, no son el único ingrediente con el que se pueden construir motores de curvatura. Los gradientes espaciales del lapso y de los términos espaciales de la métrica pueden afectar a $du_i/dt$ y, con ello, a $dx^i/dt$, pero exigen un control cuidadoso de sus derivadas espaciales para evitar que haya energía o fuerzas de marea dentro del volumen de pasajeros. El uso de un desplazamiento es, en muchos sentidos, el método más sencillo para añadir transporte geodésico, ya que proporciona directamente un término $dx^i/dt$ a los observadores en función únicamente de su magnitud. En este trabajo nos centraremos en una solución de curvatura que usa un vector de desplazamiento para obtener las mismas propiedades de motor de curvatura que la solución de Alcubierre, pero de un modo que permita mantener la fisicidad.

### 1.3. El problema de la fisicidad

La condición de motor de curvatura físico se discute en detalle en [4] y en nuestro artículo reciente [11], pero, en esencia, el requisito fundamental es satisfacer las condiciones de energía. Se ha demostrado que la clase de soluciones de Natário (definida por vectores de desplazamiento con lapso unitario $\alpha=1$ y métrica espacial plana $\gamma_{ij}=\delta_{ij}$) viola siempre las condiciones de energía [15]. Una posible razón de esta violación es que las métricas, tal como están construidas, carecen del efecto gravitatorio de la materia ordinaria. El campo gravitatorio asintótico producido por un objeto gravitante con simetría esférica viene dado por la métrica de Schwarzschild, que presenta una dependencia asintótica en $1/r$ en el lapso y en los términos espaciales, en coordenadas de Schwarzschild, en el infinito. Las métricas de curvatura generales con una *región de soporte compacto*, es decir, una métrica cuyas componentes están acotadas dentro de alguna región finita que transita al espacio de Minkowski más rápido que 1/r, se comportan de forma distinta a la materia ordinaria. Esto puede expresarse de otro modo mediante la definición de masa ADM [5], que es una magnitud que describe el concepto de masa tal como se ve desde regiones lejanas. La métrica de Alcubierre y las soluciones similares tienen $M_{ADM} = 0$, a diferencia de la métrica de Schwarzschild, que para una magnitud equivalente de la densidad de energía tendría $M_{ADM} > 0$. Sin embargo, aun cuando la métrica tenga masa ADM no nula, pueden producirse fácilmente violaciones de las condiciones de energía. Este problema se pone de manifiesto en el trabajo reciente de Schuster et al. sobre el motor de Schwarzschild transportado [16]. Más aún, incluso si la solución tiende asintóticamente a la de un espaciotiempo de materia positiva con masa ADM positiva, en la burbuja de curvatura no vacía deben imponerse restricciones adicionales. Como regla práctica, el flujo de momento y las presiones eulerianas deben ser menores que la densidad de energía para satisfacer las condiciones de energía [11]. Por último, según [4], el movimiento subluminal es probablemente otro requisito importante para que la métrica sea física. En resumen, los ingredientes clave probables de una solución física de motor de curvatura pueden enunciarse simplemente así:

1. El espaciotiempo asintóticamente plano debe tener masa ADM positiva.
2. En general, una densidad de energía positiva mucho mayor que la presión y que el flujo de momento en la burbuja de curvatura no vacía, según la miden los observadores eulerianos.
3. Velocidades subluminales

Estos ingredientes físicos guiarán la solución que se construye en este artículo.

### 1.4. Estructura del artículo

El artículo se estructura como sigue: primero se presenta, en la sección 2, el enfoque para construir un modelo numérico de motor de curvatura. A continuación, en las secciones 3 - 4, desarrollamos las soluciones para una cáscara de materia y su transformación en una cáscara de curvatura (Warp Shell) mediante la adición de un vector de desplazamiento. En la sección 5 discutimos las implicaciones de esta solución y la comparamos con métricas de curvatura anteriores. Por último, en la sección 6 exponemos las conclusiones y comentamos los pasos futuros.

## 2. Métodos

Para superar los problemas que han encontrado en el pasado las soluciones de curvatura, emplearemos un nuevo enfoque para construir soluciones de curvatura que conservan una solución de vacío de Schwarzschild a grandes distancias con un tensor de energía-momento de soporte compacto. Esto se consigue añadiendo una distribución del vector de desplazamiento sobre una cáscara de materia ordinaria. El vector de desplazamiento añadido se mantiene por debajo del umbral a partir del cual el flujo de momento adicional que acompaña a su incorporación provoca violaciones de las condiciones de energía. Añadir un vector de desplazamiento tendrá sobre el transporte de pasajeros un efecto similar al del motor de Alcubierre, sin violación alguna de las condiciones de energía.

### 2.1. Construcción de la burbuja

Para hallar una solución física, utilizamos una cáscara de materia en movimiento como métrica base de nuestro motor de curvatura. Esta solución presenta un interior plano y, fuera de la cáscara, una solución de Schwarzschild asintóticamente plana. La solución de cáscara se construirá en coordenadas comóviles, en las que el tensor métrico no depende del tiempo. En esta sección ofrecemos un resumen general del proceso; los detalles se encuentran en la sección siguiente.

En primer lugar, debemos considerar cómo son las soluciones de curvatura en un sistema comóvil. Como pretendemos añadir un único vector de desplazamiento a una cáscara, examinamos la solución de Alcubierre en un sistema comóvil para ver la forma del vector de desplazamiento que queremos añadir. Para transformar la solución de Alcubierre al sistema estacionario de un observador externo comóvil de tipo tiempo, podemos utilizar la transformación de Lorentz mostrada en el apéndice B, determinada para un observador en el infinito espacial. Cabe señalar que esta transformación nos restringe al régimen subluminal, pero esa es una restricción natural para cualquier observador externo comóvil de tipo tiempo y es el régimen con mayor probabilidad de conducir a soluciones físicas. Aplicar la transformación de Lorentz a la métrica de Alcubierre da lugar a un vector de desplazamiento nulo en $r_s \gg R$ y no nulo dentro del volumen de pasajeros, como se muestra en la figura 2.

![Figura 2. Ejemplo de una solución de Alcubierre transformada a un sistema comóvil mediante una transformación de Lorentz. La estática (azul) es la métrica en la forma definida por Alcubierre en [1]. La comóvil (rojo punteado) es la transformación de Lorentz inversa aplicada a la solución estática. Obsérvese que el vector de desplazamiento no cambia, pero sí lo hacen los términos espaciales y el lapso. Estos cambios quedarán sustituidos por los términos de la cáscara de materia al construir la solución física de este artículo.](figures/LorentzAlcubierre.png)

**Figura 2.** Ejemplo de una solución de Alcubierre transformada a un sistema comóvil mediante una transformación de Lorentz. La estática (azul) es la métrica en la forma definida por Alcubierre en [1]. La comóvil (rojo punteado) es la transformación de Lorentz inversa aplicada a la solución estática. Obsérvese que el vector de desplazamiento no cambia, pero sí lo hacen los términos espaciales y el lapso. Estos cambios quedarán sustituidos por los términos de la cáscara de materia al construir la solución física de este artículo.

Con la solución de Alcubierre transformada anterior, podemos ahora compararla con la misma configuración para una cáscara de materia ordinaria, que suele definirse en un sistema comóvil, y ver que la adición del efecto de curvatura puede expresarse simplemente como la suma de un vector de desplazamiento a la métrica de la cáscara. Este vector de desplazamiento añadido $\beta_i$ se aplica en el interior de la cáscara, donde la materia existe para gestionar las restricciones de fisicidad en la región no vacía:

$$
g_{warp shell} = g_{shell}+ \delta g_{warp} \tag{6}
$$

donde $\delta g_{warp}$ es una métrica que solo contiene una componente del vector de desplazamiento a lo largo de una única dirección:

$$
\delta g_{warp} = \begin{pmatrix} 0 & \beta_1 & 0 & 0 \\
\beta_1 & 0 & 0 & 0 \\
0 & 0 & 0 & 0 \\
0 & 0 & 0 & 0 \end{pmatrix} \tag{7}
$$

Los detalles de la cáscara y de su modificación de curvatura se describen en las secciones 3 y 4.

Como hicimos con la métrica de Alcubierre, podemos volver a las ecuaciones geodésicas (2) para describir cómo afectaría esta solución a los pasajeros. Aunque aquí no modelizamos la fase de aceleración, puede considerarse similar al caso de Alcubierre. En concreto, la región de pasajeros del interior de esta cáscara en el caso de velocidad constante deberá ser plana, por lo que podemos suponer de nuevo que $du_i/dt = 0$. Tomaremos también $u_i = 0$, igual que en el caso de la métrica de Alcubierre, para considerar posibles soluciones conectadas con alguna fase de aceleración previa que mantuviera $du_i/dt = 0$. Sin embargo, esta vez la solución de cáscara no tendrá términos espaciales de Minkowski y, por tanto, el movimiento coordenado viene dado ahora por:

$$
\frac{d x^i}{d t}= - \beta^i = - \gamma^{i j}\beta_j \tag{8}
$$

Por último, una cuestión que a veces se discute en la teoría de la curvatura es la naturaleza del transporte de pasajeros respecto al movimiento de la burbuja, especialmente cuando el vector de desplazamiento decrece hasta anularse en la frontera. En el caso de un motor de curvatura a velocidad constante, en el que la métrica no cambia en el sistema comóvil, la propia materia de la burbuja siempre se «moverá», por definición, alineada con el volumen de pasajeros. Esto es consecuencia de que la burbuja misma es una función generadora del vector de desplazamiento, determinada por la métrica a través de la ecuación de campo de Einstein. Esto es cierto para todas las soluciones de curvatura a velocidad constante.

### 2.2. Métodos numéricos

En esta sección presentamos un resumen de nuestro método numérico. Realizamos el análisis numérico con el conjunto de herramientas Warp Factory, presentado en detalle en [11]. A lo largo de este artículo adoptaremos el formalismo 3+1 y daremos siempre el tensor de energía-momento euleriano y sus componentes (presión, flujo de momento y densidad de energía) mediante los métodos de la sección 3 de [11]. En Warp Factory, la transformación de sistema de referencia se realiza localmente sobre el tensor métrico en cada punto mediante una tétrada correspondiente a los observadores eulerianos, que además lleva la métrica local a la forma de Minkowski. Esta tétrada de transformación se aplica al tensor de energía-momento y devuelve el tensor de energía-momento medido por los observadores eulerianos. El observador euleriano en este sistema se define de la forma habitual como:

$$
n_{\mu} = (1, 0, 0, 0) \tag{9}
$$

La densidad de energía $\rho$, el flujo de momento $p_i$, la presión isótropa $P_i$ y el tensor de tensiones $\sigma_{ij}$ que observa el observador euleriano en cualquier punto a partir del tensor euleriano $T^{\hat{\mu}\hat{\nu}}$ son:

$$
\begin{gathered}
\rho = T^{\hat{0}\hat{0}} \\
p_i = T^{\hat{0}\hat{i}} \\
P_i = T^{\hat{i}\hat{i}} \\
\sigma_{ij} = T^{\hat{i}\hat{j}}
\end{gathered}
\tag{10}
$$

El procedimiento para definir y evaluar las condiciones de energía, descrito en detalle en la sección 3 de [11], se reproduce aquí por claridad. La condición de energía nula (NEC) viene dada por la contracción de observadores nulos con el tensor de energía-momento en todos los puntos del espaciotiempo ($X$):

$$
\Xi_{NEC}(X) = T_{\hat{\mu}\hat{\nu}}(X) k^{\hat{\mu}} k^{\hat{\nu}} \ge 0 \ \ \forall \ \ k^{\hat{\mu}} \tag{11}
$$

donde $k^{\hat{\mu}}$ son observadores nulos. La condición de energía débil (WEC) es similar a la NEC, pero con la contracción de observadores de tipo tiempo en todos los puntos del espaciotiempo:

$$
\Xi_{WEC}(X) = T_{\hat{\mu}\hat{\nu}}(X) V^{\hat{\mu}} V^{\hat{\nu}} \ge 0 \ \ \forall \ \ V^{\hat{\mu}} \tag{12}
$$

donde $V^{\hat{\mu}}$ son observadores de tipo tiempo. La condición de energía fuerte (SEC) se obtiene también contrayendo observadores de tipo tiempo con el tensor de energía-momento:

$$
\Xi_{SEC}(X) = \left(T_{\hat{\mu}\hat{\nu}}(X) - \frac{1}{2} T(X) \eta_{\hat{\mu}\hat{\nu}} \right)V^{\hat{\mu}} V^{\hat{\nu}} \ge 0 \ \ \forall \ \ V^{\hat{\mu}} \tag{13}
$$

Por último, la condición de energía dominante (DEC) se obtiene contrayendo el tensor de energía-momento en forma mixta con los observadores de tipo tiempo:

$$
\Upsilon^{\hat{\mu}}(X) = -T^{\hat{\mu}}_{\ \ \hat{\nu}}(X) V^{\hat{\nu}} \tag{14}
$$

donde $\Upsilon^{\hat{\mu}}\left(X\right)$ debe estar orientado hacia el futuro, es decir, $\Upsilon^{\hat{\mu}}$ debe ser de tipo tiempo o nulo, cumpliendo[^5]:

$$
\xi_D(X) = \eta_{\hat{\mu}\hat{\nu}} \Upsilon^{\hat{\mu}}(X) \Upsilon^{\hat{\nu}}(X) \le 0 \ \ \forall \ \ V^{\hat{\mu}} \tag{15}
$$

El campo vectorial de observadores se muestrea con una densidad de orientaciones espaciales de 100 muestras y, para los observadores de tipo tiempo, con una densidad adicional de módulos de velocidad de 10 muestras (véase [11] para una discusión detallada de este método).

## 3. Métrica de cáscara

La base de la solución de curvatura es una cáscara de materia estable. Comenzamos construyendo esta cáscara en un sistema comóvil en coordenadas de Schwarzschild.

### 3.1. Definición de la métrica

La solución de cáscara se construye a partir de una métrica general estática y con simetría esférica, que tiene la forma [6]:

$$
ds^2 = -e^{2a}dt^2 + e^{2b}dr^2 + d\Omega^2 \tag{16}
$$

Las funciones $a$ y $b$ pueden obtenerse resolviendo la ecuación de campo con un tensor de energía-momento conocido. Para una solución sencilla basada en el tensor de energía-momento de un fluido isótropo, el proceso es directo; las componentes del tensor de energía-momento en el sistema euleriano son:

$$
T^{iso}_{\hat{\mu}\hat{\nu}} = \textrm{diag}(\rho,P,P,P) \tag{17}
$$

Sin embargo, para una cáscara estable las presiones $P$ no pueden suponerse isótropas, ya que el radio interior debe soportar la presión gravitatoria dirigida hacia dentro, lo que da lugar a términos de presión no uniformes en las direcciones $\theta$ y $\phi$, de forma análoga a la tensión circunferencial en un cilindro. Con presión no isótropa, la solución adopta la forma:

$$
T^{shell}_{\hat{\mu}\hat{\nu}} = \textrm{diag}(\rho,P_1,P_2,P_3) \tag{18}
$$

Para obtener la solución de cáscara no isótropa, seguiremos un enfoque iterativo y hallaremos $a$ y $b$ como modificaciones de la solución isótropa, cambiando la presión y la densidad supuestas que se usan para determinar $a$ y $b$ en el caso isótropo. Un breve resumen del proceso es el siguiente:

1. Partir de una solución inicial de prueba para la métrica de la cáscara suponiendo una densidad constante $\rho^\prime$ entre el radio interior $R_1$ y el radio exterior $R_2$.
2. Obtener el perfil de presión inicial de prueba $P^\prime(r)$ suponiendo que la presión en la cáscara es isótropa y nula en $r = R_2$, mediante la ecuación de Tolman-Oppenheimer-Volkoff (TOV). Tras resolver la ecuación diferencial con la única condición de contorno en $r = R_2$, queda una presión constante en el interior; esta presión se fija a cero para $r < R_1$ para imponer un interior de vacío.
3. La hipótesis de densidad constante crea fronteras abruptas en $R_1$ y $R_2$, y la hipótesis de presión isótropa no es válida en la frontera $R_1$ para mantener una cáscara estable. Para resolverlo, suavizamos la frontera mediante un suavizado radial aplicado a $\rho^{\prime}$ y $P^{\prime}$ con una función $f_{smooth}$.
4. Las $\tilde{\rho}$ y $\tilde{P}$ suavizadas se utilizan entonces para obtener los términos $a$ y $b$ que construyen la métrica real. Calcular el tensor de energía-momento mediante las ecuaciones de campo de Einstein proporciona después los verdaderos $\rho$ y $P_i$ que corresponden a la métrica obtenida en este paso.
5. Por último, la función de suavizado de la presión y la densidad se itera en los pasos (iii) y (iv) hasta encontrar una métrica que satisfaga las condiciones de energía en las fronteras.

El flujo del proceso de construcción de la solución métrica descrito arriba se muestra en la figura 3.

![Figura 3. Método de creación de la métrica en el que se usan soluciones de prueba que después se modifican para construir una solución física de cáscara. El proceso parte de la densidad, a la izquierda, y genera una solución a la derecha.](figures/ShellConstructionDiagram.png)

**Figura 3.** Método de creación de la métrica en el que se usan soluciones de prueba que después se modifican para construir una solución física de cáscara. El proceso parte de la densidad, a la izquierda, y genera una solución a la derecha.

La versión detallada del proceso esbozado arriba es la siguiente. La hipótesis de partida para el perfil de densidad $\rho^\prime$ es la de una cáscara esférica de radio interior $R_1$ y radio exterior $R_2$, con densidad constante y masa total $M$. Esto define la densidad como:

$$
\rho^\prime(r) =
\begin{cases}
 0 & 0 \leq r \leq R_1 \\
 \frac{3}{4\pi}\frac{M}{R_2^3-R_1^3} & R_1 \leq r \leq R_2 \\
 0 & R_2 \leq r < \infty
\end{cases}
\tag{19}
$$

y el perfil de masa acumulada asociado $m^\prime(r)$ es simplemente la integral de la densidad por debajo de un radio dado $r$, lo que da:

$$
m^\prime(r) = \int_0^r 4 \pi r^2 \rho^\prime(r) dr =
\begin{cases}
 0 & 0 \leq r \leq R_1 \\
M\left(\frac{r^3-R_1^3}{R_2^3-R_1^3}\right) & R_1 \leq r \leq R_2 \\
 M & R_2 \leq r < \infty
\end{cases}
\tag{20}
$$

A partir de las definiciones de densidad y masa acumulada, podemos resolver numéricamente la ecuación TOV para $P^\prime$ cuando $R_1<r<R_2$, con la condición de contorno de presión nula en $r = R_2$, e imponer que $P^\prime = 0$ para $r < R_1$:

$$
\frac{dP^\prime}{dr} =
\begin{cases}
 0 & 0 \leq r < R_1 \\
-G\left(\rho^\prime/c^2+P^\prime/c^4\right)\left(m^\prime/r^2+4\pi r P^\prime/c^2\right)\left(1-\frac{2Gm^\prime}{c^2 r}\right)^{-1} & R_1 < r \leq R_2 \\
0 & R_2 \leq r < \infty
\end{cases}
\tag{21}
$$

Esta solución inicial presentará problemas en $R_1$ y $R_2$ debido a la discontinuidad de la densidad y la presión; el problema se mitiga aplicando un suavizado numérico tanto a $\rho^{\prime}$ como a $P^{\prime}$:

$$
\begin{aligned}
&\tilde{\rho} = f_{smooth}(\rho^\prime) \\
&\tilde{P} = f_{smooth}(P^\prime)
\end{aligned}
\tag{22}
$$

La función de suavizado aplicada es una media móvil, es decir, un filtro paso bajo cuyos coeficientes son iguales al inverso de la amplitud de la media[^6]. El propio suavizado corrige la discontinuidad, al dar valores finitos de las derivadas en las fronteras, a la vez que mantiene una solución física. Los coeficientes de la función de suavizado se determinan de forma iterativa hasta que la solución no presenta violaciones de las condiciones de energía nula, débil, dominante y fuerte. Una vez aplicado el suavizado, hay que recalcular el nuevo perfil de masa como antes con la nueva densidad $\tilde{\rho}(r)$:

$$
m(r) = \int_0^r 4 \pi r^2 \tilde{\rho}(r) dr \tag{23}
$$

Los valores suavizados de la presión y la densidad pueden usarse ahora para obtener los términos métricos $a$ y $b$. El perfil de masa determina directamente $b$, que proporciona $e^{2b}$ como una simple extensión de la solución de Schwarzschild con $M = m$ [6, sección 5.8, ec. 5.143]:

$$
e^{2b} = \left(1 - \frac{2Gm}{c^2 r} \right)^{-1} \tag{24}
$$

El segundo término, $e^{2a}$, se obtiene resolviendo para $a$ [6, sección 5.8, ec. 5.152]:

$$
\frac{d a}{dr} = G\left(\frac{m}{c^2 r^2} +\frac{4\pi r}{c^4} \tilde{P}\right)\left(1-\frac{2Gm}{c^2 r}\right)^{-1} \tag{25}
$$

Esta ecuación se integra con la condición de que, en $r \gg R_2$, la frontera viene fijada por $e^{2a} = e^{-2b}$, lo que corresponde a una solución de Schwarzschild en la región de vacío. La amplitud, o ventana, $s$ de la función de suavizado se elige de forma distinta para la densidad y la presión; hemos comprobado que funciona una razón entre las amplitudes de densidad y presión $s_\rho / s_P \approx 1.72$[^7]. El suavizado por media móvil se aplica cuatro veces, con la misma amplitud y las mismas razones, a la densidad y a la presión para obtener la solución final. Para una cáscara con parámetros $R_1 = 10$ m, $R_2 = 20$ m, $M = 4.49\times 10^{27}$ kg ($2.365$ masas de Júpiter)[^8], la presión y la densidad antes y después del suavizado se muestran en la figura 4. Hasta aquí, el proceso proporciona una solución para la métrica en coordenadas esféricas. El último paso consiste en transformar esta solución a coordenadas pseudocartesianas, convenientes para definir la malla numérica, cambiando las coordenadas y sus diferenciales mediante las relaciones estándar entre coordenadas esféricas y cartesianas. Al hacerlo numéricamente, las soluciones radiales de $e^{2a}$ y $e^{2b}$ se interpolan a los puntos de la malla cartesiana mediante polinomios de Legendre. La métrica construida a partir de estos parámetros se representa en la figura 5.

![Figura 4. Perfiles de densidad y presión antes y después del suavizado para construir la métrica de cáscara.](figures/Shell_Smoothed_Values.png)

**Figura 4.** Perfiles de densidad y presión antes y después del suavizado para construir la métrica de cáscara.

![Figura 5. Componentes de las métricas de cáscara y de Schwarzschild en un corte a lo largo del eje y. Solo se muestran las componentes no minkowskianas de este corte. En g_22, la línea discontinua vertical marca donde r = r_s para la métrica de Schwarzschild de referencia, punto en el que cambia el signo de las partes espaciales.](figures/Shell_Metric.png)

**Figura 5.** Componentes de las métricas de cáscara y de Schwarzschild en un corte a lo largo del eje y. Solo se muestran las componentes no minkowskianas de este corte. En $g_{22}$, la línea discontinua vertical marca donde $r = r_s$ para la métrica de Schwarzschild de referencia, punto en el que cambia el signo de las partes espaciales.

![Figura 6. Componentes del tensor de energía-momento de la cáscara en un corte a lo largo del eje y. Solo se muestran las componentes no nulas de este corte. Las líneas de densidad y presión suavizadas son las calculadas a partir de la ec. (22). Obsérvese que la densidad de energía está escalada por un factor c^2.](figures/Shell_Energy.png)

**Figura 6.** Componentes del tensor de energía-momento de la cáscara en un corte a lo largo del eje y. Solo se muestran las componentes no nulas de este corte. Las líneas $\tilde{\rho}$ y $\tilde{P}$ son la densidad y la presión suavizadas calculadas a partir de la ec. (22). Obsérvese que la densidad de energía está escalada por un factor c$^2$.

### 3.2. Tensor de energía-momento

Los términos de energía-momento resultantes, medidos por observadores eulerianos, se representan en la figura 6. A lo largo de cada una de las direcciones coordenadas principales, la presión de entrada $\tilde{P}$ utilizada para obtener $a$ a partir de la ec. (25) es igual a la presión $P$ calculada del tensor de energía-momento en esa dirección, ya que está alineada con la dirección radial. Las presiones en las direcciones x y z son iguales y difieren de la presión en y, con un gran pico en el límite interior de la cáscara. La decisión de suavizar la presión y la densidad se toma deliberadamente para encontrar una solución con presiones no isótropas, modificada respecto a la isótropa mediante un filtro de suavizado. Para una cáscara estática, la frontera interior en $R_1$ requiere una diferencia de presión entre las presiones radiales y la presión angular para garantizar que la cáscara sea estable frente al colapso gravitatorio. Esto se manifiesta como una especie de tensión circunferencial alrededor del radio interior de la cáscara. También es importante que todas estas presiones sean de menor magnitud que el valor de la densidad de energía en ese punto, para garantizar que la cáscara sea física. Para materiales realistas, que pueden admitir un rango limitado de presiones, este requisito siempre puede cumplirse haciendo la cáscara más grande y modificando el perfil de densidad, reduciendo así las fuerzas gravitatorias. La fisicidad de la solución se demuestra comprobando las condiciones de energía con el conjunto de herramientas Warp Factory [11], como se muestra en la figura 7. No existen violaciones de las condiciones de energía más allá de los límites de precisión numérica, que en esta configuración se sitúan en $10^{34}$ (véase el apéndice A para una discusión detallada sobre errores y limitaciones numéricas).

![Figura 7. Condiciones de energía de la cáscara en un corte a lo largo del eje y. Los valores negativos representan violaciones de la condición. No se encuentran valores negativos. Unidades en [j/m^3]](figures/Shell_Violation.png)

**Figura 7.** Condiciones de energía de la cáscara en un corte a lo largo del eje y. Los valores negativos representan violaciones de la condición. No se encuentran valores negativos. Unidades en $[j/m^3]$

## 4. Cáscara de curvatura a velocidad constante

Como se describió en la introducción, un motor de curvatura capaz de transportar a distintos observadores puede hacerlo mediante un vector de desplazamiento dentro del volumen de pasajeros. Por tanto, la tarea consiste en añadir un campo de vector de desplazamiento a una solución de cáscara manteniendo las condiciones de energía.

### 4.1. Definición de la métrica

A partir de la solución de cáscara construida en la sección 3, modificamos ahora la región interior de la cáscara comóvil para que tenga un vector de desplazamiento a lo largo de la dirección del movimiento, en este caso el eje x. La modificación debe respetar unas pocas restricciones para crear un motor de curvatura coherente con nuestra definición:

1. La región interior debe seguir siendo plana, es decir, todas las derivadas espaciales de la métrica deben ser nulas ($\partial_i g_{\mu\nu} = 0$). Esta elección garantiza que los pasajeros estén en el vacío y no sufran fuerzas de marea.
2. La región de transición del vector de desplazamiento debe situarse entre $R_1$ y $R_2$ y conectar de forma suave con la solución exterior en $R_2$, donde $\beta_i = 0$.

La modificación del desplazamiento altera el término $g_{01}$ como:

$$
g^{warp}_{01} = g_{01} - S_{warp}(r)\left(g_{01} + \beta_{warp}\right) \tag{26}
$$

donde $S_{warp}$ es una función sigmoide de soporte compacto definida como:

$$
S_{warp}(r) =
\begin{cases}
1 & r < R_1+R_{b} \\
1-f(r) & R_1+R_{b} < r < R_2 - R_{b} \\
0 & r > R_2-R_{b}
\end{cases}
\tag{27}
$$

y $f(r)$ viene dada por:

$$
f(r) = \left(\exp\left[(R_2-R_1)\left(\frac{1}{r-R_2}+\frac{1}{r-R_1}\right)\right]+1\right)^{-1} \tag{28}
$$

donde $R_b>0$ es una región de margen para garantizar que las derivadas queden en el interior de la burbuja. Construimos una cáscara de materia con los mismos parámetros que en la sección 3. Variando los valores de $\beta_{warp}$, encontramos que es posible añadir desplazamiento dentro de la cáscara con $\beta_{warp} = 0.02$ sin violar ninguna condición de energía[^9]. Las componentes de esta métrica se representan en la figura 8.

![Figura 8. Componentes de la métrica de la cáscara de curvatura a velocidad constante en un corte a lo largo del eje y. Solo se muestran las componentes no minkowskianas de este corte. La dirección del movimiento es +X.](figures/Warp_Metric.png)

**Figura 8.** Componentes de la métrica de la cáscara de curvatura a velocidad constante en un corte a lo largo del eje y. Solo se muestran las componentes no minkowskianas de este corte. La dirección del movimiento es +X.

### 4.2. Fisicidad

Para entender la fisicidad de esta solución, empezamos representando los términos de energía-momento resultantes en la figura 9. La densidad de energía permanece prácticamente inalterada respecto a la de una cáscara en movimiento estándar, pero la modificación del vector de desplazamiento produce una diferencia en los valores de momento y de presión para los observadores eulerianos. El cambio en el momento es el más apreciable frente a la métrica de cáscara, que tenía densidad de momento nula entre $R_1$ y $R_2$. Esta solución modificada presenta densidad de momento tanto positiva como negativa en torno a $r \approx (R_2-R_1)/2$, lo que indica que se forma un patrón de circulación en el flujo de momento de la cáscara. El mismo tipo de estructura de flujo de momento se observa también en una solución de Alcubierre [11]. Las condiciones de energía se evalúan para esta métrica y se muestran en la figura 10. Modificar de este modo el vector de desplazamiento no tiene ningún efecto sobre la violación en comparación con la solución de cáscara de materia normal.

Las representaciones de superficie de la solución para un corte centrado en la dirección $Z$ se muestran para la métrica en la figura 11, para la densidad de energía en la figura 12, para las demás componentes del tensor de energía-momento en la figura 13 y para la evaluación de las condiciones de energía en la figura 14.

![Figura 9. Componentes del tensor de energía-momento de la cáscara de curvatura a velocidad constante en un corte a lo largo del eje y cartesiano. La dirección del movimiento es +X. Obsérvese que la densidad de energía está escalada por un factor c^2 y la densidad de momento por un factor c.](figures/Warp_Energy.png)

**Figura 9.** Componentes del tensor de energía-momento de la cáscara de curvatura a velocidad constante en un corte a lo largo del eje y cartesiano. La dirección del movimiento es +X. Obsérvese que la densidad de energía está escalada por un factor c$^2$ y la densidad de momento por un factor c.

![Figura 10. Condiciones de energía de la cáscara de curvatura a velocidad constante en un corte a lo largo del eje y. La dirección del movimiento es +X. Los valores negativos representan violaciones de la condición. No se encuentran valores negativos.](figures/Warp_Violation.png)

**Figura 10.** Condiciones de energía de la cáscara de curvatura a velocidad constante en un corte a lo largo del eje y. La dirección del movimiento es +X. Los valores negativos representan violaciones de la condición. No se encuentran valores negativos.

### 4.3. Secciones transversales

![Figura 11. Métrica de la cáscara de curvatura a velocidad constante en el sistema comóvil. La dirección del movimiento es +X. La sección transversal está centrada en Z. Solo se muestran las secciones transversales no nulas.](figures/Warp_Metric_Surf.png)

**Figura 11.** Métrica de la cáscara de curvatura a velocidad constante en el sistema comóvil. La dirección del movimiento es +X. La sección transversal está centrada en Z. Solo se muestran las secciones transversales no nulas.

![Figura 12. Densidad de energía de la cáscara de curvatura a velocidad constante. La dirección del movimiento es +X. La sección transversal en Z está alineada con el centro de la burbuja. Unidades en [J/m^3]](figures/Warp_Energy_Density_Surf.png)

**Figura 12.** Densidad de energía de la cáscara de curvatura a velocidad constante. La dirección del movimiento es +X. La sección transversal en Z está alineada con el centro de la burbuja. Unidades en $[J/m^3]$

![Figura 13. Tensor de energía-momento de la cáscara de curvatura a velocidad constante en el sistema comóvil, para observadores eulerianos. La densidad de energía se muestra en la figura 12. La dirección del movimiento es +X. La sección transversal en Z está alineada con el centro de la burbuja. Solo se muestran las secciones transversales no nulas. Unidades en [J/m^3]](figures/Warp_Energy_Surf.png)

**Figura 13.** Tensor de energía-momento de la cáscara de curvatura a velocidad constante en el sistema comóvil, para observadores eulerianos. La densidad de energía se muestra en la figura 12. La dirección del movimiento es +X. La sección transversal en Z está alineada con el centro de la burbuja. Solo se muestran las secciones transversales no nulas. Unidades en $[J/m^3]$

![Figura 14. Evaluación de las condiciones de energía para la cáscara de curvatura a velocidad constante. La dirección del movimiento es +X. La sección transversal en Z está alineada con el centro de la burbuja. Se muestra el valor mínimo sobre todos los observadores. Los valores positivos (azul) y nulos (blanco) son físicos, y los negativos (rojo) indican violación. Unidades en [J/m^3]](figures/Warp_Violation_Surf.png)

**Figura 14.** Evaluación de las condiciones de energía para la cáscara de curvatura a velocidad constante. La dirección del movimiento es +X. La sección transversal en Z está alineada con el centro de la burbuja. Se muestra el valor mínimo sobre todos los observadores. Los valores positivos (azul) y nulos (blanco) son físicos, y los negativos (rojo) indican violación. Unidades en $[J/m^3]$

## 5. Discusión

### 5.1. Medida del desplazamiento

La adición de un vector de desplazamiento al volumen de pasajeros de una cáscara introduce varios cambios en la solución. Para distinguir por completo una cáscara de curvatura de una cáscara de materia normal, puede construirse una prueba invariante comparando rayos de luz que atraviesan la burbuja y midiendo la diferencia de tiempo de tránsito entre dos trayectorias de rayos que recorren la burbuja a favor y en contra de la dirección del vector de desplazamiento. Como la métrica ya está definida en un sistema comóvil, basta con trazar geodésicas nulas por el centro de la cáscara, dirigidas hacia delante y hacia atrás a lo largo de la dirección del vector de desplazamiento, y registrar el tiempo propio $\delta t$ que tarda cada fotón en regresar, medido en los puntos de emisión, despreciando la interacción de los fotones con el tensor de energía-momento. En la figura 15 se muestra un esquema de la configuración de la prueba para cada una de las trayectorias de los fotones al atravesar la cáscara y volver al punto de emisión. Esta configuración de prueba se construye dentro de Warp Factory y los tiempos de los rayos de luz se determinan numéricamente. Al realizar esta prueba encontramos que la cáscara de curvatura (de la sección 4) tiene $\delta t \approx 7.6$ ns y la cáscara de materia (de la sección 3) tiene $\delta t = 0$ ns. Como era de esperar, una cáscara normal tiene el mismo tiempo de tránsito para ambos rayos de luz, mientras que la cáscara de curvatura presenta una diferencia en el tiempo de tránsito según el sentido en que el rayo la atraviesa. Este retraso no es exclusivo de la cáscara de curvatura de este artículo, sino que se da también en otros motores de curvatura propuestos que utilizan un vector de desplazamiento. Con Warp Factory realizamos el mismo experimento numérico para algunos de los motores de curvatura discutidos en la literatura, y todos ellos presentan $\delta t > 0$, como se muestra en la tabla 1[^10]. Este experimento demuestra que existe un efecto Lense-Thirring en los motores de curvatura con vectores de desplazamiento, que produce un *arrastre de sistemas de referencia lineal*[^11]. Puesto que el tiempo de viaje de los fotones es una magnitud medible, la modificación de la métrica de cáscara mediante el vector de desplazamiento no puede reducirse a una transformación de coordenadas.

![Figura 15. Esquema de la prueba con rayos de luz. Los emisores, detectores y espejos son comóviles con la cáscara estudiada. Obsérvese que ambos haces pasan por el centro, pero en el esquema se representan desplazados para mayor claridad visual. El emisor-detector B está alineado verticalmente con los espejos de la izquierda y el emisor-detector A con los espejos de la derecha. Los emisores-detectores A y B equidistan del centro de la cáscara. El camino de vuelta de los dos haces puede estar en cualquier lugar fuera de la cáscara. El efecto de curvatura de la cáscara de curvatura actúa en la dirección horizontal, alejándose de B y hacia A.](figures/LightRayTest.png)

**Figura 15.** Esquema de la prueba con rayos de luz. Los emisores, detectores y espejos son comóviles con la cáscara estudiada. Obsérvese que ambos haces pasan por el centro, pero en el esquema se representan desplazados para mayor claridad visual. El emisor-detector B está alineado verticalmente con los espejos de la izquierda y el emisor-detector A con los espejos de la derecha. Los emisores-detectores A y B equidistan del centro de la cáscara. El camino de vuelta de los dos haces puede estar en cualquier lugar fuera de la cáscara. El efecto de curvatura de la cáscara de curvatura actúa en la dirección horizontal, alejándose de B y hacia A.

**Tabla 1.** Comparación del retraso temporal entre distintos modelos de curvatura y la cáscara de materia para $v_{warp} = 0.04$ c.

| Nombre | Parámetros | $\delta t$ [ns] |
|:---:|:---:|:---:|
| **Alcubierre** [1] | $R$ = 15 m | 8.0 |
| **Van Den Broeck** [19] | $R_1$ = 10 m, $R_2$ = 15 m, $\alpha$ = $0.1$ | 9.1 |
| **Tiempo modificado** [4] | $R$ = 15 m, A = 2 | 6.7 |
| **Cáscara de materia** (sección 3) | $R_1$ = 10 m, $R_2$ = 20 m, M = $4.49 \times 10^{27}$ kg | 0 |
| **Cáscara de curvatura** (sección 4) | $R_1$ = 10 m, $R_2$ = 20 m, M = $4.49\times 10^{27}$ kg | 7.6 |

### 5.2. Densidad de energía positiva

Que un espaciotiempo satisfaga o no las condiciones de energía se entiende mejor a partir de las relaciones entre la densidad de energía, las presiones y el flujo de momento en el sistema euleriano ($T^{\hat{\mu}\hat{\nu}}$) [11], ya que tanto la NEC como la WEC no son más que expresiones de cómo perciben distintos observadores los diferentes elementos del tensor de energía-momento. En el sistema euleriano, la contracción con los observadores puede simplificarse aproximadamente como una ponderación de la presión y el flujo de momento frente a la densidad de energía[^12]. En general, podemos decir que solo puede existir una solución física que respete esas condiciones si, para los observadores eulerianos, la densidad de energía es mayor que la magnitud de todos los demás términos del tensor combinados.

Un método para generar energía positiva es usar soluciones de cáscara esférica de materia con una masa ADM definida [5]. En un sistema de coordenadas asintóticamente de Minkowski, se trata de soluciones de tipo Schwarzschild que pueden parametrizarse por su masa ADM (dada por $M$ en este artículo). Construir nuestra solución de curvatura a partir de una cáscara de materia nos permitió usar el parámetro de masa ADM para introducir deliberadamente densidad de energía positiva en la solución, mientras que el vector de desplazamiento modificado nos proporcionó un efecto de curvatura al crear un arrastre de sistemas de referencia lineal en el interior de la cáscara. Sin embargo, la cantidad de masa está limitada por el radio y el grosor de la cáscara para no producir un horizonte de sucesos dentro de ella ($R_{shell} > 2G M_{shell}/c^2$), de modo que solo puede añadirse una cantidad limitada de densidad de energía. Aumentar el vector de desplazamiento seguirá añadiendo flujo de momento al tensor de energía-momento, por lo que existe un límite superior para la magnitud del vector de desplazamiento que mantiene físico el motor de curvatura antes de que el flujo de momento supere a la densidad de energía. Este límite superior es una línea de trabajo futura. Podemos afirmar que la distribución del vector de desplazamiento considerada aquí es muy conservadora en cuanto a su magnitud, ya que mantenemos la cáscara con densidad constante. Sin embargo, existen sin duda maneras de mejorarla mucho optimizando los perfiles del vector de desplazamiento y de la densidad de energía, para situar estratégicamente la densidad de energía allí donde el flujo de momento es mayor.

Otro aspecto interesante es que, aunque existe un vector de desplazamiento en la dirección de A en la configuración de rayos de luz, el retraso temporal de Shapiro [17] —el retraso del tiempo de viaje de la luz debido a la dilatación temporal gravitatoria— de B a A sigue siendo un retraso respecto al tiempo de propagación en la región plana correspondiente. Esto contrasta con la métrica de Alcubierre, en la que se percibe un adelanto. Este resultado se debe a la presencia de un lapso variable, una característica que la métrica de Alcubierre no tiene y que está relacionada con el hecho de que la solución posea masa ADM. Esta restricción podría ser otro aspecto importante de la fisicidad [21]: las soluciones físicas podrían requerir un lapso modificado que mantenga un retraso de Shapiro en lugar de un adelanto.

### 5.3. Aceleración

La solución de curvatura creada aquí se evalúa para el caso de velocidad constante, pero la pregunta inmediata es cómo se aplica a la fase de aceleración. Un posible enfoque es hacer que la burbuja acelere simplemente acelerando el centro de coordenadas y aumentando en consecuencia la magnitud del vector de desplazamiento. Sin embargo, este enfoque plantea exactamente el mismo problema que el motor de Schwarzschild [16], que toma una solución ordinaria de agujero negro y simplemente desplaza su centro a través de las hipersuperficies temporales. Este enfoque modifica la métrica de modo que pasa a requerir una densidad de energía negativa en todo el espacio, que tiende asintóticamente a cero en el infinito.

Una alternativa obvia es imaginar que se produce alguna transferencia de momento básica, en la que se expulsa masa en el proceso de crear el flujo de momento en la burbuja. De este modo, podría ser posible una especie de solución de tipo cohete que anulara los efectos de la aceleración para los pasajeros del interior. Sin embargo, este enfoque presenta también sus propios problemas, ya que la burbuja probablemente requiere grandes cantidades de materia para anular la aceleración en su interior, lo que exige una expulsión de masa aún mayor para acelerarse a sí misma y resulta rápidamente insostenible. Además, la construcción de la propia métrica que describe esta situación no se ha realizado en detalle hasta ahora más allá de los cohetes de fotones simples [22].

Podría obtenerse una mejor comprensión considerando el momento ADM [2], para el cual la conservación del cuadrimomento podría ser un elemento clave para entender las restricciones a las soluciones de curvatura al construir soluciones físicamente aceleradas con masa ADM. La pregunta clave a este respecto es si la «puesta en rotación» del motor de curvatura produce el movimiento hacia delante de toda la estructura sin necesidad de expulsar energía. El análisis de espaciotiempos no vacíos con condiciones de contorno distintas de las de Schwarzschild podría aportar información valiosa.

Otra alternativa es explorar el uso de la emisión focalizada de radiación gravitatoria como forma de acelerar los motores, frente a los métodos tradicionales de transferencia de momento, como se ha discutido recientemente en [20]. En el presente trabajo hemos supuesto que $du_i/dt = 0$ en la región de pasajeros durante la fase de aceleración del motor de curvatura, pero esto no es un requisito en las soluciones generales. Es posible que la presencia de un vector de desplazamiento no nulo no sea la fuente clave del transporte geodésico en todas las soluciones si en el volumen de pasajeros existen términos de lapso y términos espaciales de la métrica, construidos con cuidado, que varíen espacialmente. De hecho, en el escenario de expulsión de materia, el lapso y los términos espaciales variarán en el tiempo y en el espacio a lo largo de una hipersuperficie espacial dada. En última instancia, la cuestión de cómo lograr una aceleración física y eficiente es uno de los problemas principales de la investigación sobre motores de curvatura.

## 6. Conclusión

En este artículo hemos desarrollado la primera solución física de motor de curvatura subluminal a velocidad constante obtenida hasta la fecha que es plenamente coherente con las propiedades de transporte geodésico de la métrica de Alcubierre. Proporciona transporte geodésico de observadores y satisface a la vez la NEC, la WEC, la DEC y la SEC. Esta solución se construyó a partir de una cáscara estable de materia con un vector de desplazamiento modificado en su interior, lo que da lugar a una solución de curvatura con masa ADM positiva. El análisis y la construcción de la cáscara se realizaron con un nuevo conjunto de herramientas numéricas llamado Warp Factory, desarrollado por APL para la investigación sobre curvatura. Este nuevo y prometedor resultado supone un primer paso importante para entender qué hace físicas a las soluciones de curvatura. Además, el espaciotiempo de motor de curvatura construido aquí es un nuevo tipo de motor de curvatura que va más allá de la clase de Natário y, por tanto, no está sujeto al mismo alcance discutido en [9] y [18], debido a que utiliza términos espaciales modificados en la métrica. Esta nueva solución muestra que puede construirse un espaciotiempo de motor de curvatura a velocidad constante más genérico que satisfaga las condiciones de energía.

Nos proponemos seguir explorando esta solución y encontrar aspectos que optimizar para mejorar la razón masa-velocidad necesaria para mantener la fisicidad. El proceso de construcción de la métrica mediante suavizado puede sustituirse por una optimización directa en 1D de los perfiles radiales de densidad, presión y vector de desplazamiento, lo que posiblemente reduciría la masa necesaria en varios órdenes de magnitud. Además, la cuestión de acelerar el motor de forma eficiente sin perder la fisicidad es una línea de trabajo fundamental en el campo de la investigación sobre motores de curvatura. El código de las métricas y las figuras mostradas aquí se publicará como una actualización del código de Warp Factory.

Warp Factory está disponible en <https://github.com/NerdsWithAttitudes/WarpFactory>.

## Apéndice A. Análisis del error numérico

El uso de métodos numéricos impone limitaciones a la precisión de los resultados, debidas a las limitaciones de los métodos de diferencias finitas para resolver las ecuaciones de campo, a la representación del espaciotiempo con números de precisión limitada y a la discretización de la malla. Estos errores se resumen a continuación:

1. **Error de interpolación de esféricas a cartesianas:** La conversión de la métrica esférica a la métrica cartesiana utiliza polinomios de Legendre para interpolar puntos en $r$ a puntos en $x$, $y$ y $z$. Esta interpolación introduce errores en la métrica final.
2. **Error de discretización de las diferencias finitas:** Este error se debe a la discretización del espacio en una malla. Con una resolución espacial menor, los métodos de diferencias finitas se alejan de las verdaderas derivadas analíticas, ya que el paso del algoritmo de diferencias finitas es mayor. Este error es máximo cuando $f(x+h)-f(x)$ es grande en comparación con el paso $h$.
3. **Error de redondeo en coma flotante:** Los cálculos numéricos se realizan en doble precisión. Esto restringe el rango máximo posible de valores en coma flotante a unos 16 órdenes de magnitud. El solucionador de las ecuaciones de campo de Einstein está escrito para reducir la cancelación catastrófica de números pequeños, pero el límite de la doble precisión sigue restringiendo los resultados significativos del tensor de energía-momento y de las violaciones de las condiciones de energía a aquellos de magnitud superior a $10^{34}$.
4. **Error de truncamiento de las diferencias finitas:** Por último, el error de truncamiento de las diferencias finitas se produce cuando la serie infinita que calcula las derivadas se corta en el cuarto orden. Para el método de diferencias finitas de cuarto orden, el error de truncamiento está por debajo del umbral de error de redondeo de la doble precisión.

Como ejemplo del umbral de error en este análisis, podemos examinar los valores completos devueltos para las condiciones de energía en la figura A1 para la cáscara, la cáscara impulsada (Boosted Shell) y la cáscara de curvatura.

![Figura A1. Evaluación de las condiciones de energía hasta por debajo del umbral de la doble precisión para la cáscara y la cáscara de curvatura. Solo se muestran los valores que violan las condiciones. La región entre R_1 y R_2 está vacía, ya que no existe violación y solo se encuentran valores positivos para todos los observadores. No se observa ninguna desviación sistemática de los errores entre las métricas. Los valores del tensor de energía-momento en este trabajo son del orden de 10^39, lo que deja una diferencia respecto al umbral de ruido de alrededor de 10^-6.](figures/Error_All_Violation.png)

**Figura A1.** Evaluación de las condiciones de energía hasta por debajo del umbral de la doble precisión para la cáscara y la cáscara de curvatura. Solo se muestran los valores que violan las condiciones. La región entre $R_1$ y $R_2$ está vacía, ya que no existe violación y solo se encuentran valores positivos para todos los observadores. No se observa ninguna desviación sistemática de los errores entre las métricas. Los valores del tensor de energía-momento en este trabajo son del orden de $10^{39}$, lo que deja una diferencia respecto al umbral de ruido de alrededor de $10^{-6}$.

## Apéndice B. Transformación de Lorentz

El factor de Lorentz se define de la forma habitual:

$$
\gamma = \frac{1}{\sqrt{(1-\beta^2)}} \tag{B.1}
$$

Aplicar la transformación de Lorentz correspondiente a un impulso (boost) en la dirección x positiva a una métrica comóvil $g$ da lugar a la nueva métrica $g^\prime$, expresada en función de las componentes antiguas como:

$$
g'_{00} = \gamma^2 \left(g_{00} - 2\beta g_{01} + \beta^2 g_{11}\right) \tag{B.2}
$$

$$
g'_{01} = \gamma^2 \left( g_{01} - \beta g_{11} - \beta g_{00} + \beta^2 g_{01} \right) \tag{B.3}
$$

$$
g'_{10} = g'_{01} \tag{B.4}
$$

$$
g'_{02} = \gamma \left( g_{02} - \beta g_{12} \right) \tag{B.5}
$$

$$
g'_{20} = g'_{02} \tag{B.6}
$$

$$
g'_{03} = \gamma \left( g_{03} - \beta g_{13} \right) \tag{B.7}
$$

$$
g'_{30} = g'_{03} \tag{B.8}
$$

$$
g'_{11} = \gamma^2 \left( g_{11} + \beta^2 g_{00} - 2 \beta g_{01} \right) \tag{B.9}
$$

$$
g'_{12} = \gamma \left( g_{12} - \beta g_{02} \right) \tag{B.10}
$$

$$
g'_{21} = g'_{12} \tag{B.11}
$$

$$
g'_{13} = \gamma \left( g_{13} - \beta g_{03} \right) \tag{B.12}
$$

$$
g'_{31} = g'_{13} \tag{B.13}
$$

$$
g'_{22} = g_{22} \tag{B.14}
$$

$$
g'_{33} = g_{33} \tag{B.15}
$$

El sentido de la transformación es opuesto al sentido de $\beta$.

## Referencias

1. Miguel Alcubierre. LETTER TO THE EDITOR: The warp drive: hyper-fast travel within general relativity. *Classical and Quantum Gravity*, 11(5):L73–L77, mayo de 1994.
2. Richard Arnowitt, Stanley Deser y Charles W. Misner. Republication of: The dynamics of general relativity. *General Relativity and Gravitation*, 40(9):1997–2027, septiembre de 2008.
3. F. Bacchini, B. Ripperda, A. Y. Chen y L. Sironi. Generalized, Energy-conserving Numerical Simulations of Particles in General Relativity. I. Time-like and Null Geodesics. *Astrophysical Journal*, 237(1):6, julio de 2018.
4. Alexey Bobrick y Gianni Martire. Introducing physical warp drives. *Classical and Quantum Gravity*, 38(10):105009, mayo de 2021.
5. Leo Brewin. A simple expression for the ADM mass. *General Relativity and Gravitation*, 39(4):521–528, abril de 2007.
6. Sean M. Carroll. *Spacetime and geometry. An introduction to general relativity*. 2004.
7. L. Filipe O. Costa y José Natário. Frame-Dragging: Meaning, Myths, and Misconceptions. *Universe*, 7(10):388, octubre de 2021.
8. Allen E. Everett y Thomas A. Roman. Superluminal subway: The Krasnikov tube. *Physical Review D*, 56(4):2100–2108, agosto de 1997.
9. Shaun D. B. Fell y Lavinia Heisenberg. Positive energy warp drive from hidden geometric structures. *Classical and Quantum Gravity*, 38(15):155020, agosto de 2021.
10. L. H. Ford y Thomas A. Roman. Averaged energy conditions and quantum inequalities. *Physical Review D*, 51(8):4277–4286, abril de 1995.
11. Christopher Helmerich, Jared Fuchs, Alexey Bobrick, Luke Sellers, Brandon Melcher y Gianni Martire. Analyzing warp drive spacetimes with Warp Factory. *Classical and Quantum Gravity*, 41(9):095009, mayo de 2024.
12. Erik W. Lentz. Breaking the Warp Barrier: Hyper-Fast Solitons in Einstein-Maxwell-Plasma Theory. *arXiv e-prints*, arXiv:2006.07125, junio de 2020.
13. Erik W. Lentz. Hyper-Fast Positive Energy Warp Drives. *arXiv e-prints*, arXiv:2201.00652, diciembre de 2021.
14. José Natário. Warp drive with zero expansion. *Classical and Quantum Gravity*, 19(6):1157–1165, marzo de 2002.
15. Jessica Santiago, Sebastian Schuster y Matt Visser. Generic warp drives violate the null energy condition. *Physical Review D*, 105(6):064038, marzo de 2022.
16. Sebastian Schuster, Jessica Santiago y Matt Visser. ADM mass in warp drive spacetimes. *arXiv e-prints*, arXiv:2205.15950, mayo de 2022.
17. Irwin I. Shapiro. Fourth Test of General Relativity. *Physical Review Letters*, 13(26):789–791, diciembre de 1964.
18. Barak Shoshany y Ben Snodgrass. Warp Drives, Rest Frame Transitions, and Closed Timelike Curves. *arXiv e-prints*, arXiv:2309.10072, septiembre de 2023.
19. Chris Van Den Broeck. A 'warp drive' with more reasonable total energy requirements. *Classical and Quantum Gravity*, 16(12):3973–3979, diciembre de 1999.
20. Vijay Varma, Sylvia Biscoveanu, Tousif Islam, Feroz H. Shaik, Carl-Johan Haster, Maximiliano Isi, Will M. Farr, Scott E. Field y Salvatore Vitale. Evidence of Large Recoil Velocity from a Black Hole Merger Signal. *Physical Review Letters*, 128(19):191102, mayo de 2022.
21. Matt Visser, Bruce Bassett y Stefano Liberati. Perturbative superluminal censorship and the null energy condition. En C. P. Burgess y R. C. Myers, editores, *General Relativity and Relativistic Astrophysics*, volumen 493 de *American Institute of Physics Conference Series*, páginas 301–305, noviembre de 1999.
22. Y. Wang y X. Lin. Field of an arbitrarily accelerating charged point mass. En *Third Marcel Grossmann Meeting on General Relativity*, páginas 1001–1004, enero de 1983.

[^1]: En caso de que se desee una aceleración local, por ejemplo de 1g, el enunciado pasa a ser «la aceleración local de los pasajeros debe estar limitada».
[^2]: Despreciando la masa de los pasajeros.
[^3]: Quizá parte de la energía podría radiarse al infinito, pero esa energía debería estar causalmente conectada con la burbuja.
[^4]: El término espacial no unitario modificará la velocidad geodésica como $\gamma^{ij}\beta_{j}$
[^5]: En este trabajo invertimos el signo de esta condición en Warp Factory, de modo que los valores negativos indiquen violaciones en todas las condiciones de energía mostradas.
[^6]: Véase la función «smooth» de MATLAB para más detalles.
[^7]: Los valores concretos de la configuración se encontraron por ensayo y error. Enfoques mejorados podrían emplear técnicas más complejas que el simple suavizado por media móvil para resolver los problemas de violación en las fronteras.
[^8]: El parámetro de masa se elige para permitir la mayor cantidad posible de vector de desplazamiento en el motor manteniendo el equilibrio con la fisicidad, dada la distribución radial elegida para el vector de desplazamiento.
[^9]: Probablemente no se trata de un límite superior, ya que cabría considerar optimizaciones.
[^10]: Las métricas de curvatura de referencia se convierten a un sistema comóvil aplicando una transformación de Galileo a sus coordenadas.
[^11]: Un ejemplo son las trayectorias de fotones que circundan un agujero negro de Kerr, cuyo tiempo de tránsito difiere según viajen a favor o en contra de la rotación; el mismo efecto se produce aquí, salvo que estas trayectorias son rectas y atraviesan el centro de la burbuja de curvatura. En ambos ejemplos, las dos trayectorias están alineadas a favor o en contra del vector de desplazamiento [7].
[^12]: Las condiciones de energía completas se determinan contrayendo el conjunto de todos los observadores (nulos y de tipo tiempo) con el tensor, lo que pondera conjuntamente todos los elementos del tensor.
