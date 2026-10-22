# Frente B · Masa de la cáscara (obstáculos 6 y 8)

Sprint de investigación de unos 35 minutos. Herramientas: solo el MCP `curvatura` (`buscar`, `ver_paper`, `leer_seccion`, `ecuaciones`, `lab_*`). Unidades SI salvo que se diga; $G = c = 1$ cuando se indica «geométricas».

Constantes usadas en el laboratorio: $G = 6{,}674\times10^{-11}$, $c = 2{,}998\times10^{8}$ m/s, $M_J = 1{,}898\times10^{27}$ kg, $M_\odot = 1{,}989\times10^{30}$ kg, $\varepsilon_0 = 8{,}854\times10^{-12}$, $m_e = 9{,}109\times10^{-31}$ kg, $e = 1{,}602\times10^{-19}$ C, $\hbar = 1{,}0546\times10^{-34}$ J·s.

Todo lo marcado **[estimación]** es un cálculo propio de orden de magnitud (factores O(1) inciertos). Lo marcado **[especulación]** no tiene cálculo ni cita.

## Resumen

| # | Idea | Qué hace con el coste | Cifra clave (laboratorio) | Veredicto |
|---|---|---|---|---|
| B1 | **Suelo de masa por el flujo de momento.** Poner densidad solo donde está el flujo de momento y engordar la pared | **Disuelve** parte (factor 5–22 frente a Fuchs) y fija una **ley**: $M \gtrsim \beta\,\bar R^2/(3\Delta)\cdot c^2/G$ | Geometría de Fuchs ($\beta=0{,}02$): suelo $0{,}11$–$0{,}48\,M_J$ frente a $2{,}37\,M_J$ publicado; [ashurst-2026] ya baja a $0{,}49\,M_J$ | **Prometedora.** Ley: $M \propto \beta R$ a forma fija |
| B2 | **Ley de materiales.** Tensión de aro y densidad de la materia ordinaria | **Declara ley** (no se disuelve) | $v_{\max} \approx 12\,\sigma/(\rho c) \approx 0{,}2$–$4$ m/s con $\sigma = 10^{11}$ Pa. La mejor cáscara de materia ordinaria: $\sim 1{,}1\times10^{6}$ m, $3{,}3\times10^{23}$ kg, $0{,}2$ m/s | **Ley.** Con materia de laboratorio el arrastre es de metros por segundo |
| B3 | **Cáscara cargada.** La repulsión eléctrica sostiene la cáscara en vez del material | **Mueve** el coste del material al campo (límite de Schwinger) y no toca la densidad | $\beta \le 3R\sqrt{4\pi\varepsilon_0 G}\,E_S/c^2$: $3{,}8\times10^{-8}$ (11 m/s) con $R = 10$ m; densidad aún $1{,}4\times10^{16}$ kg/m³ | **Descartada** como solución; útil como cota |

Descartadas en la lluvia de ideas: bolsillo de Van Den Broeck, cáscaras anidadas y rotación (ver abajo).

## Contradicción de partida (iteración 0)

- **Lo que pide la física.** La cáscara de [fuchs-2024] cumple NEC, WEC, DEC y SEC porque su densidad de energía euleriana supera al flujo de momento y a las presiones. Los autores lo dicen así: la densidad debe ser mayor que todos los demás términos del tensor juntos [fuchs-2024, «Positive Energy Density»].
- **Por qué la masa ADM queda atada a la cáscara.** Con la DEC, el teorema de masa positiva obliga a que un espaciotiempo asintóticamente plano con $M_{\rm ADM} = 0$ sea Minkowski [barzegar-2026]. Toda la densidad positiva que hace falta suma masa ADM. Y esa densidad está limitada por no formar horizonte, $R > 2GM/c^2$ [fuchs-2024].
- **Contradicción técnica.** Queremos **mucho** desplazamiento interior $\beta$ (para que haya efecto) y **poca** masa. Pero el desplazamiento crea flujo de momento en la pared, y ese flujo exige densidad positiva igual o mayor.
- **Cifras publicadas.** $R_1 = 10$ m, $R_2 = 20$ m, $M = 4{,}49\times10^{27}$ kg, $\beta = 0{,}02$ [fuchs-2024; parámetros repetidos en le-2026].

