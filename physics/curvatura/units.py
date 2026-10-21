"""Conversión entre unidades geométricas (G = c = 1) y SI."""

G = 6.67430e-11  # m³ kg⁻¹ s⁻²  (CODATA 2018)
C = 299_792_458.0  # m s⁻¹
M_SUN = 1.98892e30  # kg
M_JUPITER = 1.89813e27  # kg


def length_to_mass(L_m: float) -> float:
    """Masa (kg) equivalente a una longitud geométrica (m): M = L c² / G."""
    return L_m * C**2 / G


def energy_density_to_si(rho_geom_m2: float) -> float:
    """Densidad de energía geométrica (m⁻²) a J/m³: ρ_SI = ρ c⁴ / G."""
    return rho_geom_m2 * C**4 / G
