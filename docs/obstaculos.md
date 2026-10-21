# Qué impide hoy un motor de curvatura útil

Síntesis de los obstáculos físicos, la evidencia que los sostiene y el trabajo reciente que apunta a salidas. Versión corta para la web: `apps/web/content/obstaculos/{es,en,fr}.yaml`. Las citas `[id]` remiten a `library/papers/<id>/`.

Convenio: $G = c = 1$ salvo que se indique; signatura $(-,+,+,+)$; formalismo 3+1

$$ds^2 = -\alpha^2 dt^2 + \gamma_{ij}\,(dx^i + \beta^i dt)(dx^j + \beta^j dt).$$

La **clase de Natário** es $\alpha = 1$, $\gamma_{ij} = \delta_{ij}$: toda la física está en el desplazamiento $\beta^i$. Alcubierre, Natário, Lentz y Fell-Heisenberg pertenecen a ella.

Estados: **bloqueante** (no se conoce salida dentro de la física establecida), **abierto** (sin resolver, con vías activas), **parcial** (resuelto en un caso restringido).

Las cifras marcadas «cálculo propio» salen de los parámetros publicados en el paper citado y de las fórmulas indicadas; no aparecen literalmente en la fuente.

## Resumen

| # | Obstáculo | Subsistema | Estado |
|---|---|---|---|
| 1 | Violación genérica de la NEC | C | bloqueante |
| 2 | Aceleración y momento | D | bloqueante |
| 3 | Energía negativa y desigualdades cuánticas | Q | bloqueante |
| 4 | Horizontes y control causal | G | bloqueante |
| 5 | Inestabilidad semiclásica | Q | bloqueante |
| 6 | Masa de la cáscara subluminal | P | abierto |
| 7 | Modelo de materia y ecuación de estado | E | abierto |
| 8 | Tensiones y estabilidad de la cáscara | S | abierto |
| 9 | Escala de Casimir | E | bloqueante |
| 10 | Partículas y frenado | M | abierto |
| 11 | Gravedad modificada | C | abierto |
| 12 | Dinámica en relatividad numérica | D | abierto |
| 13 | Verificación de condiciones de energía | V | parcial |
| 14 | Análogos de laboratorio | V | parcial |

La lectura de conjunto es la del `ROADMAP.md`, ahora con más soporte: lo único que la literatura sostiene sin trampas es una cáscara **subluminal**, de **energía positiva**, **con masa** y a **velocidad constante**. Todo lo demás (acelerar, ir más rápido que la luz, hacerlo con una masa razonable o con materia real) sigue sin solución.

---

## 1. Violación genérica de la NEC · C · bloqueante

### Física

La condición de energía nula exige $T_{\mu\nu}k^\mu k^\nu \ge 0$ para todo vector nulo $k^\mu$. No depende de ningún observador. La WEC, la SEC y la DEC la implican, así que si falla la NEC fallan todas.

En la clase de Natário, con $K_{ij} = \tfrac12(\partial_i\beta_j + \partial_j\beta_i)$ (el signo depende del convenio y no afecta a lo que sigue), la ligadura hamiltoniana da la densidad euleriana

$$16\pi\,\rho_E = K^2 - K_{ij}K^{ij} = \partial_i\!\left(\beta^i\,\partial_j\beta^j - \beta^j\,\partial_j\beta^i\right) - \tfrac14\,\omega_{ij}\,\omega^{ij}, \qquad \omega_{ij} = \partial_i\beta_j - \partial_j\beta_i .$$

En el sistema de la burbuja, $\beta^i$ tiende a una constante fuera y la divergencia total se anula al integrar:

$$\int_{\Sigma_t}\rho_E\,d^3x = -\frac{1}{64\pi}\int_{\Sigma_t}\omega_{ij}\,\omega^{ij}\,d^3x \;\le\; 0 .$$

La energía euleriana total nunca es positiva. Si el flujo es irrotacional, la integral es cero, así que o $\rho_E \equiv 0$ (no hay burbuja) o hay regiones negativas. Santiago, Schuster y Visser generalizan el argumento a todos los observadores y prueban que **la NEC se viola** en toda burbuja razonable de esta clase [santiago-2022]. Lobo y Visser ya habían mostrado que la violación persiste a velocidades arbitrariamente bajas [lobo-visser-2004]. Los ejemplos explícitos con masa confirman el resultado [schuster-2022].

### Evidencia

- Teorema de violación genérica de la NEC, con extensión a la condición de convergencia nula en gravedad modificada [santiago-2022].
- Cálculo explícito para Natário con masa: se violan NEC, WEC, SEC y DEC [schuster-2022].
- Violación a primer y segundo orden en la velocidad, en gravedad linealizada [lobo-visser-2004].
- Certificados globales por intervalos que confirman la violación de la NEC en las paredes de cuatro geometrías, a velocidad sub y supraluminal [le-2026].
- Nuevos teoremas de imposibilidad y revisión de errores en los modelos «físicos» [barzegar-2026].

