# C · Condiciones de energía

Determina el tensor energía-momento que exige la geometría y si es físicamente admisible.

## Formulación

```
G_μν = 8π T_μν
```

Observador euleriano `n^μ = (1/α, -β^i/α)`. Densidad de energía medida:

```
ρ_E = T_μν n^μ n^ν = (1/16π) (³R + K² - K_ij K^ij)
```

Para Alcubierre, con `ρ² = y² + z²`:

```
ρ_E = -(1/8π) · v_s² ρ² / (4 r_s²) · (df/dr_s)²
```

Negativa en toda la pared. Ese es el problema central.

## Condiciones

| Condición | Exige | Para todo |
|---|---|---|
| NEC | `T_μν k^μ k^ν ≥ 0` | `k` nulo |
| WEC | `T_μν t^μ t^ν ≥ 0` | `t` temporal |
| SEC | `(T_μν - ½ T g_μν) t^μ t^ν ≥ 0` | `t` temporal |
| DEC | WEC y `-T^μ_ν t^ν` causal | `t` temporal |

Comprobar solo el observador euleriano no basta: hay que barrer todos los observadores (Helmerich et al. 2024).

## Desigualdades cuánticas

Ford & Roman (1996) y Pfenning & Ford (1997): la energía negativa promediada sobre un tiempo `τ` está acotada por `~ -C/τ⁴`. Limita el grosor de pared y dispara la energía total.

## Tareas

- [ ] Einstein simbólico desde `(α, β, γ)`.
- [ ] Evaluador de NEC/WEC/SEC/DEC con barrido de observadores (rapidez y dirección).
- [ ] Mapa de violaciones para cada familia de G.

## Salida

Tabla de cumplimiento por familia, reproducible con un comando.
