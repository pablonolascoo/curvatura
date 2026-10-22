# Frente E · Fuente material (obstáculos 7, 9 y 11)

> Generado por un agente de IA el 2026-10-22, en un sprint de unos 35 minutos. Puede contener errores. Cada cifra sale de una ejecución del laboratorio (`lab_*`, entradas indicadas) o de un paper citado. Lo especulativo va marcado con **[especulativo]**.

## Pregunta

¿Qué materia, campo o estado del vacío puede dar la densidad de energía, la presión y la anisotropía que pide una burbuja de 100 m a v = 0,1 c? ¿Y cuánto falta?

## Resumen

| # | Idea | Fuente | Densidad disponible (J/m³) | Requisito (J/m³) | Distancia | Veredicto |
|---|---|---|---|---|---|---|
| 1 | Vacío cuántico (Casimir estático, apilado, dinámico, luz comprimida) | ħc/L⁴ | 4,3×10⁴ (a = 10 nm) | 3,0×10³⁹ (σ = 1 m⁻¹) | **≈35 órdenes** | **Ley.** Hace falta L ≈ 2×10⁻¹⁷ m: menor que un protón. |
| 2 | Escalar acoplado no mínimamente (ξRφ²) | Clásico, sin ħ | Escala propia ~ c⁴/(Gξ·Δ²) | Igual escala | 0 órdenes en ρ; **14–16 órdenes en la amplitud del campo** | **Abierto, coste movido.** Del tamaño de ρ a la amplitud φ ≈ M_Pl/√ξ. |
| 3 | Cáscara de energía positiva: campos EM, láser, plasma, medios cargados en rotación, o materia densa | Campos: tope de Schwinger. Materia: densidad nuclear. | EM: 7,8×10²⁴. Estrella de neutrones: 1,6×10³⁵ | 5,5×10³⁸ (cáscara tipo Fuchs escalada a 100 m) | EM: **13,9 órdenes**. Materia: **3,5 órdenes** | **Ley para EM; abierto para materia.** La mejor fuente positiva es la materia misma. |

Lectura corta: el vacío cuántico queda descartado por ley. El escalar no mínimo no resuelve el coste: lo traslada a la amplitud del campo. Lo único cercano en órdenes de magnitud es la cáscara de energía positiva hecha de materia a densidad nuclear. Pero esa cáscara es subluminal y se publicó con β = 0,02, no 0,1.

---

## 0. El requisito, calculado

**Fórmula citada.** Densidad euleriana de Alcubierre, en G = c = 1:

$$\rho_E = -\frac{v_s^2}{32\pi}\,\frac{y^2+z^2}{r_s^2}\left(\frac{df}{dr_s}\right)^2$$