### Vías de salida

- **Salir de la clase.** La cáscara de materia con desplazamiento interior tiene lapso y métrica espacial no triviales y masa ADM positiva. Cumple NEC, WEC, SEC y DEC a velocidad constante [fuchs-2024], dentro del marco general de [bobrick-martire-2021].
- **Flujos irrotacionales.** Con $\omega_{ij} = 0$ el tensor es de tipo Hawking-Ellis I en todo punto. Frente a Alcubierre y Natário con los mismos parámetros, el pico del déficit de energía propia baja unas 38 y 2600 veces. La energía propia neta es cero con cuatro decimales [rodal-2025c]. La NEC sigue violándose [le-2026]: es una mejora de grado, no de naturaleza.
- **Descripción covariante.** Los modelos actuales anulan por construcción la curvatura espacial, la aceleración y la vorticidad covariantes. Un marco con fluidos inclinados las incorpora [barzegar-2024, buchert-2026]. Aún no hay una solución que cumpla la NEC dentro de ese marco.

### Qué calcular aquí

- `physics/curvatura/metrics/natario.py`: métrica de Natário y test de la identidad de arriba, comprobando $\int\rho_E = -\frac{1}{64\pi}\int\omega^2$ con error relativo $<10^{-6}$.
- `library/equations/eulerian-energy-identity.yaml`: la identidad integral, con `paper: santiago-2022`.
- `physics/curvatura/metrics/rodal.py`: perfil irrotacional de [rodal-2025c]; reproducir el cociente $|E_+ - E_-|/(E_+ + E_-) \approx 4\times10^{-4}$.

---

## 2. Aceleración y momento · D · bloqueante

### Física

Toda solución publicada con energía positiva es **de velocidad constante** [fuchs-2024, bobrick-martire-2021]. Para que la burbuja sirva hay que arrancar, acelerar, frenar y parar.

En un espacio-tiempo asintóticamente plano, el cuadrimomento ADM

$$P_i = \frac{1}{8\pi}\oint_{S_\infty}\left(K_{ij} - K\,\gamma_{ij}\right)dS^j, \qquad M_{\rm ADM} = \frac{1}{16\pi}\oint_{S_\infty}\left(\partial_j\gamma_{ij} - \partial_i\gamma_{jj}\right)dS^i$$

solo cambia si hay flujo en el infinito (radiación o materia expulsada). Una cáscara con $M_{\rm ADM} > 0$ que cambia de velocidad cambia $P_i$, así que **necesita reacción**. Lobo y Visser ya señalaron que la burbuja sería un motor sin reacción [lobo-visser-2004], y Bobrick y Martire concluyen que toda burbuja es una cáscara que se mueve por inercia y requiere propulsión [bobrick-martire-2021].

El camino ingenuo falla: mover el centro de una cáscara con masa a lo largo de los cortes («Schwarzschild drive») obliga a introducir densidad de energía negativa en todo el espacio, que solo decae en el infinito [schuster-2022, fuchs-2024 §5.3].

En cortes planos, la ligadura de momento liga el momento euleriano a la vorticidad del desplazamiento,

$$8\pi\,j_i = D_j\!\left(K^{j}{}_{i} - \delta^{j}{}_{i}K\right) = \pm\tfrac12\,\partial_j\,\omega_{ji},$$

y el momento es idénticamente nulo exactamente para un gradiente más una rotación rígida [le-2026].

### Evidencia

- La propia solución física admite que la aceleración eficiente sin romper la fisicidad es uno de los problemas principales del campo [fuchs-2024].
- Masa ADM en burbujas de Natário y el ejemplo del Schwarzschild drive [schuster-2022].
- Toda burbuja requiere propulsión [bobrick-martire-2021].
- Motor sin reacción e implicaciones [lobo-visser-2004].

### Vías de salida

- Usar la relación momento-vorticidad para acotar qué perfiles pueden ganar momento sin flujo [le-2026].
- Tratar el campo como una variable dinámica con perturbaciones lagrangianas relativistas y soluciones de Szekeres; la aceleración deja de ser una amplitud impuesta [buchert-2026, barzegar-2024].
- Contabilizar el flujo de energía gravitacional en la fase acelerada; en el equivalente teleparalelo la energía total se conserva [carneiro-2022]. Ojo: la afirmación del mismo trabajo de que la energía negativa «puede ser un problema de marco» no salva la NEC, que no depende del observador.
- Propuesta de aceleración y frenado con energía negativa generada desde fuera, a lo largo de un tubo [pieri-2023]. Es supraluminal y depende de energía negativa.

