"""Cotas rigurosas con aritmética de bolas (Arb, vía python-flint).

Una bola [m ± r] contiene con certeza el valor exacto. Evaluando la fórmula sobre una caja de
parámetros se obtiene un intervalo que contiene todos sus valores. Si no basta, se parte la caja
(ramificación y poda) hasta demostrar el signo o encontrar un contraejemplo.

Ejemplo: demostrar que la densidad de energía de Alcubierre es ≤ 0 en toda una región.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field

import sympy as sp
from flint import arb, ctx

from .expr import lados, leer

FUNCIONES = {
    "sin": lambda x: x.sin(), "cos": lambda x: x.cos(), "tan": lambda x: x.tan(), "exp": lambda x: x.exp(),
    "log": lambda x: x.log(), "sqrt": lambda x: x.sqrt(), "tanh": lambda x: x.tanh(), "sinh": lambda x: x.sinh(),
    "cosh": lambda x: x.cosh(), "atan": lambda x: x.atan(), "asin": lambda x: x.asin(), "acos": lambda x: x.acos(),
    "sech": lambda x: 1 / x.cosh(), "Abs": abs, "pi": arb.pi(), "E": arb(1).exp(),
}


def _par(x, k):
    """x^k con k par: nunca negativo (la aritmética de bolas ingenua daría un intervalo con negativos)."""
    if not isinstance(x, arb):
        return x ** int(k)
    lo, hi = x.lower(), x.upper()
    if lo <= 0 <= hi:
        m = max(abs(lo), abs(hi)) ** int(k)
        return arb(m / 2, m / 2)
    return x ** int(k)


FUNCIONES["par"] = _par
_PAR = sp.Function("par")


def compilar(e: sp.Expr, syms: list[sp.Symbol]):
    e = e.replace(lambda n: n.is_Pow and n.exp.is_Integer and n.exp > 0 and n.exp % 2 == 0,
                  lambda n: _PAR(n.base, n.exp))
    return sp.lambdify(syms, e, modules=[FUNCIONES, "math"])


def _signo_bola(v) -> str | None:
    v = v if isinstance(v, arb) else arb(v)
    if not v.is_finite():
        return None
    lo, hi = v.lower(), v.upper()
    return "+" if lo > 0 else "0+" if lo >= 0 else "-" if hi < 0 else "0-" if hi <= 0 else None


def _producto(a: str | None, b: str | None) -> str | None:
    if a is None or b is None:
        return None
    neg = (a.endswith("-")) != (b.endswith("-"))
    estricto = not a.startswith("0") and not b.startswith("0")
    return ("" if estricto else "0") + ("-" if neg else "+")


class Signos:
    """Signo riguroso de un producto analizando cada factor por separado (evita el redondeo de las bolas)."""

    def __init__(self, e: sp.Expr, syms: list[sp.Symbol]):
        self.syms = syms
        self.f: dict = {}
        self.e = e

    def _eval(self, e, bolas):
        k = sp.srepr(e)
        if k not in self.f:
            self.f[k] = compilar(e, self.syms)
        try:
            return _signo_bola(self.f[k](*bolas))
        except (ZeroDivisionError, ValueError):
            return None

    def signo(self, e, bolas) -> str | None:
        if e.is_Number:
            return "+" if e > 0 else "-" if e < 0 else "0+"
        if e.is_Mul:
            out = "+"
            for a in e.args:
                out = _producto(out, self.signo(a, bolas))
                if out is None:
                    return None
            return out
        if e.is_Pow and e.exp.is_Integer:
            b = self.signo(e.base, bolas)
            if e.exp % 2 == 0:
                return "+" if b in ("+", "-") else "0+"
            if b is None or (e.exp < 0 and b.startswith("0")):
                return self._eval(e, bolas)
            return b
        return self._eval(e, bolas)


def caja(intervalos: list[tuple[float, float]]) -> list[arb]:
    return [arb((a + b) / 2, (b - a) / 2) for a, b in intervalos]


@dataclass
class Cota:
    objetivo: str
    resultado: str  # "demostrada", "falsa", "parcial"
    fraccion_demostrada: float
    cajas: int
    rango: tuple[float, float] | None = None
    contraejemplo: dict = field(default_factory=dict)

    def dict(self) -> dict:
        return asdict(self)


def rango(formula: str, dominio: dict[str, tuple[float, float]], precision: int = 128) -> tuple[float, float]:
    """Intervalo garantizado que contiene todos los valores de la fórmula en la caja."""
    e = lados(leer(formula))
    syms = sorted(e.free_symbols, key=lambda s: s.name)
    ctx.prec = precision
    v = compilar(e, syms)(*caja([dominio[s.name] for s in syms]))
    v = v if isinstance(v, arb) else arb(v)
    return float(v.lower()), float(v.upper())


def demostrar_signo(formula: str, dominio: dict[str, tuple[float, float]], signo: str = "<=0",
                    max_cajas: int = 20000, precision: int = 128) -> Cota:
    """Demuestra `formula signo` en todo el dominio (signo: <0, <=0, >0, >=0)."""
    e = lados(leer(formula))
    syms = sorted(e.free_symbols, key=lambda s: s.name)
    faltan = [s.name for s in syms if s.name not in dominio]
    if faltan:
        raise ValueError(f"falta el dominio de: {', '.join(faltan)}")
    ctx.prec = precision
    f = compilar(e, syms)
    signos = Signos(e, syms)
    vol_total = 1.0
    for s in syms:
        a, b = dominio[s.name]
        vol_total *= (b - a) or 1.0

    def ok(v: arb) -> bool | None:
        lo, hi = v.lower(), v.upper()
        if signo == "<0":
            return True if hi < 0 else False if lo >= 0 else None
        if signo == "<=0":
            return True if hi <= 0 else False if lo > 0 else None
        if signo == ">0":
            return True if lo > 0 else False if hi <= 0 else None
        return True if lo >= 0 else False if hi < 0 else None

    pila = [[dominio[s.name] for s in syms]]
    probado, n = 0.0, 0
    lo_g, hi_g = float("inf"), float("-inf")
    while pila and n < max_cajas:
        c = pila.pop()
        n += 1
        try:
            v = f(*caja(c))
            v = v if isinstance(v, arb) else arb(v)
        except (ZeroDivisionError, ValueError):
            v = None
        r = ok(v) if v is not None and v.is_finite() else None
        if r is None:
            sg = signos.signo(e, caja(c))
            if sg is not None:
                r = {"<0": sg == "-", "<=0": sg in ("-", "0-"), ">0": sg == "+", ">=0": sg in ("+", "0+")}[signo] or None
        vol = 1.0
        for a, b in c:
            vol *= (b - a) or 1.0
        if r is True:
            probado += vol
            lo_g, hi_g = min(lo_g, float(v.lower())), max(hi_g, float(v.upper()))
            continue
        if r is False:
            centro = {s.name: (a + b) / 2 for s, (a, b) in zip(syms, c)}
            return Cota(f"{formula} {signo}", "falsa", probado / vol_total, n, None, centro)
        # Indeterminada: se comprueba el centro (posible contraejemplo) y se parte por la arista mayor.
        centro = [(a + b) / 2 for a, b in c]
        try:
            vc = f(*[arb(x) for x in centro])
            if ok(vc if isinstance(vc, arb) else arb(vc)) is False:
                return Cota(f"{formula} {signo}", "falsa", probado / vol_total, n, None,
                            {s.name: x for s, x in zip(syms, centro)})
        except (ZeroDivisionError, ValueError):
            pass
        k = max(range(len(c)), key=lambda i: c[i][1] - c[i][0])
        a, b = c[k]
        if b - a < 1e-12:
            continue
        m = (a + b) / 2
        pila.append(c[:k] + [(a, m)] + c[k + 1:])
        pila.append(c[:k] + [(m, b)] + c[k + 1:])
    frac = probado / vol_total
    res = "demostrada" if not pila and frac > 0.999999 else "parcial"
    return Cota(f"{formula} {signo}", res, frac, n, (lo_g, hi_g) if hi_g >= lo_g else None)