```
lab_evaluar("2*G*M/(c^2*a)", G=6.674e-11, M=4.49e27, c=2.998e8, a=20)   → 0,3334
lab_evaluar("k*a*c^2/G/j", k=0.1667, a=20, …, j=1.898e27)             → 2,366 M_J
```

Compacidad $2GM/(c^2R_2) = 0{,}333$ y $2{,}37\,M_J$: coincide con `docs/obstaculos.md` §6.

## Lluvia de ideas

Generadas con separación TRIZ (en el espacio, por escala, por condición), inversión y analogía. Las tres elegidas en negrita.

1. **Densidad solo donde está el flujo de momento; pared tan gruesa como se pueda (B1).** (espacio)
2. **Ley de materiales: ¿qué arrastre da la materia ordinaria? (B2).** (inversión: «no reducir la masa, sino preguntar qué velocidad compra»)
3. **Cáscara cargada: el campo eléctrico sostiene la pared (B3).** (condición)
4. Bolsillo de Van Den Broeck: pared de área pequeña, interior grande. → descartada, ver §Descartadas.
5. Cáscaras anidadas (matrioska): repartir $\beta$ en varias paredes. → descartada.
6. Rotación: soporte centrífugo y arrastre rotacional. → descartada para el arrastre lineal.
7. Enjambre en órbita (cúmulo de Einstein): soporte cinético sin resistencia de material. → se integra como arreglo de B2 **[especulación]**.
8. Perfil de desplazamiento con varias componentes (potencial escalar de Fell-Heisenberg) para repartir el flujo [fell-heisenberg-2021]. → queda para el optimizador.
9. Capas a contracorriente como fuente física del flujo de momento. → se integra en B1 como interpretación.

---

## B1 · Suelo de masa por el flujo de momento

### Mecanismo

En [fuchs-2024] la densidad es **constante** en toda la pared. Pero el flujo de momento solo está donde $\beta$ cambia. Los autores lo ven: el reparto conservador se puede mejorar «poniendo la densidad donde el flujo de momento es mayor» y esperan ahorros de órdenes de magnitud con un perfil optimizado [fuchs-2024, «Positive Energy Density» y «Conclusion»].

Idea: calcular el **suelo** de masa que impone la ligadura de momento con $\rho \ge |j|$ punto a punto.

### Literatura

- A favor: [fuchs-2024] Jared Fuchs, Christopher Helmerich, Alexey Bobrick et al. (2024). Constant velocity physical warp drive solution. Classical and Quantum Gravity 41, 095013. https://arxiv.org/abs/2405.02709
- A favor: [ashurst-2026] Owen Ashurst (2026). A lighter positive-energy warp shell with all energy conditions certified for every observer. Zenodo. https://doi.org/10.5281/zenodo.23459758 — misma $\beta = 0{,}02$ y $R_1/R_2 = 0{,}5$, $M/R_2 = 0{,}0346$ (geométricas), unas $0{,}49\,M_J$; certificado para todo observador. Solo tenemos la ficha; no revisado por pares.
- Herramienta: [le-2026] An T. Le (2026). Observer-robust energy condition verification for warp drive spacetimes. https://arxiv.org/abs/2602.18023 (reproduce la cáscara de Fuchs con $2M = 6{,}668692$ m).
- En contra / cautela: [barzegar-2026] Hamed Barzegar, Thomas Buchert, Quentin Vigneron (2026). General formalism, classification, and demystification of the current warp-drive spacetimes. https://arxiv.org/abs/2602.16495 — critica que en [fuchs-2024] no queda claro si la métrica es asintóticamente plana, y por tanto qué masa ADM tiene.