### Qué calcular aquí

- `physics/curvatura/adm.py`: integrales de superficie de $M_{\rm ADM}$ y $P_i$ sobre esferas grandes; test con Schwarzschild boostado.
- Balance de cohete relativista para la cáscara de [fuchs-2024]: con $M = 4{,}49\times10^{27}$ kg, la masa expulsada para alcanzar $v$ con escape de fotones es $M\,[1 - \sqrt{(1-v)/(1+v)}]$; a $v = 0{,}04$ son unas $0{,}04\,M$, del orden de $10^{26}$ kg (cálculo propio, fórmula estándar del cohete de fotones).
- `solvers/cpp`: evolución de una cáscara con $v_s(t)$ suave y cálculo de $\rho_E$ y de la NEC en cada corte, para medir dónde y cuánto aparece la energía negativa.

---

## 3. Energía negativa y desigualdades cuánticas · Q · bloqueante

### Física

Los campos cuánticos permiten energía negativa local, pero limitada. Para un escalar sin masa en espacio plano, con un muestreo lorentziano de anchura $\tau_0$ [ford-roman-1996]:

$$\frac{\tau_0}{\pi}\int_{-\infty}^{\infty}\frac{\langle T_{\mu\nu}u^\mu u^\nu\rangle}{\tau^2 + \tau_0^2}\,d\tau \;\ge\; -\frac{3\hbar}{32\pi^2 c^3\tau_0^4}.$$

Aplicada a la pared, que es casi plana a escalas pequeñas frente a su radio de curvatura, da un grosor $\Delta \lesssim 10^2\,v_s\,\ell_P$ [pfenning-ford-1997]. La energía total de Alcubierre en el límite de pared delgada es

$$E \approx -\frac{v_s^2 R^2 \sigma}{36}, \qquad \sigma \sim \Delta^{-1}$$

(`library/equations/alcubierre-total-energy.yaml`). Con $R = 100$ m, $v_s = 1$ y $\Delta = 100\,\ell_P$ resulta $|E| \approx 2\times10^{62}$ kg (cálculo propio), en el orden que dan Pfenning y Ford.

Van Den Broeck reduce el volumen exterior y deja la energía negativa en unas pocas masas solares [vandenbroeck-1999]. Para Natário, el mínimo exacto de la energía euleriana negativa en pared delgada es [bolivar-2026]

$$\mathcal{E}_{\min} \sim \frac{v^2 R^4}{4\,\Delta^3},$$

$(R/\Delta)^2/4$ veces la estimación previa $v^2R^2/\Delta$ [lobo-visser-2004]. Con $R/\Delta = 100$ son 2500 veces más. El origen es el flujo de retorno que la incompresibilidad obliga a pasar por la pared. El problema variacional equivale al flujo de Stokes entre esferas concéntricas.

### Evidencia

- Desigualdad de Ford-Roman [ford-roman-1996] y revisión rigurosa de las desigualdades cuánticas (QEI) [fewster-2012b].
- Grosor de pared y energía total [pfenning-ford-1997].
- Reducción geométrica a masas solares [vandenbroeck-1999].
- Mínimo exacto para Natário [bolivar-2026].

### Vías de salida

- Calcular el suelo exacto de energía negativa de cada familia antes de optimizar [bolivar-2026]. Un perfil regularizado con longitud mínima da $E = -(15\pi/1024)\,v_s^2\,l$ en forma cerrada, aunque es un ansatz efectivo y no una deducción [jusufi-2026].
- Aplicar QEI rigurosas a líneas de universo estacionarias, que son las de un observador fijo respecto a la pared [fewster-2023], y las técnicas usadas para acotar agujeros de gusano [kontou-2024].
- Optimizar la geometría: reducciones de dos órdenes sobre Alcubierre [bobrick-martire-2021] y optimización numérica con Warp Factory [helmerich-2024b].
- Contraargumento a tener en cuenta: hay ejemplos donde la QEI no implica densidades de Planck [krasnikov-2002]. No cambia el orden de magnitud para burbujas macroscópicas.

### Qué calcular aquí

- `library/equations/natario-min-energy.yaml` (`paper: bolivar-2026`) y reproducción numérica en `physics/` resolviendo el problema de Stokes entre esferas.
- `library/equations/qi-wall-thickness.yaml` (`paper: pfenning-ford-1997`): $\Delta(v_s)$ y la energía total resultante.
- Integral de la QEI a lo largo de geodésicas que cruzan la pared, en `solvers/rust/src/geodesic.rs`, para cada métrica del proyecto.

---

## 4. Horizontes y control causal · G · bloqueante

### Física

En la coordenada comóvil $\xi = x - x_s(t)$ de Alcubierre, los rayos de luz sobre el eje cumplen

