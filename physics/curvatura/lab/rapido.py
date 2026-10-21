"""Evaluación ultrarrápida de fórmulas sobre millones de puntos.

  numpy  → lambdify con eliminación de subexpresiones comunes (cse). Sin compilar.
  numba  → la misma función compilada a código máquina y paralela en todos los núcleos.

`compilar()` elige numba si está disponible y cae a numpy si no. Funciona en cualquier ordenador.
"""

from __future__ import annotations

import time

import numpy as np
import sympy as sp

from .expr import lados, leer

_cache: dict = {}


def _expr(formula) -> tuple[sp.Expr, list[sp.Symbol]]:
    e = lados(leer(formula)) if isinstance(formula, str) else formula
    if isinstance(formula, str) and isinstance(leer(formula), sp.Equality):
        e = leer(formula).rhs  # `y = f(x)` evalúa f(x)
    return e, sorted(e.free_symbols, key=lambda s: s.name)


def compilar(formula, motor: str = "auto"):
    """Devuelve (función vectorizada, símbolos en orden, motor usado)."""
    e, syms = _expr(formula)
    clave = (sp.srepr(e), motor)
    if clave in _cache:
        return _cache[clave]
    usado = "numpy"
    f = sp.lambdify(syms, e, modules="numpy", cse=True)
    if motor in ("auto", "numba"):
        try:
            import numba

            escalar = sp.lambdify(syms, e, modules="math", cse=True)
            firma = f"float64({', '.join(['float64'] * len(syms))})"
            f = numba.vectorize([firma], target="parallel", cache=False)(escalar)
            usado = "numba"
        except Exception:
            if motor == "numba":
                raise
    _cache[clave] = (f, syms, usado)
    return _cache[clave]


def evaluar(formula, valores: dict[str, np.ndarray | float], motor: str = "auto") -> np.ndarray:
    f, syms, _ = compilar(formula, motor)
    args = [np.asarray(valores[s.name], dtype=np.float64) for s in syms]
    args = np.broadcast_arrays(*args) if args else []
    return f(*args)


def banco(formula, n: int = 1_000_000, dominio: dict[str, tuple[float, float]] | None = None) -> dict:
    """Mide numpy frente a numba en n puntos aleatorios y comprueba que dan lo mismo."""
    dominio = dominio or {}
    e, syms = _expr(formula)
    rng = np.random.default_rng(0)
    vals = {s.name: rng.uniform(*dominio.get(s.name, (0.1, 3.0)), n) for s in syms}
    out = {"puntos": n, "simbolos": [s.name for s in syms]}
    ref = None
    for motor in ("numpy", "numba"):
        try:
            evaluar(e, {k: v[:10] for k, v in vals.items()}, motor)  # compila
            t = time.perf_counter()
            r = evaluar(e, vals, motor)
            dt = time.perf_counter() - t
            out[motor] = {"ms": round(dt * 1000, 2), "Mpuntos_s": round(n / dt / 1e6, 1)}
            if ref is None:
                ref = r
            else:
                ok = np.isfinite(ref) & np.isfinite(r)
                out["coinciden"] = bool(np.allclose(ref[ok], r[ok], rtol=1e-9, atol=1e-300))
        except Exception as exc:
            out[motor] = {"error": str(exc)[:200]}
    return out
