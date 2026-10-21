"""Métrica de Alcubierre (1994).

ds² = -dt² + (dx - v_s f(r_s) dt)² + dy² + dz²
f(r) = [tanh(σ(r+R)) - tanh(σ(r-R))] / [2 tanh(σR)]
"""

from __future__ import annotations

import numpy as np
import sympy as sp
from scipy import integrate

from ..tensor import adm_metric


def shape(r, R: float, sigma: float):
    return (np.tanh(sigma * (r + R)) - np.tanh(sigma * (r - R))) / (2 * np.tanh(sigma * R))


def dshape(r, R: float, sigma: float):
    """df/dr analítica."""
    def sech2(u):  # forma estable: 4e^{-2|u|} / (1 + e^{-2|u|})², sin desbordar cosh
        e = np.exp(-2.0 * np.abs(u))
        return 4.0 * e / (1.0 + e) ** 2

    return sigma * (sech2(sigma * (r + R)) - sech2(sigma * (r - R))) / (2 * np.tanh(sigma * R))


def expansion(x, y, z, v: float, R: float, sigma: float, xs: float = 0.0):
    """θ = v_s (x - x_s)/r_s · df/dr_s. Negativa delante, positiva detrás."""
    dx = x - xs
    r = np.sqrt(dx**2 + y**2 + z**2)
    with np.errstate(invalid="ignore", divide="ignore"):
        out = v * np.where(r > 0, dx / r, 0.0) * dshape(r, R, sigma)
    return out


def energy_density(x, y, z, v: float, R: float, sigma: float, xs: float = 0.0):
    """Densidad de energía euleriana: -(1/8π) v² ρ²/(4 r²) (df/dr)²."""
    dx = x - xs
    r2 = dx**2 + y**2 + z**2
    rho2 = y**2 + z**2
    r = np.sqrt(r2)
    with np.errstate(invalid="ignore", divide="ignore"):
        out = -(v**2) * np.where(r2 > 0, rho2 / r2, 0.0) * dshape(r, R, sigma) ** 2 / (32 * np.pi)
    return out


def total_energy(v: float, R: float, sigma: float) -> float:
    """E = ∫ρ_E dV = -(v²/12) ∫₀^∞ r² (df/dr)² dr  (integración angular exacta)."""
    upper = R + 40.0 / sigma
    val, _ = integrate.quad(lambda r: r**2 * dshape(r, R, sigma) ** 2, 0.0, upper, points=[R], limit=400)
    return -(v**2) * val / 12.0


def total_energy_thin_wall(v: float, R: float, sigma: float) -> float:
    """Límite σR ≫ 1: E ≈ -v² R² σ / 36."""
    return -(v**2) * R**2 * sigma / 36.0


def symbolic(v: float | sp.Expr, R: float | sp.Expr, sigma: float | sp.Expr):
    """Métrica simbólica con x_s = v t. Devuelve (coords, g, α, β, γ)."""
    t, x, y, z = sp.symbols("t x y z", real=True)
    rs = sp.sqrt((x - v * t) ** 2 + y**2 + z**2)
    f = (sp.tanh(sigma * (rs + R)) - sp.tanh(sigma * (rs - R))) / (2 * sp.tanh(sigma * R))
    alpha = sp.Integer(1)
    beta = (-v * f, sp.Integer(0), sp.Integer(0))
    gamma = sp.eye(3)
    return (t, x, y, z), adm_metric(alpha, beta, gamma), alpha, beta, gamma