$$\frac{d\xi}{dt} = \pm 1 - v_s\,(1 - f(r_s)).$$

Si $v_s > 1$ hay puntos donde $v_s(1-f) = 1$: un horizonte de tipo agujero negro detrás y uno de tipo agujero blanco delante. Un observador en el centro no puede enviar señales al borde delantero de la pared. Por tanto **no puede crear, guiar ni detener** la burbuja [everett-roman-1997, alcubierre-2021].

El tubo de Krasnikov evita el problema, pero solo acorta viajes de ida y vuelta y exige construir el tubo a velocidad subluminal en el viaje de ida [krasnikov-1998, everett-roman-1997]. Con dos tubos o dos burbujas se construyen curvas temporales cerradas; para burbujas hay ya un modelo explícito con lapso no unitario [shoshany-2023]. Lentz reconoce los horizontes como desafío pendiente de sus solitones [lentz-2021b].

### Vías de salida

- Modelos de membranas que cumplen la WEC y proponen una transición sub-supraluminal; las membranas no son compactas [huey-2023].
- Energía generada fuera del vehículo, a lo largo de un tubo, que separa el control de la nave [pieri-2023]. Es infraestructura previa, como Krasnikov.
- Probar la protección de la cronología en análogos: es posible simular curvas no causales, pero no un horizonte cronológico completo [barcelo-2022b, sabin-2022].

### Qué calcular aquí

- `solvers/rust/src/geodesic.rs`: mapa de horizontes $v_s(1-f) = 1$ y de la región causalmente conectada con el centro, para cada métrica.
- `library/equations/warp-horizon.yaml`: condición de horizonte y gravedad superficial $\kappa = v_s\,|f'(r_h)|$.

---

## 5. Inestabilidad semiclásica · Q · bloqueante (supraluminal)

### Física

En 1+1 dimensiones, el tensor energía-momento renormalizado $\langle T_{\mu\nu}\rangle_{\rm ren}$ de un escalar conforme diverge cuando la velocidad aparente supera la de la luz [hiscock-1997]. Para burbujas creadas desde espacio plano, el centro recibe un flujo térmico de tipo Hawking con temperatura $\sim \hbar\kappa/(2\pi k_B)$, y en el horizonte delantero el tensor crece exponencialmente en el tiempo, con escala $\kappa^{-1}$ [finazzi-2009]. La retroacción desestabiliza la burbuja en cuanto se alcanza la supraluminalidad [barcelo-2010], y esto se lee como un mecanismo de protección de la cronología [liberati-2016].

### Vías de salida

- En 2+1 dimensiones o más, los puntos de desplazamiento al azul infinito son aislados y la acumulación total es finita. Formas y trayectorias «aerodinámicas» reducen aún más la energía acumulada [barcelo-2022]. Esto rebaja el obstáculo, pero falta el cálculo de $\langle T_{\mu\nu}\rangle_{\rm ren}$ en 3+1.
- En régimen subluminal no hay horizontes y el mecanismo no actúa [fuchs-2024, bobrick-martire-2021]. Queda sin calcular el tensor renormalizado en la cáscara de energía positiva.

### Qué calcular aquí

- `physics/`: $\langle T_{\mu\nu}\rangle_{\rm ren}$ en 1+1 para la sección axial de Alcubierre y de la cáscara de [fuchs-2024], con la anomalía de traza (método estándar en 2D). Reproducir primero la divergencia de [hiscock-1997].
- Localizar con `solvers/rust` los puntos de desplazamiento al azul infinito de [barcelo-2022] en cada métrica.

---

## 6. Masa de la cáscara subluminal · P · abierto

### Física

La solución de [fuchs-2024] es una cáscara entre $R_1 = 10$ m y $R_2 = 20$ m con $M = 4{,}49\times10^{27}$ kg (2,37 masas de Júpiter), exterior de Schwarzschild y un desplazamiento interior $\beta_{\rm warp} = 0{,}02$. El efecto es un arrastre lineal medible: dos rayos que cruzan el centro en sentidos opuestos difieren en $\delta t \approx 7{,}6$ ns.

Cálculo propio con esos parámetros:

$$\frac{2GM}{c^2 R_2} \approx 0{,}33, \qquad \bar\rho = \frac{M}{\tfrac43\pi(R_2^3 - R_1^3)} \approx 1{,}5\times10^{23}\ \text{kg/m}^3 \approx 7\times10^{5}\,\rho_{\rm nuc}.$$

La masa está acotada por la condición de no formar horizonte ($R > 2GM/c^2$), y el desplazamiento por la de que el flujo de momento euleriano no supere a la densidad de energía. El cociente masa/velocidad es el número de mérito; hoy es absurdo para cualquier uso.