[Abellan, Bolivar, Vasilev (2023), ec. 8](https://arxiv.org/abs/2302.13826); idéntica en [Jusufi y Lobo (2026), ec. 25](https://arxiv.org/abs/2609.05554) y en [Lobo y Visser (2004), ec. 11](https://arxiv.org/abs/gr-qc/0406083).

**Pasos en el laboratorio.**

1. Pico de |df/dr| para el perfil tanh con R = 100 m, σ = 1 m⁻¹. `lab_evaluar` sobre r ∈ [95, 105], 2001 puntos: **máximo = 0,5 = σ/2** en r = R.
2. Con eso, en el ecuador: |ρ| = (c⁴/G)·β²σ²/(128π). `lab_unidades`: dimensión M L⁻¹ T⁻² (densidad de energía). Correcto.
3. `lab_evaluar` con c = 299792458, G = 6,6743×10⁻¹¹, β = 0,1:

| σ (m⁻¹) | Grosor de pared aprox. | \|ρ\| requerida (J/m³) |
|---|---|---|
| 0,01 | ~100 m (pared tan ancha como la burbuja) | 3,0×10³⁵ |
| 0,1 | ~10 m | 3,0×10³⁷ |
| 1 | ~1 m | 3,0×10³⁹ |
| 10 | ~0,1 m | 3,0×10⁴¹ |

4. Energía total, con la estimación M_warp ≈ −v²R²σ de [Lobo y Visser (2004), ec. 14](https://arxiv.org/abs/gr-qc/0406083) pasada a julios (×c⁴/G). `lab_evaluar`: **1,2×10⁴⁴ J (σ = 0,01) hasta 1,2×10⁴⁷ J (σ = 10)**; 1,2×10⁴⁶ J con σ = 1.

**Requisito de energía positiva (alternativa subluminal).** La cáscara de [Fuchs et al. (2024)](https://arxiv.org/abs/2405.02709) tiene M = 4,49×10²⁷ kg entre R₁ = 10 m y R₂ = 20 m (parámetros en `docs/obstaculos.md` §6). `lab_evaluar` de Mc²/(4/3·π(R₂³−R₁³)): **ρ̄c² = 1,38×10⁴⁰ J/m³**. Si se escala a R₂ = 100 m con la compacidad 2GM/(c²R) fija, M ∝ R y ρ̄ ∝ R⁻². `lab_evaluar`: **5,5×10³⁸ J/m³**. **[supuesto]** La semejanza geométrica no está demostrada para esta solución. Ojo: esa cáscara da β_warp = 0,02, no 0,1.

---

## Idea 1 · Vacío cuántico: Casimir estático, apilado, dinámico y luz comprimida

### Mecanismo

Las fronteras (placas) o los estados no clásicos (luz comprimida, efecto Casimir dinámico) dan densidad de energía negativa renormalizada. Es la única energía negativa medida.

### Literatura

- A favor: fórmula de placas ideales, ⟨T₀₀⟩ = −π²ħc/(720a⁴) [Maclay y Davis (2018), ec. 2](https://arxiv.org/abs/1806.01269). La luz comprimida puede tener densidad negativa y llega ya a −15 dB [Maclay y Davis (2018)](https://arxiv.org/abs/1806.01269). Un pilar en la cavidad sube la densidad negativa local «por un factor de 3–5» [White et al. (2021)](https://doi.org/10.1140/epjc/s10052-021-09484-z). El efecto Casimir dinámico se ha observado en circuitos superconductores [Benenti et al. (2013)](https://arxiv.org/abs/1312.6315). Repulsión de Casimir con metamateriales, ganancia óptica o capas magnéticas [Amooghorban et al. (2011)](https://arxiv.org/abs/1104.1500), [Abhignan (2024)](https://arxiv.org/abs/2409.04195).
- En contra: desigualdad cuántica para el campo EM, ρ̂ ≥ −3ħc/(16π²(ct₀)⁴) [Maclay y Davis (2018), ec. 1](https://arxiv.org/abs/1806.01269). Con QI, la pared de la burbuja mide «a few hundred Planck lengths» [Pfenning y Ford (1997)](https://arxiv.org/abs/gr-qc/9702026). Con espejos reales la densidad negativa es menor que con placas ideales [Bessa, De Lorenci y Ford (2014)](https://arxiv.org/abs/1402.6285). La energía total de placas más vacío es positiva [Maclay y Davis (2018)](https://arxiv.org/abs/1806.01269).
- Propuestas de dispositivo sin cálculo de T_μν que cierre: placas «Alconi-CrAlconi» a 0,1 nm [Su y Lee (2025)](https://doi.org/10.4236/jhepgc.2025.113058) **[especulativo, sin verificación]**; implosión de plasma «beyond Casimir threshold» en el reactor WARP [Anderson et al. (2023)](https://arxiv.org/abs/2306.06133), sin cifras de energía negativa.

### Cálculo (laboratorio)

| Entrada | Herramienta | Resultado |
|---|---|---|
| π²ħc/(720a⁴), a = 1 µm, 100 nm, 10 nm, 1 nm, 0,1 nm | `lab_evaluar` | 4,3×10⁻⁴; 4,3; 4,3×10⁴; 4,3×10⁸; 4,3×10¹² J/m³ |
| a necesaria: (π²ħc/(720ρ))^¼ con ρ = 3×10³⁵ … 3×10⁴¹ | `lab_evaluar` | **1,9×10⁻¹⁶ m … 6,2×10⁻¹⁸ m** |
| Forma cerrada: a⁴ = (128π³/720)·(ħG/c³)/(β²σ²) | `lab_igual` | **demostrada** (symengine) |
| Ley de escala: a = 1,53·√(ℓ_P/(βσ)), ℓ_P = 1,62×10⁻³⁵ m | `lab_evaluar` | 1,9×10⁻¹⁶ m (σ = 0,01) y 6,2×10⁻¹⁸ m (σ = 10). Coincide. |
| QI EM, ρ_max = 3ħ/(16π²c³t₀⁴), t₀ = 1 fs, R/c = 3,34×10⁻⁷ s, 1 s | `lab_evaluar` | 0,074; 6,0×10⁻³⁶; 7,4×10⁻⁶² J/m³ |
| t₀ necesario para ρ = 3×10³⁵ y 3×10³⁹ | `lab_evaluar` | **7,1×10⁻²⁵ s y 7,1×10⁻²⁶ s** |
| Distancia: 3,0×10³⁹ / 4,3×10⁴ (σ = 1, a = 10 nm) | `lab_evaluar` (log₁₀) | **34,8 órdenes** |
| Mejor caso: 3,0×10³⁵ / 4,3×10¹² (σ = 0,01, a = 0,1 nm) | `lab_evaluar` (log₁₀) | **22,8 órdenes** |

**Ley de escala.** Toda fuente cuántica de energía negativa cumple |ρ| ≲ ħc/L⁴, con L la separación o c por el tiempo de muestreo. El requisito es (c⁴/G)β²σ². Igualando:

$$L \approx 1{,}53\,\sqrt{\frac{\ell_P}{\beta\,\sigma}} .$$

L es la media geométrica entre la longitud de Planck y el grosor de pared dividido por β. Para una pared de 100 m y β = 0,1, L ≈ 0,2 fm.

### Registro de iteraciones

1. **Contradicción.** Se piden ~10³⁵–10⁴¹ J/m³ negativos en una pared de 0,1–100 m. El vacío da ħc/L⁴ solo en regiones de tamaño L.
2. **Arreglo: apilar cavidades (metamaterial).** El apilado aumenta el volumen con energía negativa, no la densidad. La densidad media es como mucho la de un hueco por la fracción de llenado (<1). No acerca nada. Los pilares de White dan ×3–5: medio orden.
3. **Arreglo: Casimir dinámico o luz comprimida.** Quedan bajo la QI. Para 3×10³⁵ J/m³ el pulso dura 7×10⁻²⁵ s. Una burbuja de 100 m tarda 3,3×10⁻⁷ s en cruzarse a la velocidad de la luz. Ahí el tope es 6×10⁻³⁶ J/m³: 71 órdenes por debajo.
4. **Arreglo: pared más gruesa (σ menor).** Baja el requisito como σ² y L solo crece como σ^−½. Pero la QI obliga a paredes de cientos de longitudes de Planck [Pfenning y Ford (1997)](https://arxiv.org/abs/gr-qc/9702026). Las dos exigencias van en sentido contrario.
5. **¿Disuelve o mueve?** Ninguno de los arreglos disuelve el coste. El hueco de 0,2 fm está por debajo del tamaño de un nucleón. Ahí no hay placas.

### Veredicto

**Ley física, no problema de ingeniería.** La relación |ρ| ≲ ħc/L⁴ es la QI misma. Coincide con el obstáculo 3. Ninguna geometría de placas la evita.

### Siguiente paso

- Banco: contrastar la QI con luz comprimida, como propone [Maclay y Davis (2018)](https://arxiv.org/abs/1806.01269). No acerca la escala, pero pone a prueba la ley.
- Cálculo: añadir la curva L(β, σ) a la gráfica del obstáculo 9 (`library/equations/casimir-energy.yaml`).

---

## Idea 2 · Escalar acoplado no mínimamente

### Mecanismo

Un escalar clásico con término −½ξRφ² en la acción. Su tensor efectivo depende del de Einstein. Con ξ > 0 puede violar la NEC e incluso la ANEC sin ħ [Barceló y Visser (2000)](https://arxiv.org/abs/gr-qc/0003025). Al no ser cuántico, no cae bajo las QI. Es también la puerta del obstáculo 11: es una teoría escalar-tensorial.

### Literatura

- A favor: violación de todas las condiciones de energía, ANEC incluida, y familias enteras de agujeros de gusano para todo ξ > 0 [Barceló y Visser (2000)](https://arxiv.org/abs/gr-qc/0003025). Valores plausibles al aplicar la QI [Lobo (2007)](https://arxiv.org/abs/0710.4474).
- En contra: el campo debe alcanzar valores «above ∼m_p/√ξ», es decir, transplanckianos o con ξ enorme [Barceló y Visser (2000)](https://arxiv.org/abs/gr-qc/0003025). Hay ambigüedad en la definición del tensor y de la densidad de energía de este escalar [Bellucci y Faraoni (2002)](https://arxiv.org/abs/hep-th/0106168). En esas soluciones falla la condición (1 − 8πξφ²) > 0, que hace falta para pasar al marco de Einstein, y se sospechan violaciones de la segunda ley generalizada [Roman (2004)](https://arxiv.org/abs/gr-qc/0409090). Una fuerza escalar de largo alcance choca con |γ − 1| ≲ 10⁻⁵ (`docs/obstaculos.md` §11, [Rodal (2025)](https://arxiv.org/abs/2507.09724)).

### Cálculo (laboratorio)

| Entrada | Herramienta | Resultado |
|---|---|---|
| Valor crítico φ_c = M_Pl,red/√ξ = √(ħc⁵/(8πG))/√ξ, en GeV, ξ = 1/6, 1, 10⁴ | `lab_evaluar` | **6,0×10¹⁸; 2,4×10¹⁸; 2,4×10¹⁶ GeV** |
| Comparado con v ≈ 246 GeV del Higgs ([Alexandre y Polonyi (2021)](https://arxiv.org/abs/2101.08640)), ξ = 10⁴ y ξ = 1 | `lab_evaluar` (log₁₀) | **14,0 y 16,0 órdenes** |
| Escala de energía de gradiente en φ_c sobre una pared Δ = 1/σ, c⁴/(8πGξΔ²), frente al requisito | `lab_igual` | cociente = 16/(ξβ²), **demostrada**. Con β = 0,1: 9.600 (ξ = 1/6) y 0,16 (ξ = 10⁴) |

**[especulativo]** El último cálculo es solo de órdenes de magnitud. Dice que, en φ ≈ φ_c, el escalar tiene de sobra la escala de energía necesaria. El problema no es la densidad. Es la amplitud del campo.

### Registro de iteraciones

1. **Contradicción.** Se quiere violar la NEC a escala macroscópica sin las QI. El escalar no mínimo lo hace clásicamente. Pero solo cerca de φ_c, donde la G efectiva diverge o cambia de signo.
2. **Arreglo: subir ξ.** φ_c baja como 1/√ξ. Con ξ = 10⁴ sigue a 2,4×10¹⁶ GeV: 14 órdenes por encima de cualquier escalar conocido.
3. **Arreglo: apantallamiento (tipo camaleón) para evitar la cota de γ.** **[especulativo]** Podría ocultar la fuerza a escala del Sistema Solar. No baja φ_c. Hay bancos de Casimir dinámico que ya buscan escalares apantallados [Báez-Camargo et al. (2024)](https://arxiv.org/abs/2404.02630).
4. **¿Disuelve o mueve?** **Mueve el coste.** El tamaño de ρ deja de ser el problema. Pasa a serlo un campo de amplitud planckiana y una región donde (1 − 8πξφ²) cambia de signo. Esa región es un fantasma, con la inestabilidad que eso implica.

### Veredicto

**Abierto, no viable con la física conocida.** Es la única vía del frente que no choca con una ley cuántica. Su coste es pasar por valores de campo planckianos.

### Siguiente paso

- Cálculo: resolver una burbuja tipo Natário o una cáscara de Fuchs con fuente escalar ξRφ² en `physics/curvatura/sources/`. La pregunta es si existe una solución con φ_max < φ_c en todo punto. Si existe, la NEC no se viola y vuelve el requisito positivo. Si no existe, se confirma que hace falta cruzar φ_c.
- Banco: las cotas sobre escalares apantallados con fuerzas de Casimir acotan ξ y la masa del escalar [Báez-Camargo et al. (2024)](https://arxiv.org/abs/2404.02630).

---

## Idea 3 · Cáscara de energía positiva: campos o materia densa

### Mecanismo

Se renuncia a la energía negativa. Se busca la fuente positiva más densa para una cáscara subluminal tipo [Fuchs et al. (2024)](https://arxiv.org/abs/2405.02709), según el marco de [Bobrick y Martire (2021)](https://arxiv.org/abs/2102.06824). Candidatas: campos EM (láser, plasma magnetizado, medios cargados en rotación) y materia a densidad nuclear. El campo EM tiene una ventaja: su tensión a lo largo de las líneas de campo vale ρ. Es la anisotropía máxima que permite la DEC, útil para la tensión de aro del obstáculo 8.

### Literatura

- A favor: existen cáscaras subluminales de energía positiva [Bobrick y Martire (2021)](https://arxiv.org/abs/2102.06824), [Fuchs et al. (2024)](https://arxiv.org/abs/2405.02709). Hay un banco subluminal propuesto con cavidades de Casimir y plasma magnetizado, solo para validar métodos [Zejli (2026)](https://doi.org/10.1140/epjp/s13360-026-07538-3). Polvo cargado más campo EM en la métrica de Alcubierre cumple las condiciones en algunos casos [Santos-Pereira, Abreu y Ribeiro (2021)](https://arxiv.org/abs/2102.05119).
- En contra: el solitón de plasma de Lentz viola la WEC incluso para el observador euleriano [Celmaster y Rubin (2025)](https://arxiv.org/abs/2511.18251). El sistema Einstein-Maxwell-plasma no tiene solución analítica: requiere simulación [Lentz (2021)](https://arxiv.org/abs/2201.00652). El tope del campo en el vacío es el de Schwinger, −Ȧ₀ = m²/q² en unidades naturales [Álvarez-Domínguez y Parra-López (2025)](https://arxiv.org/abs/2505.04473).

### Cálculo (laboratorio)

| Entrada | Herramienta | Resultado |
|---|---|---|
| Tope EM: ε₀E_S²/2 con E_S = m_e²c³/(eħ) | `lab_evaluar` | **7,75×10²⁴ J/m³** |
| Densidad de saturación nuclear 2,7×10¹⁴ g/cm³ ([Albino et al. (2025)](https://arxiv.org/abs/2511.02653)) × c² | `lab_evaluar` | 2,4×10³⁴ J/m³ |
| ε_max en el centro de estrellas de neutrones, 1000–1212 MeV/fm³ ([Albino et al. (2025)](https://arxiv.org/abs/2511.02653), tabla 6) | `lab_evaluar` | **1,6–1,9×10³⁵ J/m³** |
| Distancia: cáscara de Fuchs (1,38×10⁴⁰) frente al tope EM | `lab_evaluar` (log₁₀) | **15,2 órdenes** |
| Distancia: cáscara escalada a 100 m (5,5×10³⁸) frente al tope EM | `lab_evaluar` (log₁₀) | **13,9 órdenes** |
| Distancia: cáscara escalada a 100 m frente a ε_max nuclear | `lab_evaluar` (log₁₀) | **3,5 órdenes** |
| Radio para que ρ̄ baje a ε_max, con ρ̄ ∝ R⁻²: R₂ = 20·√(1,38×10⁴⁰/ρ) | `lab_evaluar` | **5,9 km** (ε_max) y 15 km (saturación) |
| Comparación: Alcubierre σ = 0,01 (3×10³⁵) frente al tope EM | `lab_evaluar` (log₁₀) | 10,6 órdenes (y el signo es el contrario) |

### Registro de iteraciones

1. **Contradicción.** La cáscara positiva pide ~10³⁹–10⁴⁰ J/m³ con tensión cercana a 0,07ρc² (`docs/obstaculos.md` §8). Los campos y la materia de laboratorio dan muchos órdenes menos.
2. **Arreglo: campos EM intensos (láser, plasma, medios cargados en rotación).** El tensor EM tiene traza nula y cumple la DEC. Nunca da densidad negativa. Su energía en el vacío no puede pasar del tope de Schwinger sin crear pares: 13,9 órdenes por debajo. Un medio cargado en rotación es materia más campo: no supera ninguno de los dos topes.
3. **Arreglo: usar materia densa y el EM solo para la anisotropía.** La materia nuclear queda a 3,5 órdenes de la cáscara escalada a 100 m. Para cerrar el hueco a compacidad fija, la cáscara debe medir ~6 km. Eso es, en la práctica, una estrella de neutrones hueca.
4. **¿Disuelve o mueve?** **Mueve el coste.** La energía negativa desaparece. Aparecen tres costes: una masa planetaria (4,49×10²⁷ kg en Fuchs), una densidad nuclear y una propulsión aparte, porque la cáscara se mueve por inercia [Bobrick y Martire (2021)](https://arxiv.org/abs/2102.06824). Además, β = 0,02 en la solución publicada. Para 0,1 c no hay solución calculada.

### Veredicto

- **Campos EM: ley.** El tope de Schwinger y la traza nula los dejan como mucho para la anisotropía, no para la masa.
- **Materia densa: abierto.** Es la única fuente real a menos de 4 órdenes del requisito. Es la mejor idea del frente, con una advertencia: lo que construye es un objeto astrofísico, no una nave.

### Siguiente paso

- Cálculo: cerrar la cáscara TOV anisótropa con una ecuación de estado nuclear real (polítropo de [Baumgarte y Hilditch (2022)](https://arxiv.org/abs/2207.06376) o parametrización de [Becerra et al. (2024)](https://arxiv.org/abs/2401.10311)). Buscar el β_warp máximo a densidad ≤ ε_max y comprobar si se puede llegar a 0,1. Es la vía de salida del obstáculo 7 que se propone en `docs/obstaculos.md`.
- Comprobar la ley ρ̄ ∝ R⁻² a compacidad fija con el integrador TOV de `solvers/cpp`. Ahora es un supuesto.

---

## Patentes revisadas

Nota: el filtro `tipos: ["patente"]` de `buscar` devolvió listas vacías en cinco consultas. Las patentes se abrieron con `ver_paper` por número.

| Patente | Qué reivindica | Juicio |
|---|---|---|
| [US10144532B2](https://patents.google.com/patent/US10144532B2/en), Pais (2018), Armada de EE. UU. | Cavidad resonante cargada que vibra con microondas y crea un «local polarized vacuum». | Sin T_μν, sin cifras de densidad. No se puede comparar con el requisito. |
| [US10322827B2](https://patents.google.com/patent/US10322827B2/en), Pais (2019) | Generador de ondas gravitatorias de alta frecuencia con cavidades acústicas cargadas. | Sin cálculo de amplitud. Fuera del alcance de la fuente material. |
| [US6960975B1](https://patents.google.com/patent/US6960975B1/en), Volfson (2005) | Escudo superconductor que generaría un campo gravitomagnético y una «pressure anomaly of inflationary vacuum state». | Se apoya en Podkletnov, que la revisión de [Millis (2011)](https://arxiv.org/abs/1101.1063) califica de «Not rigorous, not repeatable». |
| Solicitud 63/499,928, citada en [Anderson et al. (2023)](https://arxiv.org/abs/2306.06133) | Implosión de plasma y anillos de iones «beyond Casimir threshold». | Sin cifras de energía negativa. Por la idea 1, a escalas de laboratorio quedaría a más de 20 órdenes. |

Ninguna patente da una densidad de energía calculable. Ninguna cambia los números de este informe.

---

## Para soluciones.md

- **Ley (obstáculo 9 + 3):** toda energía negativa cuántica cumple |ρ| ≲ ħc/L⁴. Para una burbuja de 100 m a 0,1 c hace falta L ≈ 1,53·√(ℓ_P/(βσ)) ≈ 0,2 fm o menos. Apilar cavidades o comprimir luz no cambia la ley. Distancia con Casimir a 10 nm: ~35 órdenes (σ = 1 m⁻¹).
- **Mejor vía abierta (obstáculo 7):** cáscara de energía positiva de materia a densidad nuclear. Queda a 3,5 órdenes (5,5×10³⁸ frente a 1,6×10³⁵ J/m³) si se escala la de Fuchs a 100 m; a compacidad fija necesitaría ~6 km. Siguiente cálculo: TOV anisótropa con ecuación de estado nuclear y β_warp máximo.
- **Coste movido (obstáculo 11):** el escalar no mínimo viola la NEC sin ħ, pero exige φ ≈ M_Pl/√ξ, 14–16 órdenes por encima del Higgs. Los campos EM no sirven como masa: su tope de Schwinger (7,8×10²⁴ J/m³) está a ~14 órdenes.
