"""Condiciones de energía con barrido de observadores.

Comprobar solo al observador euleriano no basta: una violación puede aparecer
para observadores en movimiento (Helmerich et al. 2024). Aquí se trabaja en una
tétrada ortonormal local, con T_ab ya proyectado en ella.
"""

from __future__ import annotations

import numpy as np


def _sphere(n: int) -> np.ndarray:
    """Direcciones casi uniformes en S² (espiral de Fibonacci)."""
    i = np.arange(n) + 0.5
    phi = np.arccos(1 - 2 * i / n)
    th = np.pi * (1 + 5**0.5) * i
    return np.stack([np.cos(th) * np.sin(phi), np.sin(th) * np.sin(phi), np.cos(phi)], axis=1)


def nec_min(T: np.ndarray, n_dirs: int = 200) -> float:
    """min T_ab k^a k^b sobre vectores nulos k = (1, n̂). Negativo = viola NEC."""
    k = np.concatenate([np.ones((n_dirs, 1)), _sphere(n_dirs)], axis=1)
    return float(np.min(np.einsum("ia,ab,ib->i", k, T, k)))


def wec_min(T: np.ndarray, n_dirs: int = 100, rapidities: np.ndarray | None = None) -> float:
    """min T_ab u^a u^b sobre observadores u = (cosh η, sinh η n̂). Negativo = viola WEC."""
    if rapidities is None:
        rapidities = np.linspace(0.0, 3.0, 13)
    dirs = _sphere(n_dirs)
    best = np.inf
    for eta in rapidities:
        u = np.concatenate([np.full((n_dirs, 1), np.cosh(eta)), np.sinh(eta) * dirs], axis=1)
        best = min(best, float(np.min(np.einsum("ia,ab,ib->i", u, T, u))))
    return best