### Evidencia

- Parámetros y condiciones [fuchs-2024].
- Marco general de cáscaras subluminales de energía positiva [bobrick-martire-2021].
- Distinción entre la masa de la burbuja, la de la carga y la del fondo [schuster-2022].

### Vías de salida

- Optimización directa de los perfiles radiales de $\rho$, $p$ y $\beta$ en lugar del suavizado; los autores esperan ahorros de órdenes de magnitud [fuchs-2024], con el optimizador de [helmerich-2024b].
- Buscar el máximo de $\beta_{\rm warp}$ para $M$ dada con certificados válidos para todos los observadores [le-2026].

### Qué calcular aquí

- `physics/curvatura/metrics/fuchs_shell.py`: reproducir la cáscara (TOV, suavizado, desplazamiento) y el test de rayos con $\delta t = 7{,}6$ ns en `solvers/rust`.
- **Frente de Pareto** $M$ / $\beta_{\rm warp}$ / tensión máxima (fase F2 del `ROADMAP.md`), con restricciones NEC, WEC y DEC por LMI.
- `library/equations/shell-compactness.yaml`: compacidad y densidad media como funciones de $M$, $R_1$ y $R_2$.

---

## 7. Modelo de materia y ecuación de estado · E · abierto

### Física

Las métricas se construyen al revés: se elige $g_{\mu\nu}$ y se lee $T_{\mu\nu} = G_{\mu\nu}/8\pi$. Falta el paso inverso: un $T_{\mu\nu}$ que venga de materia con ecuación de estado conocida y que, con $\nabla_\mu T^{\mu\nu} = 0$, genere la métrica.

- **Plasma de Lentz.** Se propusieron solitones supraluminales de energía positiva sostenidos por plasma conductor y campos electromagnéticos [lentz-2021]. Un cálculo directo muestra regiones de densidad euleriana negativa y varios errores de derivación. Una versión corregida sigue violando la WEC incluso para el observador euleriano [celmaster-2025]. Además, el soliton pertenece a la clase de Natário y cae bajo el teorema de [santiago-2022].
- **Fluidos en la forma de Alcubierre.** Con polvo o fluido isótropo en coordenadas cartesianas, la densidad resulta idénticamente nula: el «problema de la energía negativa» se convierte en ausencia de solución [abellan-2023]. Con fluido perfecto aparecen soluciones de densidad positiva, pero con función de forma compleja [santospereira-2021d].
- **Cáscara TOV.** La única fuente con ecuación de estado es la cáscara anisótropa de [fuchs-2024]. Es subluminal y no representa ningún material.

### Vías de salida

- Fluidos anisótropos en coordenadas esféricas, con soluciones numéricas en régimen estacionario y completo donde la masa total se mantiene positiva [abellan-2023b, bolivar-2025].
- Construir la fuente como fluido inclinado en un marco covariante [buchert-2026].
- Cerrar la cáscara TOV con una ecuación de estado explícita, $p_r = p_r(\rho)$ y $p_t = p_t(\rho)$, y comprobar que reproduce la métrica [fuchs-2024].

### Qué calcular aquí

- `physics/`: reproducir el contraejemplo de [celmaster-2025] sobre la métrica de [lentz-2021]. Es un test de regresión: si nuestro código no ve la densidad negativa, tiene un error.
- `physics/curvatura/sources/`: modelos de materia (polvo, fluido perfecto, anisótropo, Einstein-Maxwell) que devuelvan $T_{\mu\nu}$ y comparen con $G_{\mu\nu}/8\pi$ punto a punto.

---

## 8. Tensiones y estabilidad de la cáscara · S · abierto

### Física

La cáscara es un recipiente a presión de pared gruesa donde la carga es la gravedad propia. Con presiones anisótropas, el equilibrio es la TOV generalizada:

$$\frac{dp_r}{dr} = -\frac{(\rho + p_r)\,(m + 4\pi r^3 p_r)}{r^2\,(1 - 2m/r)} + \frac{2}{r}\,(p_t - p_r).$$

En el radio interior aparece un pico de tensión circunferencial, análogo a la tensión de aro de un cilindro, y todas las presiones deben quedar por debajo de $\rho c^2$ para cumplir la DEC [fuchs-2024]. Para los parámetros publicados, la TOV isótropa da $p(R_1) \approx 1\times10^{39}$ Pa $\approx 0{,}07\,\rho c^2$ (cálculo propio). Los materiales más resistentes rondan $10^{11}$ Pa: unos 28 órdenes de distancia.

Para una cáscara delgada entre interior plano y exterior de Schwarzschild, con materia causal, existe un radio exacto por debajo del cual no es estable ante perturbaciones radiales. Además se sabe que es inestable ante perturbaciones no radiales [idrissov-2026]. En Alcubierre, los invariantes de curvatura exigen cuatro capas distintas de tensor anisótropo [rodal-2025].