### Cálculos

**C1. Ligadura de momento para un desplazamiento en $x$.** Con lapso 1, métrica espacial plana y $\beta_i = \beta(x,y,z)\,\delta_{ix}$, $K_{ij} = -\tfrac12(\partial_i\beta_j + \partial_j\beta_i)$. Entonces $\partial_j K_{jx} - \partial_x K = -\tfrac12(\partial_y^2 + \partial_z^2)\beta$. Comprobado con una función de prueba explícita:

```
lab_igual(a="-(1/2)*(2*B_xx + B_yy + B_zz) + B_xx", b="-(1/2)*(B_yy + B_zz)")
  con B = exp(-x^2-2y^2-3z^2)*sin(x*y)                    → demostrada
```

Así que $8\pi j_x = -\tfrac12\,\nabla_\perp^2\beta$ (geométricas, campo débil).

**C2. Suelo de masa [estimación].** Si $\rho \ge |j|$ en cada punto, $M \gtrsim \int |j|\,dV$. Para un $\beta(r)$ radial que cae de $\beta$ a 0 en una pared de grosor $\Delta$ y radio medio $\bar R$: $\int 4\pi r^2|\beta''|dr \approx 4\pi\bar R^2 \cdot 2\beta/\Delta$, y el promedio angular de $\nabla_\perp^2$ aporta $2/3$. Resultado:

$$M_{\rm suelo} \approx \frac{\beta\,\bar R^2}{3\,\Delta}\;\frac{c^2}{G}.$$

Dimensiones:

```
lab_unidades("beta*R^2*c^2/(2*G*D)", beta=1, R=L, D=L, c=c, G=G)   → M   ✓
```

Si en vez del reparto óptimo la densidad sigue al máximo de $|j|$ (perfil de escalón con $\max|s''|$ mínimo, que vale 4) el factor sube a $\beta\bar R^2/\Delta$. Con un escalón suave $3u^2-2u^3$ ($\max|s''| = 6$), a $1{,}5\,\beta\bar R^2/\Delta$.

**C3. Números para la geometría de Fuchs** ($\bar R = 15$ m, $\Delta = 10$ m, $\beta = 0{,}02$), en unidades de $M/R_2$:

```
lab_evaluar("b*r^2/(d*a)*f", b=0.02, r=15, d=10, a=20, f=[0.3333, 1, 1.5])
  → [0,0075, 0,0225, 0,03375]
lab_evaluar("k*a*c^2/G/j", k=[0.0075, 0.0225, 0.03375], a=20, …)
  → [0,106, 0,319, 0,479] M_J
```

El valor de [ashurst-2026], $M/R_2 = 0{,}0346$, cae justo en la banda del escalón suave ($0{,}0338$). Es una comprobación independiente de la estimación, no una demostración. El suelo con reparto óptimo es unas **22 veces** menor que la masa de Fuchs.

**C4. Grosor óptimo [estimación].** Con el radio de pasajeros $R_1$ fijo, $\bar R = R_1 + \Delta/2$ y $\bar R^2/\Delta$ es mínimo en $\Delta = 2R_1$, donde vale $2R_1$. Entonces $M_{\rm suelo} \approx \tfrac23\,\beta R_1\,c^2/G$:

```
lab_evaluar("k*b*r*c^2/G", k=0.6667, b=[1e-6, 1e-4, 1e-3, 0.02], r=10, …)
  → [8,98e21, 8,98e23, 8,98e24, 1,80e26] kg
```

Para $\beta = 0{,}02$ y $R_1 = 10$ m: $1{,}8\times10^{26}$ kg $\approx 0{,}095\,M_J$. La ley es **lineal en $\beta$ y en $R_1$**.

**C5. Densidad media en el suelo.** $\bar\rho \approx \beta c^2/(12\pi G\Delta^2)$:

```
lab_evaluar("b*c^2/(12*pi*G*d^2)", b=0.02, d=10, …)   → 7,1e21 kg/m³
```

Sigue unas $10^{4}$ veces por encima de la densidad nuclear. El suelo baja la masa, no la hace «ordinaria».

### Impedimentos y arreglos (registro de iteraciones)

| Iteración | Impedimento | Arreglo o consecuencia |
|---|---|---|
| 1 | La estimación ignora presiones y el término de unión gravitatoria; la DEC pide $\rho \ge |p|$ además de $\rho \ge |j|$. | El suelo es una cota inferior aproximada. La cáscara también necesita presiones TOV (ver B2). Ashurst, con todo incluido, queda a ~4,6 veces del suelo óptimo. |
| 2 | $\rho = |j|$ significa materia que fluye a $u \to c$ respecto al observador euleriano. Con materia lenta, $\rho \ge |j|/u$ y la masa sube como $1/u$ **[estimación]**. | Interpretación: la pared debe llevar corrientes internas. Como $\int j_x\,dV = 0$ (el desplazamiento es compacto), son **dos capas a contracorriente** **[especulación sobre la realización]**. |
| 3 | [barzegar-2026] duda de que la masa ADM de [fuchs-2024] esté bien definida. | Exigir en nuestro optimizador exterior Schwarzschild exacto, como hace [le-2026]. Así la masa ADM es el parámetro $M$ sin ambigüedad. |

### Veredicto

**Prometedora, pero con ley.** Se puede **disolver** un factor de 5 a 22 en la geometría publicada (ya hay un factor 4,8 certificado [ashurst-2026]). No se disuelve la dependencia: $M \propto \beta R_1$. La masa es el precio del flujo de momento, no un defecto del diseño.

### Siguiente cálculo

Optimizador 1D de $\rho(r)$, $p_r(r)$, $p_t(r)$ y $\beta(r)$ con exterior Schwarzschild, que minimice $M$ a $\beta$ fija con certificados NEC/WEC/DEC/SEC por LMI [le-2026]. Barrer $\beta \in [10^{-4}, 0{,}1]$ y $\Delta/R_1 \in [0{,}5, 4]$ y ajustar $M/(\beta R_1)$. Predicción a falsar: pendiente 1 en $\beta$ y prefactor entre $0{,}67$ y $3$.

---

## B2 · Ley de materiales (tensiones y densidad)

### Mecanismo

La cáscara es un recipiente a presión cuya carga es su propia gravedad (obstáculo 8). Pregunta invertida: en vez de reducir la masa, **¿qué velocidad de arrastre compra un material real?**

### Literatura

- A favor (fórmula exacta de cáscara delgada): [berry-2022] Thomas Berry, Alex Simpson, Matt Visser (2022). General-relativistic thin-shell Dyson megaspheres. Physical Review D 106, 084001. https://arxiv.org/abs/2207.02465 — densidad superficial $\sigma_s = (1/4\pi a)(\sqrt{1-2m/a} - \sqrt{1-2M/a})$ y tensión $\Pi$ (Ec. 20–21).
- Estabilidad: [idrissov-2026] Anuar Idrissov (2026). Exact radial stability threshold for a Minkowski-Schwarzschild thin shell. https://arxiv.org/abs/2610.17629 — con materia causal no hay cáscara estable si $2M/a \gtrsim 0{,}844$; además se sabe que es inestable ante perturbaciones no radiales.
- Contexto: [bobrick-martire-2021] Alexey Bobrick, Gianni Martire (2021). Introducing physical warp drives. Classical and Quantum Gravity 38, 105009. https://arxiv.org/abs/2102.06824 — un motor subluminal es una cáscara que se mueve por inercia; necesita propulsión.
- Resistencia de materiales: `docs/obstaculos.md` §8 usa $\sim 10^{11}$ Pa. No he encontrado en la base un paper con resistencia y densidad del grafeno; las densidades de material de abajo son **supuestos**.

### Cálculos

