"""Descubrir fórmulas a partir de datos (regresión simbólica).

  rapido → búsqueda exhaustiva propia, en NumPy: combina las variables con + − × ÷, potencias,
           raíz, exp, log y tanh hasta cierta complejidad y ajusta a·g(x)+b por mínimos cuadrados.
           Segundos en cualquier ordenador. Encuentra leyes sencillas (la mayoría en física).
  pysr   → PySR (evolución genética en Julia). Mucho más potente; instala Julia la primera vez.
           `uv sync --extra descubrir` en physics/.

Devuelve un frente de Pareto: error frente a complejidad.
"""

from __future__ import annotations

import itertools
import math

import numpy as np
import sympy as sp

UNARIAS = {
    "sqrt": (np.sqrt, sp.sqrt, 2), "exp": (np.exp, sp.exp, 3), "log": (np.log, sp.log, 3),
    "tanh": (np.tanh, sp.tanh, 3), "inv": (lambda a: 1 / a, lambda a: 1 / a, 1),
    "sq": (np.square, lambda a: a**2, 1), "cube": (lambda a: a**3, lambda a: a**3, 1),
}


def _candidatos(X: dict[str, np.ndarray], profundidad: int):
    base = [(np.asarray(v, float), sp.Symbol(k), 1) for k, v in X.items()]
    nivel = list(base)
    for k, (fn, sfn, c) in UNARIAS.items():
        for v, s, cc in base:
            with np.errstate(all="ignore"):
                nivel.append((fn(v), sfn(s), cc + c))
    todos = list(nivel)
    if profundidad >= 2:
        for (a, sa, ca), (b, sb, cb) in itertools.combinations_with_replacement(nivel, 2):
            with np.errstate(all="ignore"):
                todos.append((a * b, sa * sb, ca + cb + 1))
                todos.append((a / b, sa / sb, ca + cb + 1))
                todos.append((b / a, sb / sa, ca + cb + 1))
                todos.append((a + b, sa + sb, ca + cb + 1))
                todos.append((a - b, sa - sb, ca + cb + 1))
    return todos


def rapido(X: dict[str, np.ndarray], y: np.ndarray, profundidad: int = 2, top: int = 8) -> list[dict]:
    y = np.asarray(y, float)
    escala = float(np.std(y)) or 1.0
    vistos, res = set(), []
    for v, s, c in _candidatos(X, profundidad):
        if not np.all(np.isfinite(v)) or np.std(v) == 0:
            continue
        huella = tuple(np.round(v[:8] / (np.abs(v[:8]).max() or 1), 9))  # misma función = misma huella
        if huella in vistos:
            continue
        vistos.add(huella)
        A = np.stack([v, np.ones_like(v)], 1)
        coef, *_ = np.linalg.lstsq(A, y, rcond=None)
        err = float(np.sqrt(np.mean((A @ coef - y) ** 2))) / escala
        res.append((err, c + (2 if abs(coef[1]) > 1e-9 * escala else 1), s, coef))
    res.sort(key=lambda r: r[0] + 0.002 * r[1])
    frente, mejor = [], math.inf
    for err, c, s, (a, b) in sorted(res[:200], key=lambda r: r[1]):
        if err < mejor - 1e-12:
            expr = sp.nsimplify(float(a), tolerance=1e-8) * s
            if abs(b) > 1e-9 * escala:
                expr += sp.nsimplify(float(b), tolerance=1e-8)
            frente.append({"formula": str(expr), "error_relativo": err, "complejidad": c})
            mejor = err
    return frente[-top:]


def pysr(X: dict[str, np.ndarray], y: np.ndarray, iteraciones: int = 40) -> list[dict]:
    from pysr import PySRRegressor

    nombres = list(X)
    M = np.stack([np.asarray(X[k], float) for k in nombres], 1)
    m = PySRRegressor(niterations=iteraciones, binary_operators=["+", "-", "*", "/", "^"],
                      unary_operators=["exp", "log", "sqrt", "tanh", "sin", "cos"], progress=False,
                      model_selection="best", verbosity=0)
    m.fit(M, np.asarray(y, float), variable_names=nombres)
    return [{"formula": str(r["sympy_format"]), "error_relativo": float(r["loss"]), "complejidad": int(r["complexity"])}
            for _, r in m.equations_.iterrows()]


def descubrir(X: dict[str, np.ndarray], y: np.ndarray, motor: str = "rapido", **kw) -> list[dict]:
    if motor == "pysr":
        return pysr(X, y, **kw)
    return rapido(X, y, **kw)
