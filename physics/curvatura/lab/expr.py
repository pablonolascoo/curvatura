"""Lectura de fórmulas: DSL de la biblioteca (`a^2 * diff(f(x), x)`), SymPy o LaTeX."""

from __future__ import annotations

import re
from functools import lru_cache

import sympy as sp
from sympy.parsing.sympy_parser import (
    convert_xor,
    implicit_multiplication_application,
    parse_expr,
    standard_transformations,
)

TRANSFORMS = standard_transformations + (convert_xor, implicit_multiplication_application)
# Nombres que SymPy interpretaría como funciones o constantes y aquí son símbolos físicos.
RESERVADOS = {"E", "I", "N", "O", "Q", "S", "beta", "gamma", "zeta", "lambda", "Lambda"}


def _integral(f, x, a=None, b=None):
    """int(f, x) o int(f, x, a, b) como en el motor de la web; se deja sin evaluar (rápido)."""
    return sp.Integral(f, (x, a, b)) if a is not None else sp.Integral(f, x)


def _locales(texto: str) -> dict:
    loc: dict = {"pi": sp.pi, "e": sp.E, "oo": sp.oo, "diff": sp.diff, "int": _integral}
    for nombre in set(re.findall(r"[A-Za-z_][A-Za-z_0-9]*", texto)):
        if nombre in RESERVADOS:
            loc[nombre] = sp.Symbol(nombre, real=True)
    return loc


@lru_cache(maxsize=4096)
def leer(texto: str) -> sp.Expr | sp.Equality:
    """Devuelve una expresión o una igualdad (`a = b`). Admite LaTeX si va entre $…$ o empieza por \\."""
    t = texto.strip()
    if t.startswith("$") or t.startswith("\\"):
        return leer_latex(t.strip("$"))
    # Notación del motor de fórmulas de la web: «~» (aproximado), «inf», «… <= 0» como desigualdad final.
    t = t.replace("~", "=")
    t = re.sub(r"\binf\b", "oo", t)
    t = re.sub(r"\blambda\b", "lambda_", t)
    t = re.sub(r"\s*(<=|>=|<|>)\s*[-+]?\d+(\.\d+)?\s*$", "", t)
    if "==" not in t and t.count("=") == 1 and not re.search(r"[<>!]=", t):
        izq, der = t.split("=")
        return sp.Eq(leer(izq), leer(der), evaluate=False)
    t = t.replace("==", "-(") + ")" if "==" in t else t
    return parse_expr(t, local_dict=_locales(t), transformations=TRANSFORMS, evaluate=True)


def leer_latex(t: str) -> sp.Expr:
    from sympy.parsing.latex import parse_latex

    try:
        return parse_latex(t, backend="lark")
    except Exception:
        return parse_latex(t)


def lados(e) -> sp.Expr:
    """`a = b` → a - b; una expresión se devuelve tal cual."""
    return e.lhs - e.rhs if isinstance(e, sp.Equality) else e


def simbolos(e) -> list[sp.Symbol]:
    return sorted(lados(e).free_symbols, key=lambda s: s.name)