### Vías de salida

- El umbral radial delimita dónde tendría que actuar un mecanismo estabilizador [idrissov-2026].
- Agrandar la cáscara y reperfilar la densidad baja la presión necesaria [fuchs-2024], a costa de más masa total.

### Qué calcular aquí

- `solvers/cpp`: integrador TOV anisótropo y mapa $p_r(r)$, $p_t(r)$ con margen frente a la DEC.
- Estabilidad lineal radial (modos de Chandrasekhar) de la cáscara; reproducir el umbral de [idrissov-2026] en el límite de cáscara delgada.
- Analogía de ingeniería explícita: resistencia específica necesaria $p/\rho$ frente a la de materiales reales, en `docs/subsistemas/S-estructura.md` cuando se actualice.

---

## 9. Escala de Casimir · E · bloqueante

### Física

La única energía negativa medida en laboratorio es la de Casimir. Entre placas ideales [casimir-1948]:

$$\rho_C = -\frac{\pi^2\hbar c}{720\,a^4}, \qquad p_C = -\frac{\pi^2\hbar c}{240\,a^4}.$$

Da unos $-4\times10^{4}$ J/m³ a 10 nm y $-4\times10^{-4}$ J/m³ a 1 µm (`library/equations/casimir-energy.yaml`). La pared de Alcubierre en el ecuador tiene $|\rho_E| \approx v_s^2\sigma^2/(128\pi)$ en unidades geométricas. Con $\sigma = 1$ m⁻¹ y $v_s = 1$ son unos $3\times10^{41}$ J/m³, y $3\times10^{43}$ J/m³ con $\sigma = 10$ m⁻¹ (cálculo propio). La distancia es de unos 37 órdenes a 10 nm, y la pared de 1 m ya es mucho más gruesa de lo que permiten las QEI (obstáculo 3).

La fuerza entre placas paralelas se ha medido solo entre 0,5 y 3 µm, con un 15 % de precisión [bressi-2002]. Las QEI no se han puesto a prueba directamente; hay un primer análisis con datos de luz comprimida [maclay-2018].

### Vías de salida

- Medir la validez de las QEI con luz comprimida, donde la compresión llega ya a -15 dB [maclay-2018]. No acerca la escala, pero contrasta el límite que fija el obstáculo 3.
- Usar burbujas de radio muy pequeño como banco de pruebas: la energía total baja más de 70 órdenes frente a Alcubierre [pieri-2023]. No transportan nada macroscópico.

### Qué calcular aquí

- Gráfica de la web: $|\rho_E|$ requerida frente a $|\rho_C(a)|$ en función de $\sigma$, $v_s$ y $a$, con `library/equations/alcubierre-energy-density.yaml` y `casimir-energy.yaml`.
- Añadir la geometría real del experimento (placas finitas, conductividad) solo si se busca un banco de pruebas de QEI.

---

## 10. Partículas y frenado · M · abierto

### Física

Las partículas que entran por delante en la pared ganan mucha energía y quedan «bloqueadas en el tiempo»: pasan muy poco tiempo propio dentro. Al decelerar, la burbuja las libera hacia delante [mcmonigal-2012]. Una referencia simple es el desplazamiento Doppler

$$\frac{E_f}{E_i} = \sqrt{\frac{1+\beta}{1-\beta}}$$

(`library/equations/blueshift.yaml`), aunque en la pared el factor efectivo depende de la geodésica. El polvo y los fotones interestelares ejercen una presión proporcional a $v_s$, y la curvatura añade fuerzas que crecen como $v_s^2$ y $v_s^4$ [bian-2022]. Al frenar se emite un haz de partículas de alta energía [pieri-2023]. Una burbuja de tamaño de avión a más de unos 0,1 c en la atmósfera emitiría más de un teravatio; a baja velocidad no [fell-2026].

### Vías de salida

- Modificaciones de la burbuja que actúan como escudo deflector frente a polvo y proyectiles [sanches-2026].
- Formas y trayectorias aerodinámicas que limitan la acumulación de energía [barcelo-2022].

### Qué calcular aquí

- `solvers/rust/src/geodesic.rs`: geodésicas de partículas masivas y nulas en burbujas con $v_s(t)$, contando la energía acumulada y liberada al frenar. Reproducir primero las curvas de [mcmonigal-2012].
- Repetirlo en la cáscara de [fuchs-2024], que tiene masa y lapso no trivial: aquí la pared es materia y la partícula choca con ella.

---

## 11. Gravedad modificada · C · abierto

### Física

