"""Demostraciones exactas con Z3 (aritmética real no lineal).

Sirve para desigualdades polinómicas o racionales con hipótesis: «para todo v>0, R>0: E<0».
Si Z3 encuentra un modelo de la negación, devuelve el contraejemplo exacto.
Para funciones trascendentes (tanh, exp…) usar `cotas.demostrar_signo`.
"""

from __future__ import annotations

import sympy as sp
import z3

from .expr import lados, leer


def a_z3(e: sp.Expr, vars_: dict[sp.Symbol, z3.ArithRef]):
    if e.is_Symbol:
        return vars_[e]
    if e.is_Integer:
        return z3.IntVal(int(e)) if False else z3.RealVal(int(e))
    if e.is_Rational:
        return z3.RealVal(f"{e.p}/{e.q}")
    if e.is_Float:
        return z3.RealVal(str(sp.Rational(e)))
    if e.is_Add:
        out = a_z3(e.args[0], vars_)
        for a in e.args[1:]:
            out = out + a_z3(a, vars_)
        return out
    if e.is_Mul:
        out = a_z3(e.args[0], vars_)
        for a in e.args[1:]:
            out = out * a_z3(a, vars_)
        return out
    if e.is_Pow:
        b, k = e.args
        if k.is_Integer:
            base = a_z3(b, vars_)
            if k >= 0:
                out = z3.RealVal(1)
                for _ in range(int(k)):
                    out = out * base
                return out
            out = z3.RealVal(1)
            for _ in range(int(-k)):
                out = out * base
            return 1 / out
        if k == sp.Rational(1, 2):
            return a_z3(b, vars_) ** z3.RealVal("1/2")
    if e == sp.pi:
        raise ValueError("pi no es algebraico: sustitúyelo por un símbolo positivo o usa cotas")
    raise ValueError(f"Z3 no admite {type(e).__name__}: {e}")


def demostrar(objetivo: str, hipotesis: list[str] | None = None, segundos: int = 20) -> dict:
    """objetivo: «E < 0», «a^2 + b^2 >= 2*a*b»… hipótesis: «v > 0», «R > 0»."""
    hipotesis = hipotesis or []
    rel = sp.sympify(objetivo.replace("^", "**"), locals={"pi": sp.Symbol("pi_", positive=True)})
    hs = [sp.sympify(h.replace("^", "**")) for h in hipotesis]
    syms = set(rel.free_symbols).union(*[h.free_symbols for h in hs]) if hs else set(rel.free_symbols)
    vars_ = {s: z3.Real(s.name) for s in syms}
    def conv(r):
        izq, der = a_z3(r.lhs, vars_), a_z3(r.rhs, vars_)
        return {"<": izq < der, "<=": izq <= der, ">": izq > der, ">=": izq >= der, "==": izq == der}[r.rel_op]
    s = z3.Solver()
    s.set("timeout", segundos * 1000)
    for h in hs:
        s.add(conv(h))
    s.add(z3.Not(conv(rel)))
    r = s.check()
    if r == z3.unsat:
        return {"resultado": "demostrada", "metodo": "z3 (la negación es imposible)"}
    if r == z3.sat:
        m = s.model()
        return {"resultado": "falsa", "metodo": "z3", "contraejemplo": {str(d): str(m[d]) for d in m.decls()}}
    return {"resultado": "indeterminada", "metodo": f"z3 sin respuesta en {segundos} s"}
