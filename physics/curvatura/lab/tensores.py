"""De la métrica al tensor de Einstein, con symengine (10-100 veces más rápido que SymPy).

Métricas en forma 3+1 (lapso α, desplazamiento β^i, γ_ij = δ_ij) o como matriz 4×4 en texto.
Catálogo: alcubierre, lentz (plantilla con β^x libre) y schwarzschild (isotrópicas).
"""

from __future__ import annotations

from itertools import product

import sympy as sp
import symengine as se

from .expr import leer

t, x, y, z = sp.symbols("t x y z", real=True)
COORDS = (t, x, y, z)


def _se(m) -> se.DenseMatrix:
    return se.DenseMatrix(4, 4, [se.sympify(m[i, j]) for i in range(4) for j in range(4)])


def einstein(g: sp.Matrix, coords=COORDS) -> dict:
    """Γ, Ricci, R y G_μν. Devuelve matrices SymPy (sin simplificar) y el tiempo empleado."""
    import time

    t0 = time.perf_counter()
    X = [se.Symbol(c.name) for c in coords]
    G = _se(g)
    Gi = G.inv()
    n = 4
    dg = [[[se.diff(G[i, j], X[k]) for k in range(n)] for j in range(n)] for i in range(n)]
    Ga = [[[se.Integer(0)] * n for _ in range(n)] for _ in range(n)]
    for a, b, c in product(range(n), repeat=3):
        if c < b:
            Ga[a][b][c] = Ga[a][c][b]
            continue
        s = se.Integer(0)
        for d in range(n):
            if Gi[a, d] != 0:
                s += Gi[a, d] * (dg[d][b][c] + dg[d][c][b] - dg[b][c][d])
        Ga[a][b][c] = s / 2
    Ric = se.zeros(n, n)
    for b in range(n):
        for c in range(b, n):
            s = se.Integer(0)
            for a in range(n):
                s += se.diff(Ga[a][b][c], X[a]) - se.diff(Ga[a][b][a], X[c])
                for d in range(n):
                    s += Ga[a][a][d] * Ga[d][b][c] - Ga[a][c][d] * Ga[d][b][a]
            Ric[b, c] = Ric[c, b] = s
    Rs = sum((Gi[i, j] * Ric[i, j] for i in range(n) for j in range(n)), se.Integer(0))
    Ein = se.zeros(n, n)
    for i in range(n):
        for j in range(n):
            Ein[i, j] = Ric[i, j] - G[i, j] * Rs / 2
    dt = time.perf_counter() - t0
    loc = {s.name: s for s in g.free_symbols | set(coords)}
    loc.update({f.func.__name__: f.func for f in g.atoms(sp.core.function.AppliedUndef)})
    a_sp = lambda M: sp.Matrix(4, 4, [sp.sympify(str(M[i, j]), locals=loc) for i in range(4) for j in range(4)])
    return {"ricci": a_sp(Ric), "R": sp.sympify(str(Rs), locals=loc), "einstein": a_sp(Ein), "segundos": dt}


def adm(alpha, beta, gamma=None) -> sp.Matrix:
    gamma = gamma if gamma is not None else sp.eye(3)
    b = sp.Matrix(beta)
    bl = gamma * b
    g = sp.zeros(4, 4)
    g[0, 0] = -alpha**2 + (b.T * bl)[0]
    for i in range(3):
        g[0, i + 1] = g[i + 1, 0] = bl[i]
        for j in range(3):
            g[i + 1, j + 1] = gamma[i, j]
    return g


def catalogo(nombre: str) -> tuple[sp.Matrix, sp.Expr, tuple]:
    """(métrica, lapso, desplazamiento) de una métrica conocida, con v, R, σ simbólicos."""
    v, R, s = sp.symbols("v R sigma", positive=True)
    f = sp.Function("f")
    r = sp.sqrt((x - v * t) ** 2 + y**2 + z**2)
    if nombre == "alcubierre":
        beta = (-v * f(r), 0, 0)
        return adm(1, beta), sp.Integer(1), beta
    if nombre == "lentz":  # solo β^x arbitrario: plantilla para solitones de Lentz/Fell-Heisenberg
        phi = sp.Function("phi")(x - v * t, y, z)
        beta = (-phi, 0, 0)
        return adm(1, beta), sp.Integer(1), beta
    if nombre == "schwarzschild":  # coordenadas isotrópicas cartesianas
        M = sp.Symbol("M", positive=True)
        rr = sp.sqrt(x**2 + y**2 + z**2)
        psi = 1 + M / (2 * rr)
        alpha = (1 - M / (2 * rr)) / psi
        return adm(alpha, (0, 0, 0), psi**4 * sp.eye(3)), alpha, (0, 0, 0)
    raise ValueError(f"métrica desconocida: {nombre} (alcubierre, lentz, schwarzschild)")


def densidad_euleriana(Ein: sp.Matrix, alpha, beta) -> sp.Expr:
    n = [1 / alpha] + [-b / alpha for b in beta]
    return sum(Ein[m, k] * n[m] * n[k] for m in range(4) for k in range(4)) / (8 * sp.pi)


def metrica_texto(filas: list[str]) -> sp.Matrix:
    """Cuatro filas «a, b, c, d» con la métrica en (t, x, y, z)."""
    return sp.Matrix([[leer(c) for c in f.split(",")] for f in filas])
