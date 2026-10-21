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


_barridos: dict = {}


def barrido_cpu(formula, rangos: dict[str, tuple[float, float, int]]) -> dict:
    """Barrido de una rejilla en todos los núcleos (numba, f64), sin guardar la rejilla en memoria."""
    import numba

    e, syms = _expr(formula)
    d = len(syms)
    clave = sp.srepr(e)
    if clave not in _barridos:
        f = numba.njit(fastmath=True)(sp.lambdify(syms, e, modules="math", cse=True))
        decod = "\n".join(f"        q{i} = resto % n[{i}]; resto = resto // n[{i}]; v{i} = ini[{i}] + paso[{i}] * q{i}" for i in range(d))
        args = ", ".join(f"v{i}" for i in range(d))
        fuente = f"""
def k(ini, paso, n, total):
    mn = np.inf; mx = -np.inf; s = 0.0; neg = 0; val = 0
    for idx in numba.prange(total):
        resto = idx + 0
{decod}
        y = f({args})
        if np.isfinite(y):
            mn = min(mn, y); mx = max(mx, y); s += y; val += 1
            if y < 0.0:
                neg += 1
    return mn, mx, s, neg, val
"""
        ns = {"np": np, "numba": numba, "f": f}
        exec(fuente, ns)
        _barridos[clave] = numba.njit(parallel=True, fastmath=True)(ns["k"])
    ini = np.array([rangos[s.name][0] for s in syms], float)
    n = np.array([int(rangos[s.name][2]) for s in syms], np.int64)
    paso = np.array([(rangos[s.name][1] - rangos[s.name][0]) / (k - 1) if k > 1 else 0.0 for s, k in zip(syms, n)], float)
    total = int(np.prod(n))
    t = time.perf_counter()
    mn, mx, s, neg, val = _barridos[clave](ini, paso, n, total)
    ms = (time.perf_counter() - t) * 1000
    return {"motor": f"CPU {numba.get_num_threads()} hilos (numba, f64)", "puntos": total, "ms": round(ms, 2),
            "Gpuntos_s": round(total / ms / 1e6, 3), "min": float(mn), "max": float(mx),
            "media": float(s / total), "fraccion_negativa": float(neg / total)}


def barrido(formula, rangos: dict[str, tuple[float, float, int]], motor: str = "auto") -> dict:
    """Barrido de parámetros con el mejor motor del equipo: GPU (wgpu: Metal, DirectX 12, Vulkan) o todos los núcleos."""
    if motor in ("auto", "gpu"):
        try:
            from . import gpu

            if gpu.disponible():
                return gpu.barrido(formula, rangos)
        except Exception:
            if motor == "gpu":
                raise
    return barrido_cpu(formula, rangos)