**C1. Tensión específica de una cáscara delgada.** Con $m = 0$ en [berry-2022], el cociente $\Pi/\sigma_s$ dividido por $x = M/a$:

```
lab_evaluar("((1-x)/sqrt(1-2x) - 1)/(2(1 - sqrt(1-2x)))/x", x=[0.001, 0.0346, 0.1, 0.1667, 0.3, 0.4])
  → [0,2504, 0,2638, 0,2951, 0,3371, 0,4843, 0,7725]
lab_cota(… - x/4 >= 0, x∈[1e-6, 0.4])  → 97,6 % del dominio demostrado, sin contraejemplo
```

Así que $p/\rho \gtrsim \tfrac14\,GM/(Rc^2)$, con igualdad en el límite newtoniano.

**C2. Ley de tensión [estimación].** De B1, $\beta \approx 3\,(M/\bar R)(\Delta/\bar R)$ (geométricas) y $\Delta/\bar R \le 1$. Con C1: $\sigma/\rho \gtrsim \beta c^2/12$. La velocidad máxima de arrastre con un material de resistencia $\sigma$ y densidad $\rho$:

$$v_{\max} \approx \frac{12\,\sigma}{\rho\,c}.$$

```
lab_evaluar("12*s/(p*c)", s=1e11, p=[1000, 2000, 20000], c=2.998e8)
  → [4,0, 2,0, 0,20] m/s
```

No depende del tamaño. Para la $\beta = 0{,}02$ de Fuchs harían falta $\sigma/\rho \approx 1{,}5\times10^{14}$ J/kg.

**C3. Ley de densidad [estimación].** La materia ordinaria tiene $\rho$ fija por los átomos. De C5 de B1, $\Delta \gtrsim \sqrt{\beta c^2/(12\pi G\rho)}$ y $M \approx (\beta c^2/3G)\,\Delta$, así que $M \propto \beta^{3/2}\rho^{-1/2}$. Con $\rho = 2\times10^4$ kg/m³ (supuesto, metal denso):

```
lab_evaluar("sqrt(b*c^2/(12*pi*G*p))", b=[1e-12, 1e-9, 1e-6, 1e-4], p=2e4)
  → [4,2e4, 1,3e6, 4,2e7, 4,2e8] m
lab_evaluar("b*c^2/(3G)*sqrt(…)/s", …, s=1.989e30)
  → [9,5e-12, 3,0e-7, 9,5e-3, 9,5] M_sun
```

**C4. La mejor cáscara de materia ordinaria.** Ambas leyes se cruzan en $\beta \approx 12\sigma/(\rho c^2) = 6{,}67\times10^{-10}$ para $\rho = 2\times10^4$ kg/m³:

```
lab_evaluar("sqrt(b*c^2/(12*pi*G*p))", b=6.67e-10, p=2e4)       → 1,09e6 m
lab_evaluar("b*c^2/(3G)*sqrt(b*c^2/(12*pi*G*p))", b=6.67e-10, …) → 3,27e23 kg
```

Una cáscara de unos 1100 km de grosor y $3{,}3\times10^{23}$ kg arrastra su interior a **0,2 m/s**.

### Impedimentos y arreglos (registro de iteraciones)

| Iteración | Impedimento | Arreglo o consecuencia |
|---|---|---|
| 1 | La resistencia del material limita $v$ a metros por segundo. | Soporte cinético: un enjambre de cuerpos en órbita (cúmulo de Einstein) no necesita resistencia **[especulación; no hay paper en la base]**. Pero la densidad media del enjambre sigue por debajo de la del material: la ley C3 sigue en pie. Para $v = 300$ m/s ($\beta = 10^{-6}$): $9{,}5\times10^{-3}\,M_\odot$ repartidas en $4\times10^7$ m. |
| 2 | La fórmula de C1 es de cáscara delgada; la de Fuchs es gruesa. | El doc da $p(R_1) \approx 0{,}07\,\rho c^2$ para Fuchs; C1 da $0{,}337\times 0{,}22 \approx 0{,}074$ con $x = M/\bar R$. Mismo orden. |
| 3 | Estabilidad: cerca de $2M/a \approx 0{,}84$ ninguna pared causal es estable radialmente, y hay inestabilidad no radial [idrissov-2026]. | Las cáscaras de C4 tienen $M/R \sim 10^{-10}$: muy lejos del umbral radial. El problema no radial queda abierto. |