Fuera de la relatividad general, la condición geométrica relevante es la de convergencia nula, $R_{\mu\nu}k^\mu k^\nu \ge 0$. Una burbuja razonable la viola igualmente, así como la de convergencia temporal [santiago-2022].

Un acoplamiento variable $G^{\mu\nu} = \kappa(x)\,T^{\mu\nu}$ impuesto desde fuera choca con la identidad de Bianchi:

$$\nabla_\mu G^{\mu\nu} \equiv 0 \;\Rightarrow\; \nabla_\mu T^{\mu\nu} = -\,T^{\mu\nu}\,\partial_\mu\ln\kappa \neq 0 .$$

Si $\kappa$ se hace dinámico, se obtiene una teoría escalar-tensorial con una fuerza nueva de largo alcance, que las medidas del Sistema Solar y de púlsares excluyen con $|\gamma - 1| \lesssim 10^{-5}$ [rodal-2025d]. En Einstein-Cartan, el espín puede compensar la violación, con unas cotas mínimas de densidad de espín [debenedictis-2018]; no hay propuesta de qué materia la aportaría.

### Vías de salida

- Calcular la densidad de espín mínima y compararla con materia polarizada real [debenedictis-2018].
- Fondos gravitatorios externos (agujero negro, de Sitter) que reducen la violación en casos muy restringidos [garattini-2024, garattini-2025].

### Qué calcular aquí

- Nada prioritario. Mantener la entrada en la biblioteca y no invertir en ello hasta cerrar los obstáculos 2, 6 y 7 dentro de la relatividad general.

---

## 12. Dinámica en relatividad numérica · D · abierto

### Física

Todo el análisis anterior es estático: se toma una métrica y se lee su $T_{\mu\nu}$. Para saber si una burbuja existe hace falta resolver el problema de Cauchy: datos iniciales que cumplan las ligaduras

$$^{(3)}\!R + K^2 - K_{ij}K^{ij} = 16\pi\rho, \qquad D_j\!\left(K^{ij} - \gamma^{ij}K\right) = 8\pi j^i,$$

evolución con una formulación hiperbólica (BSSN o CCZ4) y una ecuación de estado que cierre la materia.

La única evolución 3+1 de la biblioteca simula el fallo de contención de una burbuja de Alcubierre con fluido de ecuación de estado rígida, y calcula la onda gravitacional y los flujos de energía [clough-2024]. No hay simulaciones de formación, aceleración o parada, ni de cáscaras de energía positiva. Warp Factory evalúa métricas, pero no las evoluciona [helmerich-2024]. Un análisis covariante encuentra una inestabilidad genérica del campo en uno de los dos ejemplos que estudia [buchert-2026].

### Vías de salida

- Evolucionar la cáscara de [fuchs-2024] con ecuación de estado física, siguiendo el método de [clough-2024], para medir su estabilidad y su forma de onda.
- Preparar plantillas de emisión electromagnética, de partículas y gravitacional [lentz-2024], y la firma atmosférica [fell-2026].

### Qué calcular aquí

- Datos iniciales que cumplan las ligaduras para la cáscara (resolver la ligadura hamiltoniana con método conforme) en `solvers/cpp`.
- Evolución en 1+1 con simetría esférica (cáscara sin desplazamiento) como primer paso realista, antes de 3+1.
- Comparar la energía radiada con la de [clough-2024] en el caso de Alcubierre.

---

## 13. Verificación de condiciones de energía · V · parcial

### Física

Comprobar solo al observador euleriano no basta: la WEC pide $T_{\mu\nu}u^\mu u^\nu \ge 0$ para **todo** $u^\mu$ temporal. Muestrear rapideces hasta un corte también se queda corto, porque la violación puede estar en direcciones casi nulas. El S-lema convierte cada condición en una desigualdad matricial lineal de $4\times4$ en una tétrada ortonormal; por ejemplo, para la NEC

$$T_{\hat a\hat b}\,k^{\hat a}k^{\hat b} \ge 0\ \ \forall\,k \text{ nulo} \iff \exists\,\lambda\in\mathbb{R}:\ T_{\hat a\hat b} + \lambda\,\eta_{\hat a\hat b} \succeq 0 ,$$

y la evaluación por intervalos da certificados puntuales y cotas globales en la pared [le-2026]. Para el perfil irrotacional, la lectura euleriana omite cerca del 73 % de las violaciones de la WEC en la pared [le-2026].

Errores documentados: afirmaciones de energía positiva basadas solo en observadores eulerianos [santiago-2022]; errores de derivación en Lentz [celmaster-2025]; invariantes de curvatura subestimados en 21 órdenes [rodal-2025b].

### Vías de salida

- Adoptar los certificados LMI e intervalos [le-2026].
- Validación cruzada con herramientas independientes e invariantes de curvatura, no solo componentes [helmerich-2024, rodal-2025].

