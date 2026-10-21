"""¿Son iguales dos expresiones? Cadena de pruebas de la más barata a la más cara.

  1. symengine: expandir la diferencia (milisegundos).
  2. Puntos aleatorios con mpmath a 50 dígitos (identidad casi segura, Schwartz-Zippel).
     Un solo punto con diferencia grande es un contraejemplo: la igualdad es falsa.
  3. SymPy: cancel / trigsimp / simplify con tiempo límite, para dar una prueba simbólica.

Veredictos: "demostrada" (simbólica), "numerica" (probabilidad de error despreciable), "falsa"
(con contraejemplo) o "indeterminada".
"""

from __future__ import annotations

import random
import signal
from contextlib import contextmanager
from dataclasses import asdict, dataclass, field

import mpmath as mp
import sympy as sp

from .expr import lados, leer


@dataclass
class Veredicto:
    veredicto: str
    metodo: str
    detalle: str = ""
    puntos: int = 0
    error_max: float = 0.0
    contraejemplo: dict = field(default_factory=dict)

    def dict(self) -> dict:
        return asdict(self)


@contextmanager
def limite(segundos: float):
    """Tiempo límite (solo en sistemas con SIGALRM; en Windows no corta, pero no falla)."""
    if not hasattr(signal, "SIGALRM"):
        yield
        return
    def _alarma(*_):
        raise TimeoutError
    viejo = signal.signal(signal.SIGALRM, _alarma)
    signal.setitimer(signal.ITIMER_REAL, segundos)
    try:
        yield
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
        signal.signal(signal.SIGALRM, viejo)


def _probar(d: sp.Expr) -> str | None:
    for nombre, fn in (("cancel", sp.cancel), ("trigsimp", sp.trigsimp), ("simplify", sp.simplify)):
        try:
            if fn(d) == 0:
                return nombre
        except Exception:
            continue
    return None


def _simbolica(d: sp.Expr, segundos: float) -> str | None:
    """SymPy con tiempo límite: alarma en el hilo principal; subproceso en cualquier otro (servidor, agente)."""
    import threading

    if threading.current_thread() is threading.main_thread() and hasattr(signal, "SIGALRM"):
        try:
            with limite(segundos):
                return _probar(d)
        except TimeoutError:
            return None
    from concurrent.futures import ProcessPoolExecutor, TimeoutError as Agotado

    ex = ProcessPoolExecutor(max_workers=1)
    try:
        return ex.submit(_probar, d).result(timeout=segundos)
    except (Agotado, Exception):
        return None
    finally:
        for p in list(getattr(ex, "_processes", {}).values()):
            p.kill()
        ex.shutdown(wait=False, cancel_futures=True)


def _cero_symengine(d: sp.Expr) -> bool | None:
    try:
        import symengine as se

        return se.expand(se.sympify(d)) == 0
    except Exception:
        return None


def _muestra(s: sp.Symbol, rnd: random.Random, dominio: dict) -> mp.mpf:
    lo, hi = dominio.get(s.name, (0.1, 3.0) if s.is_positive else (-3.0, 3.0))
    return mp.mpf(rnd.uniform(lo, hi))


def numerica(d: sp.Expr, puntos: int = 24, dominio: dict | None = None, semilla: int = 7) -> tuple[str, float, dict, int]:
    dominio = dominio or {}
    syms = sorted(d.free_symbols, key=lambda s: s.name)
    funcs = sorted({f.func for f in d.atoms(sp.core.function.AppliedUndef)}, key=str)
    if funcs:  # funciones sin definir (f(r)): se prueban con varias funciones concretas
        pruebas = [sp.Lambda(sp.Symbol("u"), e) for e in (sp.tanh(sp.Symbol("u")), sp.exp(-sp.Symbol("u") ** 2), 1 / (1 + sp.Symbol("u") ** 2))]
        d = d.subs({f: pruebas[i % len(pruebas)] for i, f in enumerate(funcs)}).doit()
    f = sp.lambdify(syms, d, modules="mpmath")
    rnd = random.Random(semilla)
    peor, validos = 0.0, 0
    with mp.workdps(50):
        for _ in range(puntos * 3):
            if validos >= puntos:
                break
            vals = [_muestra(s, rnd, dominio) for s in syms]
            try:
                v = f(*vals)
                v = abs(mp.mpc(v))
            except (ZeroDivisionError, ValueError, OverflowError, TypeError):
                continue
            if not mp.isfinite(v):
                continue
            validos += 1
            if v > mp.mpf("1e-30"):
                return "falsa", float(v), {s.name: float(x) for s, x in zip(syms, vals)}, validos
            peor = max(peor, float(v))
    return ("numerica" if validos else "indeterminada"), peor, {}, validos


def iguales(a: str | sp.Expr, b: str | sp.Expr | None = None, dominio: dict | None = None,
            puntos: int = 24, simbolica: bool = True, segundos: float = 8.0) -> Veredicto:
    """`iguales("a = b")`, `iguales(a, b)` o `iguales(expr)` (¿es cero?)."""
    ea = leer(a) if isinstance(a, str) else a
    d = lados(ea) if b is None else lados(ea) - (leer(b) if isinstance(b, str) else b)
    d = d.doit() if isinstance(d, sp.Basic) else sp.sympify(d)
    # Un mismo nombre con supuestos distintos (x real, x positivo) es el mismo símbolo físico.
    if len({s.name for s in d.free_symbols}) != len(d.free_symbols):
        d = sp.sympify(str(d))  # xreplace no entra en Subs/Derivative: se reconstruye por texto

    if d == 0 or _cero_symengine(d):
        return Veredicto("demostrada", "symengine.expand")
    try:  # trigonométricas e hiperbólicas: en exponenciales, symengine las anula al expandir
        if _cero_symengine(d.rewrite(sp.exp)):
            return Veredicto("demostrada", "symengine.expand (en exponenciales)")
    except Exception:
        pass
    v, err, contra, n = numerica(d, puntos, dominio)
    if v == "falsa":
        return Veredicto("falsa", "mpmath 50 dígitos", "contraejemplo encontrado", n, err, contra)
    if simbolica:
        nombre = _simbolica(d, segundos)
        if nombre:
            return Veredicto("demostrada", f"sympy.{nombre}", puntos=n, error_max=err)
    return Veredicto(v, "mpmath 50 dígitos", f"{n} puntos aleatorios iguales; sin prueba simbólica en {segundos:.0f} s", n, err)