### Veredicto

**Ley.** Con materia de laboratorio, el arrastre lineal de una cáscara de energía positiva es de **metros por segundo**, sea cual sea su tamaño. La cáscara de Fuchs solo funciona porque su densidad media ($1{,}5\times10^{23}$ kg/m³) es la de un objeto más denso que una estrella de neutrones. Esto es coherente con [bobrick-martire-2021]: el motor subluminal es una cáscara que viaja por inercia; el arrastre interior es pequeño y la cáscara necesita propulsión aparte.

### Siguiente cálculo

Integrador TOV anisótropo (`solvers/cpp`) que, para cada $\beta$, devuelva el mínimo de $\max(p_t/\rho)$. Contrastar el factor 12 de C2. Añadir la ecuación de estado de un sólido real ($\rho$ fija) para convertir C3–C4 en una curva exacta.

---

## B3 · Cáscara cargada

### Mecanismo

Si la cáscara lleva carga $Q$, la repulsión eléctrica empuja hacia fuera y quita trabajo al material. Con balance exacto, la tensión mecánica es cero.

### Literatura

- A favor (fuentes cargadas en motores de curvatura): [santospereira-2021c] Osvaldo L. Santos-Pereira, Everton M. C. Abreu, Marcelo B. Ribeiro (2021). Charged dust solutions for the warp drive spacetime. Gen. Rel. Grav. 53, 23. https://arxiv.org/abs/2102.05119
- A favor (cáscara cargada en coordenadas de Painlevé-Gullstrand): [abellan-2025] G. Abellán, N. Bolívar, I. Vasilev (2025). Gravitational Effects of Sources Inspired by ideal Electromagnetic Fields in Spherical Painlevé-Gullstrand Coordinates. Annals of Physics 485, 170300. https://arxiv.org/abs/2512.16109
- En contra (límite de campo): campo crítico de Schwinger para producción de pares, $E_c \propto \hbar m_e^2/e$ [alencar-2023; Sauter-Schwinger citado en alvarezdominguez-2025].

### Cálculos

**C1. Balance de fuerzas (cáscara delgada, newtoniano).** Presión eléctrica $Q^2/(32\pi^2\varepsilon_0R^4)$ contra presión gravitatoria $GM^2/(8\pi R^4)$. Con $Q = M\sqrt{4\pi\varepsilon_0 G}$:

```
lab_igual(a="(M*sqrt(4*pi*k*G))^2/(32*pi^2*k*R^4)", b="G*M^2/(8*pi*R^4)")   → demostrada
```

**C2. Límite de Schwinger.**

```
lab_evaluar("m^2*c^3/(q*h)", m=9.109e-31, c=2.998e8, q=1.602e-19, h=1.0546e-34)   → 1,32e18 V/m
```

**C3. Velocidad máxima [estimación].** Con $M \approx \beta R c^2/(3G)$ (B1, pared gruesa), el campo en la superficie es $E = \beta c^2/(3R\sqrt{4\pi\varepsilon_0 G})$. Pedir $E < E_S$:

```
lab_unidades("r*sqrt(k*G)*E/c^2", k=ε0, …)   → adimensional ✓
lab_evaluar("3*r*sqrt(4*pi*k*G)*E/c^2", r=[1, 10, 100, 1000], E=1.32e18, …)
  → [3,8e-9, 3,8e-8, 3,8e-7, 3,8e-6]
```

