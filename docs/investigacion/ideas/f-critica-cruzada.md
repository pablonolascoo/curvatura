# Frente F · Crítica cruzada (abogado del diablo)

> Generado por un agente de IA el 2026-10-22 (sprint de unos 25 minutos). Revisa los informes A–E de esta carpeta. Herramientas: solo el MCP `curvatura` (`buscar`, `lab_*`) y los protocolos `the-fool` (modo «probar la evidencia») y `auditoria-teoremas`. Cada cifra sale de una ejecución del laboratorio indicada o de un paper citado. Constantes: $c = 299\,792\,458$ m/s, $G = 6{,}6743\times10^{-11}$, $M_J = 1{,}898\times10^{27}$ kg.

## Tesis reforzada (steelman)

El programa combinado dice: una cáscara subluminal de energía positiva (tipo [fuchs-2024]) cumple todas las condiciones de energía. Se puede aligerar (B1). No hace falta acelerarla: se ensambla ya en movimiento (C). Se hace con materia a densidad nuclear, la única fuente real cercana (E). Al ser subluminal no tiene horizontes (D). Por tanto es «física conocida» y solo falta ingeniería.

## 1. Afirmaciones comprobadas

| # | Afirmación | Frente | Veredicto | Valor corregido | Nota |
|---|---|---|---|---|---|
| a1 | $M_{\rm suelo} \approx \tfrac23\beta R_1 c^2/G$ al elegir $\Delta = 2R_1$ | B1 | **Álgebra confirmada** | — | `lab_igual` demostrada. `lab_z3`: $(R+\Delta/2)^2/\Delta \ge 2R$ demostrada para $R,\Delta>0$, así que $\Delta=2R_1$ es el mínimo de esa expresión. |
| a2 | $1{,}8\times10^{26}$ kg $= 0{,}095\,M_J$ para $\beta=0{,}02$, $R_1=10$ m | B1 | **Número confirmado** | $1{,}795\times10^{26}$ kg $= 0{,}0946\,M_J$ (`lab_evaluar`) | Pero la fórmula de partida está incompleta (fila a3). |
| a3 | $8\pi j_x = -\tfrac12\nabla_\perp^2\beta$ y, en pared delgada, $\nabla_\perp^2\beta \approx \beta''\sin^2\theta$ | B1 | **Incompleta** | $\nabla_\perp^2\beta = \beta''\sin^2\theta + (\beta'/r)(1+\cos^2\theta)$ | `lab_igual` demostrada con $\beta = e^{-r^2}$. B1 tira el término $\beta'/r$, que solo es despreciable si $\Delta \ll \bar R$. En el «óptimo» $\Delta = 2R_1$ vale $\Delta/\bar R = 1$: la aproximación falla justo donde se usa. |
| a4 | Suelo «22× menor que Fuchs» y «5–22×» | B1 | **Erróneo (optimista ×2)** | Con el término completo y escalón suave $3u^2-2u^3$: $\int|j|\,dV = 0{,}258$ m ($\Delta=20$), $0{,}260$ m ($\Delta=10$), $0{,}327$ m ($\Delta=40$) en geométricas. En kg: $3{,}5\times10^{26}$ kg $= 0{,}18\,M_J$. Con perfil de rampa (pliegues) sale $0{,}30$ m. Factor real frente a Fuchs ($3{,}334$ m): **≈ 13×**, no 22× | `lab_barrido` (CPU, $1{,}6\times10^7$ puntos) del integrando exacto en $r$ y $\cos\theta$. La rampa, analítica, con `lab_evaluar`. Sigue siendo campo débil, lapso 1 y métrica espacial plana: no vale a compacidad 0,33. Ashurst ($0{,}692$ m [ashurst-2026]) queda a ~2,7× del suelo corregido, no a 4,6×. |
| a5 | La masa es lineal en $\beta$ y en $R_1$ | B1 | **Confirmado a forma fija** | — | Es escalado dimensional de un problema lineal en $\beta$ (campo débil). Fuera de campo débil, no demostrado. |
| b1 | $\kappa = 2\sigma(1-1/v)$ | D | **Confirmado** | — | `lab_igual` demostrada. Supuestos no dichos del todo: perfil tanh con $\sigma R \gg 1$, lapso 1, eje de la burbuja, $\kappa$ medido en el sistema comóvil. |
| b2 | $\bar v = 1{,}93\,c$ con $v=10$, $u=0{,}9$, $G=10$ | D | **Número confirmado** | $1{,}9321$ (`lab_evaluar`) | Independiente de $\Delta$: cierto, porque $\tau_s$ y $\tau_b$ escalan los dos con $\Delta$. Pero el modelo omite el tiempo de las transiciones $u \leftrightarrow v$ y su coste de momento (contradicción 2). Es una cota superior optimista. |
| c1 | Energía cinética $8{,}07\times10^{40}$ J a $v=0{,}02$ | C | **Número confirmado; supuesto incompleto** | $8{,}073\times10^{40}$ J (`lab_evaluar`) | Usa la masa ADM de Fuchs. La materia antes de ensamblarse tiene más masa en reposo (la energía de ligadura de una cáscara de compacidad 0,33 se radia al formarla). Es una cota inferior, no «el coste mínimo». |
| c2 | «99 veces menos que un cohete de fotones» | C | **Casi confirmado** | ≈ **101** si se compara con la energía cinética de la masa **final** del cohete | `lab_evaluar`. C compara con la cinética de la masa inicial. Por eso su `lab_cota` «falla en $v=0{,}866$». Con la masa final, el cohete gasta siempre más que la cinética: `lab_cota` **demostrada** en $v\in[10^{-4};\,0{,}999]$. Además «99× menos» supone un medio de reacción infinito y eficiencia 1; la infraestructura real no es gratis. |
| d1 | $|\rho| \lesssim \hbar c/L^4$ como «ley» de toda energía negativa cuántica | E | **Mal justificado** | — | Para Casimir la escala sale de la separación de placas, no de la QEI. El propio frente A dice que las QEI de Ford-Roman no se aplican con fronteras [kontou-2015b]. La relación es un argumento de escala, no un teorema. La conclusión numérica no cambia. |
| d2 | $L = 1{,}53\sqrt{\ell_P/(\beta\sigma)} \approx 0{,}2$ fm (pared ~100 m, $\beta=0{,}1$) | E | **Confirmado** | $(128\pi^3/720)^{1/4} = 1{,}532$; $L = 1{,}95\times10^{-16}$ m ($\sigma=0{,}01$) y $1{,}95\times10^{-17}$ m ($\sigma=1$) | `lab_evaluar`. El prefactor es el de Casimir ideal, no el de «$\hbar c/L^4$»: hay que decirlo. |
| d3 | Energía total de Alcubierre $1{,}2\times10^{46}$ J ($\sigma=1$, $R=100$ m, $v=0{,}1$) | E | **36× alta para el perfil tanh** | $3{,}36\times10^{44}$ J | E usa la estimación de orden de magnitud $M_{\rm warp}\approx -v^2R^2\sigma$ [lobo-visser-2004]. Para tanh, $\int (f')^2 dr = \sigma/3$ (comprobado: $\int{\rm sech}^4 = 4/3$, `lab_barrido`), y sale $v^2R^2\sigma/36$, que es lo que usa A3. A y E no son coherentes entre sí. |
| e1 | Z3: pila de Casimir sin violación promediada de la NEC si $\sigma_m \ge 10^{-6}$ kg/m² y $a \ge 10^{-10}$ m | A1 | **Confirmado, pero trivial** | Margen $5{,}2\times10^{7}$ en la esquina del dominio (`lab_evaluar`) | `lab_z3` demostrada otra vez. La prueba solo cubre la dirección nula normal. Supone sin decirlo que $T_{zz}$ es continuo a través de la pila (equilibrio estático), y que separadores y placas cumplen la NEC en las direcciones paralelas. Con eso el balance de A1 es correcto. |
| e2 | $v/c \approx 3{,}8\times10^{-17}$ con Casimir a 1 nm y $\sigma = 1$ | A1 | **Confirmado** (cálculo propio coincidente) | — | Mismo $|\rho_C| = 4{,}3\times10^8$ J/m³ que E. Coherente. |

## 2. Contradicciones entre frentes

1. **B1 (más ligera) contra E (densidad nuclear).** No se pueden tener las dos cosas. El suelo de B1 a $\Delta = 10$ m pide $\bar\rho \approx 7{,}1\times10^{21}$ kg/m³, unas $2{,}6\times10^4$ veces la densidad nuclear (B, C5). Si se limita la densidad a la nuclear, la ley C3 de B fija el grosor: $\Delta = 1627$ m con $2{,}7\times10^{17}$ kg/m³ y $634$ m con $1{,}78\times10^{18}$ kg/m³ (`lab_evaluar`). La masa entonces es $\beta c^2\Delta/(3G)$ = **7,7 y 3,0 $M_J$** (`lab_evaluar`). Es **más** que la de Fuchs (2,37 $M_J$). «Más ligera» y «materia nuclear» van en sentidos opuestos.
2. **E (5,9 km) contra B (0,6–1,6 km).** E escala la cáscara de Fuchs a compacidad fija ($\bar\rho \propto R^{-2}$, supuesto suyo) y pide 5,9 km. La ley de densidad de B da 0,63 km para la misma densidad. Difieren en un factor ~9. Ninguna de las dos está calculada con TOV.
3. **C usa la masa de Fuchs; B dice que sobra.** Todas las cifras de C escalan con $M$. Con el suelo corregido (a4) bajan ~13×. Con materia nuclear (contradicción 1) suben de 1,3 a 3,3×.
4. **D-B (burbuja que respira) contra C y contra el teorema de Olum.** D-B cambia de $0{,}9c$ a $10c$ unas $10^{6}$–$10^{13}$ veces. Cada cambio de $v$ es un cambio de objeto, de masa y de momento [bobrick-martire-2021, «Constructing warp drives»]. C demuestra que eso exige flujo al infinito o un tercer cuerpo. Además la fase supralumínica viola la WEC [olum-1998]. D-B no encaja en un programa de energía positiva.
5. **A1 contra E sobre la QEI.** A1: las fronteras esquivan la QEI de espacio libre. E: «$\hbar c/L^4$ es la QI misma». Ver d1.
6. **A3 contra E sobre la energía de Alcubierre.** Factor 36 (ver d3).
7. **C da por buena la solución de Fuchs; B la pone en duda.** B cita la crítica de [barzegar-2026], pero C y E construyen encima sin matiz (ver objeción 1).

## 3. Objeciones al programa combinado

Auditoría con la lista de `auditoria-teoremas`.

| Resultado | Dictamen | Por qué |
|---|---|---|
| Condiciones de energía puntuales | **Evita** (si la solución existe) | Fuera de la clase de Natário: lapso ≠ 1 y métrica espacial no plana. [santiago-2022] avisa de que esos casos «must be directly addressed using different techniques». |
| QEI | **Evita** | No hay energía negativa. |
| Masa positiva | **Cumple, y eso es el coste** | La masa ADM es positiva y grande. Con DEC y masa ADM cero solo queda Minkowski [barzegar-2026]. |
| Superlumínico exige energía negativa | **Evita al renunciar** | [olum-1998]: «superluminal travel requires weak-energy-condition violation». El programa es subluminal. |
| Horizontes | **Evita** | $v<1$ (frente D, idea C). |
| Conservación del cuadrimomento | **Mueve el coste** | «Achieving a certain velocity for a warp drive requires an externally applied force» [bobrick-martire-2021]. |

Objeciones más fuertes, por orden:

1. **La solución base está discutida.** [barzegar-2026] afirma que la construcción de Fuchs «is not a solution to Einstein's equations» porque el primer paso no respeta la TOV. Cita: Hamed Barzegar, Thomas Buchert, Quentin Vigneron (2026). General formalism, classification, and demystification of the current warp-drive spacetimes. arXiv:2602.16495. https://arxiv.org/abs/2602.16495. La réplica más fuerte es [ashurst-2026], certificada por máquina pero sin revisión por pares. Owen Ashurst (2026). A lighter positive-energy warp shell with all energy conditions certified for every observer. Zenodo. https://doi.org/10.5281/zenodo.23459758.
2. **Puede no haber efecto «warp» que valga la pena.** Una cáscara con interior plano y exterior de Schwarzschild, impulsada a velocidad $v$, «is the static one seen from a different frame» [idrissov-2026]. Cita: Anuar Idrissov (2026). Exact radial stability threshold for a Minkowski-Schwarzschild thin shell. arXiv:2610.17629. https://arxiv.org/abs/2610.17629. Todo lo que no sea el pequeño desplazamiento $\beta = 0{,}02$ es una estrella hueca que se mueve por inercia. El propio frente C admite que a $v=0{,}02$ no hay ventaja frente a una nave sin burbuja.
3. **Estabilidad.** Estas cáscaras «are known to be unstable to non-radial perturbations» [idrissov-2026]. Una cáscara de materia nuclear de 0,6–1,6 km sin núcleo no tiene análisis de estabilidad en la base.
4. **Ensamblaje.** Formar una cáscara de compacidad 0,33 sin atrapar una superficie es un problema dinámico sin resolver (obstáculo 12, frente C). Ensamblarla «en movimiento» añade la energía de ligadura que se radia y, si se radia de forma asimétrica, un retroceso no controlado.
5. **La materia nuclear no está ligada sin gravedad.** **[sin cita en la base]** No he encontrado en la base un paper que lo cuantifique para una cáscara. Queda como pregunta abierta, no como cifra.

**Qué lo mataría (pruebas concretas):**
- Que una integración TOV anisótropa correcta, con exterior Schwarzschild, no tenga solución con $\beta \ne 0$ que cumpla la DEC (cerraría la duda de [barzegar-2026]).
- Que el $\beta$ interior se pueda eliminar con un cambio de coordenadas global (caso degenerado de [idrissov-2026]): entonces no hay motor, solo un cuerpo en movimiento.
- Que el modo $\ell = 2$ de la cáscara a densidad nuclear sea inestable con tiempos menores que el viaje.
- Que el optimizador de B dé $M/(\beta R_1)$ con pendiente distinta de 1 o prefactor $> 3$.

## Qué sobrevive

- **Leyes bien demostradas:** $\kappa = 2\sigma(1-1/v)$ (D); la escala $L \approx 1{,}53\sqrt{\ell_P/(\beta\sigma)}$ (E); el balance de la pila de Casimir (A1); la conservación de $P_{\rm ADM}$ y la necesidad de escape o tercer cuerpo (C).
- **El suelo de masa de B1 como orden de magnitud:** la masa de Fuchs se puede bajar ~13× (no 22×) en campo débil. Pendiente: confirmarlo sin campo débil.
- **El cohete de fotones siempre gasta más que la energía cinética** (demostrado hasta $v = 0{,}999$ con la masa final), con cociente ≈ $2/v$.
- **Lo subluminal evita horizontes, QEI y Olum.** Es la única base segura, pero su ventaja de transporte no está demostrada.

## Qué hay que corregir en los informes

1. **B1:** añadir el término $(\beta'/r)(1+\cos^2\theta)$. Cambiar «5–22×» por «≈ 13× (escalón suave, campo débil)» y «0,095 $M_J$» por «≈ 0,18 $M_J$». Ashurst queda a ~2,7× del suelo, no a 4,6×.
2. **B / E:** decir que la densidad nuclear **sube** la masa a 3–7,7 $M_J$ para $\beta = 0{,}02$. Unificar el grosor (0,6–1,6 km por B frente a 5,9 km por E) con una sola TOV.
3. **C:** llamar «cota inferior» a $8{,}07\times10^{40}$ J. Dar el cociente con la masa final (≈ 101) y borrar el «contraejemplo en $v=0{,}866$», que es un artefacto. Escalar las cifras con la masa corregida.
4. **D:** dejar claro que la burbuja que respira necesita energía negativa en la fase supralumínica [olum-1998] y momento externo en cada ciclo (frente C). El $\bar v = 1{,}93c$ es una cota optimista sin transiciones.
5. **E:** quitar «es la QI misma» para Casimir. Usar $v^2R^2\sigma/36$ (tanh) en vez de $v^2R^2\sigma$, o decir que es una cota de orden de magnitud (36× alta).
6. **A1:** escribir los supuestos de la prueba Z3 (solo dirección normal, $T_{zz}$ continuo, placas y separadores con NEC). Decir que el margen es de $5\times10^7$: la conclusión es robusta pero la prueba es casi trivial.
7. **Todos:** citar la crítica de [barzegar-2026] a la TOV de Fuchs y la observación de [idrissov-2026] sobre el caso degenerado, antes de construir sobre [fuchs-2024].
