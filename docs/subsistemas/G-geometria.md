# G · Geometría

Define la métrica objetivo. Todo lo demás se deriva de aquí.

## Formulación

Descomposición 3+1:

```
ds² = -α² dt² + γ_ij (dx^i + β^i dt)(dx^j + β^j dt)
```

Alcubierre (1994): `α = 1`, `γ_ij = δ_ij`, `β^x = -v_s(t) f(r_s)`.

```
r_s = sqrt((x - x_s(t))² + y² + z²)
f(r) = [tanh(σ(r + R)) - tanh(σ(r - R))] / [2 tanh(σR)]
```

Expansión de los elementos de volumen (contracción delante, expansión detrás):

```
θ = v_s · (x - x_s)/r_s · df/dr_s
```

## Familias a estudiar

| Familia | Rasgo | Paper |
|---|---|---|
| Alcubierre | Desplazamiento puro, `θ ≠ 0` | `alcubierre-1994` |
| Natário | Expansión nula, `∇·β = 0` | `natario-2002` |
| Van Den Broeck | Bolsillo interno con `γ_ij = B² δ_ij` | `vandenbroeck-1999` |
| Lentz | Solitones con fuente Einstein-Maxwell-plasma | `lentz-2021` |
| Bobrick-Martire | Cáscara con masa, marco general | `bobrick-martire-2021` |
| Fuchs et al. | Velocidad constante, energía positiva | `fuchs-2024` |

## Tareas

- [ ] Implementar cada familia en `physics/curvatura/metrics/`.
- [ ] Parametrización común: `(α, β^i, γ_ij)` como funciones de `(t, x, y, z; θ)`.
- [ ] Renders de `θ`, `β` y `γ` para la web.

## Salida

Seis familias implementadas, con test de que la métrica cumple su propia definición publicada.