### Qué calcular aquí

- `physics/curvatura/energy_conditions.py` usa hoy un barrido de direcciones y rapideces hasta $\eta = 3$. Añadir la prueba LMI (un problema de autovalores generalizado de $4\times4$ por punto) y comparar ambos métodos en la pared de Alcubierre.
- Test en CI: para cada métrica, NEC por LMI, WEC, SEC y DEC, más invariantes $R$, $r_1$, $r_2$, $w_2$ contra [rodal-2025] y [rodal-2025b].
- Puente MATLAB (`solvers/matlab`) con Warp Factory [helmerich-2024] para validar la cáscara de [fuchs-2024].

---

## 14. Análogos de laboratorio · V · parcial

### Física

La métrica acústica de un fluido irrotacional con velocidad $\mathbf{v}$ y velocidad del sonido $c_s$ es

$$ds^2 = \frac{\rho_0}{c_s}\left[-c_s^2\,dt^2 + (d\mathbf{x} - \mathbf{v}\,dt)^2\right],$$

idéntica en forma a Alcubierre con $\mathbf{v} = v_s f(r_s)\,\hat x$ (`library/equations/acoustic-metric.yaml`) [barcelo-2011]. Donde $|\mathbf{v}| = c_s$ hay horizonte acústico, con temperatura $T_H = \frac{\hbar}{2\pi k_B}\left|\partial_x(|\mathbf{v}| - c_s)\right|$.

Se ha medido la emisión estimulada de tipo Hawking en un canal de agua [weinfurtner-2011], y la espontánea y estacionaria en un condensado de Bose-Einstein [kolobov-2019]. Parte de los resultados en agua se obtuvieron en régimen débilmente no lineal [euve-2021]. Lo que un análogo **no** reproduce es la fuente: no hay ecuaciones de Einstein, ni tensor energía-momento, ni retroacción gravitatoria.

### Vías de salida

- Secciones 1+1 de Alcubierre con cadenas de SQUID en líneas de transmisión superconductoras, con la región óptima de parámetros ya calculada [sabin-2017], y curvas no causales en el mismo sistema [sabin-2022].
- Flujos transónicos 1D y 2D creados ópticamente en fluidos de luz [jacquet-2020b], y extracción de parámetros de espectros ruidosos con inferencia basada en simulación [solidoro-2026].

### Qué calcular aquí

- Diseño F5 del `ROADMAP.md`: perfil de canal hidráulico o de condensado con $v(x) = v_s f(x)$, horizontes y $T_H$, con `library/equations/acoustic-metric.yaml`.
- Predicción de conversión de modos en la pared delantera, para un experimento de onda estimulada en canal de agua.

---

## Diez papers recientes para estudiar primero

Ordenados por utilidad inmediata para este proyecto.

| # | Paper | Por qué |
|---|---|---|
| 1 | [fuchs-2024] | Única solución que cumple NEC, WEC, SEC y DEC. Tiene texto completo en la biblioteca y parámetros reproducibles: es la referencia de F1 y F2. |
| 2 | [santiago-2022] | El teorema que marca la frontera: qué familias están descartadas y por qué. Sin él se repiten los errores de 2021. |
| 3 | [le-2026] | Certificados LMI para todos los observadores y la relación momento-vorticidad. Corrige directamente `energy_conditions.py` y abre el problema de la aceleración. |
| 4 | [helmerich-2024] | Método de Warp Factory, la herramienta con la que se obtuvo [fuchs-2024]. Es el objetivo de la validación cruzada. |
| 5 | [bolivar-2026] | Mínimo exacto de energía negativa para Natário, en forma cerrada. Prueba analítica ideal para el motor de cálculo. |
| 6 | [schuster-2022] | Qué significa que una burbuja tenga masa y se mueva. Base para tratar $M_{\rm ADM}$ y $P_i$ en el obstáculo 2. |
| 7 | [clough-2024] | Única evolución 3+1. Modelo para la fase F4 y para obtener formas de onda. |
| 8 | [barcelo-2022] | Revisa la inestabilidad semiclásica en más de 1+1 dimensiones y la rebaja. Define qué calcular en Q. |
| 9 | [rodal-2025c] | Métrica analítica irrotacional de tipo I con cifras concretas. Buen segundo caso de prueba tras Alcubierre. |
| 10 | [celmaster-2025] | Desmonta la propuesta de plasma de Lentz con un cálculo directo. Sirve de test de regresión y de lección de método. |

Lectura complementaria: [bobrick-martire-2021] (marco general de cáscaras), [barzegar-2026] y [buchert-2026] (crítica covariante y teoremas nuevos), [idrissov-2026] (estabilidad de la cáscara) y [fell-2026] (firma observable).
