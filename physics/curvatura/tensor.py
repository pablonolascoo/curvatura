"""Geometría diferencial simbólica: de la métrica al tensor de Einstein.

Se evita `simplify` a propósito: las expresiones se evalúan numéricamente con
`lambdify`, que es órdenes de magnitud más rápido que simplificar.
"""

from __future__ import annotations

from dataclasses import dataclass
from itertools import product

import sympy as sp


@dataclass(frozen=True)
class Geometry:
    coords: tuple[sp.Symbol, ...]
    g: sp.Matrix
    ginv: sp.Matrix
    christoffel: list  # Γ^a_{bc} como lista anidada [a][b][c]
    ricci: sp.Matrix
    ricci_scalar: sp.Expr
    einstein: sp.Matrix


def christoffel(g: sp.Matrix, ginv: sp.Matrix, x: tuple[sp.Symbol, ...]) -> list:
    n = len(x)
    dg = [[[sp.diff(g[i, j], x[k]) for k in range(n)] for j in range(n)] for i in range(n)]
    G = [[[sp.S.Zero] * n for _ in range(n)] for _ in range(n)]
    for a, b, c in product(range(n), repeat=3):
        if c < b:
            G[a][b][c] = G[a][c][b]
            continue
        s = sum(ginv[a, d] * (dg[d][b][c] + dg[d][c][b] - dg[b][c][d]) for d in range(n) if ginv[a, d] != 0)
        G[a][b][c] = s / 2
    return G


def ricci(G: list, x: tuple[sp.Symbol, ...]) -> sp.Matrix:
    """R_bc = ∂_a Γ^a_bc - ∂_c Γ^a_ba + Γ^a_ad Γ^d_bc - Γ^a_cd Γ^d_ba."""
    n = len(x)
    R = sp.zeros(n, n)
    for b in range(n):
        for c in range(b, n):
            s = sp.S.Zero
            for a in range(n):
                s += sp.diff(G[a][b][c], x[a]) - sp.diff(G[a][b][a], x[c])
                for d in range(n):
                    s += G[a][a][d] * G[d][b][c] - G[a][c][d] * G[d][b][a]
            R[b, c] = R[c, b] = s
    return R


def geometry(g: sp.Matrix, coords: tuple[sp.Symbol, ...]) -> Geometry:
    ginv = g.inv()
    G = christoffel(g, ginv, coords)
    Ric = ricci(G, coords)
    Rs = sum(ginv[i, j] * Ric[i, j] for i in range(len(coords)) for j in range(len(coords)))
    Ein = Ric - g * Rs / 2
    return Geometry(coords, g, ginv, G, Ric, Rs, Ein)


def adm_metric(alpha: sp.Expr, beta: tuple[sp.Expr, sp.Expr, sp.Expr], gamma: sp.Matrix) -> sp.Matrix:
    """Métrica 4D desde lapso α, desplazamiento β^i y métrica espacial γ_ij."""
    b = sp.Matrix(beta)
    b_low = gamma * b
    g = sp.zeros(4, 4)
    g[0, 0] = -alpha**2 + (b.T * b_low)[0]
    for i in range(3):
        g[0, i + 1] = g[i + 1, 0] = b_low[i]
        for j in range(3):
            g[i + 1, j + 1] = gamma[i, j]
    return g


def eulerian_energy_density(geo: Geometry, alpha: sp.Expr, beta: tuple[sp.Expr, sp.Expr, sp.Expr]) -> sp.Expr:
    """ρ_E = G_μν n^μ n^ν / 8π con n^μ = (1/α, -β^i/α)."""
    n = [1 / alpha] + [-bi / alpha for bi in beta]
    return sum(geo.einstein[m, v] * n[m] * n[v] for m in range(4) for v in range(4)) / (8 * sp.pi)
