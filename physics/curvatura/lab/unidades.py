"""Análisis dimensional: cada suma con términos de la misma dimensión y funciones con argumento adimensional.

Dimensiones como vectores de exponentes sobre (L, M, T, I, Θ). Se declaran con texto: "L", "M L^2 T^-2",
"1" (adimensional). Atajos: velocidad, energia, densidad_energia, longitud, masa, tiempo, ...
En unidades geométricas (G = c = 1) todo se reduce a potencias de L: usar `geometricas=True`.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

import sympy as sp

from .expr import lados, leer

BASE = ("L", "M", "T", "I", "Θ")
ATAJOS = {
    "1": "", "adimensional": "", "longitud": "L", "masa": "M", "tiempo": "T", "velocidad": "L T^-1",
    "aceleracion": "L T^-2", "energia": "M L^2 T^-2", "fuerza": "M L T^-2", "presion": "M L^-1 T^-2",
    "densidad_energia": "M L^-1 T^-2", "densidad": "M L^-3", "potencia": "M L^2 T^-3", "carga": "I T",
    "temperatura": "Θ", "accion": "M L^2 T^-1", "G": "L^3 M^-1 T^-2", "c": "L T^-1", "hbar": "M L^2 T^-1",
    "k_B": "M L^2 T^-2 Θ^-1",
}
GEOMETRICAS = {"L": (1, 0, 0, 0, 0), "M": (1, 0, 0, 0, 0), "T": (1, 0, 0, 0, 0), "I": (0, 0, 0, 1, 0), "Θ": (0, 0, 0, 0, 1)}


class ErrorDimensional(Exception):
    pass


@dataclass(frozen=True)
class Dim:
    e: tuple[sp.Rational, ...]

    def __mul__(self, o: "Dim") -> "Dim":
        return Dim(tuple(a + b for a, b in zip(self.e, o.e)))

    def __pow__(self, k) -> "Dim":
        return Dim(tuple(a * k for a in self.e))

    @property
    def nula(self) -> bool:
        return all(a == 0 for a in self.e)

    def __str__(self) -> str:
        p = [f"{b}" + ("" if a == 1 else f"^{a}") for b, a in zip(BASE, self.e) if a != 0]
        return " ".join(p) or "1"


UNO = Dim((sp.Integer(0),) * 5)


def dim(texto: str, geometricas: bool = False) -> Dim:
    t = ATAJOS.get(texto.strip(), texto.strip())
    v = [sp.Integer(0)] * 5
    for base, exp in re.findall(r"(L|M|T|I|Θ)(?:\^(-?[\d/]+))?", t):
        k = sp.Rational(exp) if exp else sp.Integer(1)
        comps = GEOMETRICAS[base] if geometricas else tuple(int(base == b) for b in BASE)
        for i, c in enumerate(comps):
            v[i] += k * c
    return Dim(tuple(v))


def dimension(e: sp.Expr, dims: dict[sp.Symbol, Dim]) -> Dim:
    if e.is_Number or e in (sp.pi, sp.E):
        return UNO
    if e.is_Symbol:
        if e not in dims:
            raise ErrorDimensional(f"falta la dimensión de {e}")
        return dims[e]
    if e.is_Add:
        ds = [dimension(a, dims) for a in e.args]
        for a, d in zip(e.args[1:], ds[1:]):
            if d != ds[0]:
                raise ErrorDimensional(f"suma de dimensiones distintas: [{e.args[0]}] = {ds[0]} y [{a}] = {d}")
        return ds[0]
    if e.is_Mul:
        out = UNO
        for a in e.args:
            out = out * dimension(a, dims)
        return out
    if e.is_Pow:
        b, k = e.args
        db = dimension(b, dims)
        if not dimension(k, dims).nula:
            raise ErrorDimensional(f"exponente con dimensiones: {k}")
        if db.nula:
            return UNO
        if not k.is_Number:
            raise ErrorDimensional(f"potencia simbólica de una magnitud con dimensiones: {e}")
        return db ** k
    if isinstance(e, sp.Derivative):
        d = dimension(e.expr, dims)
        for v, n in e.variable_count:
            d = d * dimension(v, dims) ** (-n)
        return d
    if isinstance(e, sp.Integral):
        d = dimension(e.function, dims)
        for lim in e.limits:
            d = d * dimension(lim[0], dims)
        return d
    if isinstance(e, sp.core.function.AppliedUndef):
        # f(r): se supone adimensional salvo que se declare como símbolo con el nombre de la función.
        return dims.get(sp.Symbol(e.func.__name__), UNO)
    if isinstance(e, (sp.Function,)) or e.is_Function:
        for a in e.args:
            if not dimension(a, dims).nula:
                raise ErrorDimensional(f"{e.func.__name__}() con argumento con dimensiones: {a}")
        return UNO
    if isinstance(e, sp.Abs):
        return dimension(e.args[0], dims)
    raise ErrorDimensional(f"no sé tratar {type(e).__name__}: {e}")


def comprobar(formula: str, dims: dict[str, str], geometricas: bool = False) -> dict:
    """Devuelve {"ok": bool, "dimension": str, "error": str|None}. `dims`: símbolo → dimensión en texto."""
    e = leer(formula)
    tabla = {sp.Symbol(k): dim(v, geometricas) for k, v in dims.items()}
    # Los símbolos creados por el parser pueden llevar supuestos (real=True): se casan por nombre.
    por_nombre = {s.name: d for s, d in tabla.items()}
    tabla.update({s: por_nombre[s.name] for s in lados(e).free_symbols if s.name in por_nombre})
    try:
        if isinstance(e, sp.Equality):
            di, dd = dimension(e.lhs, tabla), dimension(e.rhs, tabla)
            if di != dd:
                return {"ok": False, "dimension": str(di), "error": f"lado izquierdo {di} ≠ lado derecho {dd}"}
            return {"ok": True, "dimension": str(di), "error": None}
        return {"ok": True, "dimension": str(dimension(e, tabla)), "error": None}
    except ErrorDimensional as exc:
        return {"ok": False, "dimension": None, "error": str(exc)}