Con $R = 10$ m, $\beta \le 3{,}8\times10^{-8}$ (11 m/s). Con $R = 1$ km, $3{,}8\times10^{-6}$ (1,1 km/s).

**C4. Lo que no cambia: masa y densidad.**

```
lab_evaluar("b*r*c^2/(3G)", b=[3.8e-8, 3.8e-6], r=[10, 1000])        → [1,7e20, 1,7e24] kg
lab_evaluar("b*c^2/(12*pi*G*d^2)", b=[3.8e-8, 3.8e-6], d=[10, 1000]) → [1,4e16, 1,4e14] kg/m³
```

### Impedimentos y arreglos (registro de iteraciones)

| Iteración | Impedimento | Arreglo o consecuencia |
|---|---|---|
| 1 | El campo supera el límite de Schwinger y descarga la cáscara. | Crecer $R$: el límite sube como $R$. Pero la masa también sube como $\beta R$. |
| 2 | La carga quita tensión, no densidad: la pared sigue a $10^{14}$–$10^{16}$ kg/m³. | Sin arreglo con materia ordinaria. El coste se **mueve** del material al campo. |
| 3 | Una cáscara con $Q \approx M$ (geométricas) es casi extrema; su estabilidad no está estudiada aquí. | Queda abierto. Sin cálculo. |

### Veredicto

**Descartada** como solución. Útil como cota: ni con soporte eléctrico ideal se pasa de km/s en cáscaras de un kilómetro, y la densidad sigue siendo nuclear.

### Siguiente cálculo

Ninguno prioritario. Si se retoma: TOV de Einstein-Maxwell con exterior de Reissner-Nordström y el criterio de [idrissov-2026] adaptado a carga.

---

## Descartadas en la lluvia de ideas

- **Bolsillo de Van Den Broeck.** La transición del bolsillo necesita energía negativa; Warp Factory la ve con anillos de violación [helmerich-2024: Christopher Helmerich, Jared Fuchs, Alexey Bobrick et al. (2024). Analyzing warp drive spacetimes with Warp Factory. Classical and Quantum Gravity 41, 095009. https://arxiv.org/abs/2404.03095]. Además la energía total escala como $B(0)^2$ y es comparable a Alcubierre [bobrick-martire-2021]. Versión de energía positiva («bolsa de oro» de Wheeler, mencionada en [bao-2020]): **[especulación]** en datos estáticos, un cuello de área mínima es una superficie atrapada marginal y daría horizonte. Falta cita en la base (desigualdad de Penrose riemanniana).
- **Cáscaras anidadas.** En campo débil la ligadura de momento es lineal: los saltos de $\beta$ se suman y las masas también. No hay economía de escala **[estimación]**. Solo mueve el coste.
- **Rotación.** Da arrastre rotacional, no lineal. El soporte centrífugo solo vale en el ecuador. Sin cálculo en este sprint.

## Para soluciones.md

- **Ley de escala de la masa (B1):** $M \gtrsim \beta\,\bar R^2/(3\Delta)\cdot c^2/G$; con pared óptima $\Delta = 2R_1$, $M \approx \tfrac23\beta R_1 c^2/G$ ($0{,}095\,M_J$ para $\beta = 0{,}02$, $R_1 = 10$ m). La masa de [fuchs-2024] se puede bajar unas 5–22 veces; [ashurst-2026] ya certifica 4,8. Siguiente: optimizador 1D con certificados LMI [le-2026].
- **Ley de materiales (B2):** con materia de laboratorio, $v_{\rm arrastre} \lesssim 12\,\sigma/(\rho c) \approx 0{,}2$–$4$ m/s, para cualquier tamaño. La mejor cáscara de metal denso mide $\sim 10^6$ m y pesa $3{,}3\times10^{23}$ kg para 0,2 m/s.
- **Lo que no funciona:** carga eléctrica (mueve el coste al límite de Schwinger), Van Den Broeck (necesita energía negativa) y cáscaras anidadas (sin economía de escala).
