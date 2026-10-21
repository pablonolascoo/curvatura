"""Laboratorio de fórmulas: cada herramienta, con un caso verdadero y uno falso."""

import numpy as np
import pytest
import sympy as sp

for _m in ("symengine", "flint", "z3", "numba"):  # extra «lab»: uv sync --extra lab
    pytest.importorskip(_m)
from curvatura.lab.cotas import demostrar_signo, rango  # noqa: E402
from curvatura.lab.descubrir import rapido  # noqa: E402
from curvatura.lab.igualdad import iguales  # noqa: E402
from curvatura.lab.prueba import demostrar  # noqa: E402
from curvatura.lab.rapido import evaluar  # noqa: E402
from curvatura.lab.tensores import catalogo, densidad_euleriana, einstein, t, x, y, z  # noqa: E402
from curvatura.lab.unidades import comprobar  # noqa: E402


def test_igualdad():
    assert iguales("sin(x)^2 + cos(x)^2 = 1").veredicto == "demostrada"
    assert iguales("tanh(2*x) = 2*tanh(x)/(1+tanh(x)^2)").veredicto in ("demostrada", "numerica")
    r = iguales("x^2 = x")
    assert r.veredicto == "falsa" and r.contraejemplo


def test_unidades():
    assert comprobar("E = m*c^2", {"E": "energia", "m": "masa", "c": "velocidad"})["ok"]
    assert not comprobar("E = m*c", {"E": "energia", "m": "masa", "c": "velocidad"})["ok"]
    assert not comprobar("exp(m)", {"m": "masa"})["ok"]


def test_cotas():
    lo, hi = rango("x^2 - 1", {"x": (0, 2)})
    assert lo <= -1 and hi >= 3
    assert demostrar_signo("x^2 - 2*x + 1.1", {"x": (0, 2)}, ">0").resultado == "demostrada"
    assert demostrar_signo("x^2 - 2*x + 0.9", {"x": (0, 2)}, ">0").resultado == "falsa"


def test_z3():
    assert demostrar("a^2 + b^2 >= 2*a*b")["resultado"] == "demostrada"
    assert demostrar("x^3 - x > 0", ["x > 0"])["resultado"] == "falsa"


def test_rapido():
    v = evaluar("exp(-x^2)*y", {"x": np.array([0.0, 1.0]), "y": np.array([2.0, 2.0])})
    assert np.allclose(v, [2.0, 2 * np.exp(-1)])


def test_descubrir():
    rng = np.random.default_rng(1)
    m, v = rng.uniform(1, 5, 200), rng.uniform(1, 5, 200)
    mejor = rapido({"m": m, "v": v}, 0.5 * m * v**2)[-1]
    assert mejor["error_relativo"] < 1e-9
    assert sp.simplify(sp.sympify(mejor["formula"]) - sp.sympify("m*v**2/2")) == 0


def test_alcubierre_contra_el_paper():
    g, a, b = catalogo("alcubierre")
    rho = densidad_euleriana(einstein(g)["einstein"], a, b)
    v, u, f = sp.Symbol("v", positive=True), sp.Symbol("u"), sp.Function("f")
    rs = sp.sqrt((x - v * t) ** 2 + y**2 + z**2)
    paper = -(v**2 * (y**2 + z**2)) / (32 * sp.pi * rs**2) * sp.Subs(sp.Derivative(f(u), u), u, rs) ** 2
    assert iguales(rho, paper, simbolica=False).veredicto == "numerica"
    assert iguales(rho, 2 * paper, simbolica=False).veredicto == "falsa"


def test_barrido_cpu_y_gpu():
    from curvatura.lab.rapido import barrido_cpu

    r = barrido_cpu("x^2 - 1", {"x": (-2.0, 2.0, 401)})
    assert abs(r["min"] + 1) < 1e-9 and abs(r["max"] - 3) < 1e-9
    try:
        from curvatura.lab import gpu
    except Exception:
        return
    if not gpu.disponible():
        return  # sin GPU (CI): solo CPU
    g = gpu.barrido("x^2 - 1", {"x": (-2.0, 2.0, 401)})
    assert abs(g["min"] + 1) < 1e-5 and abs(g["max"] - 3) < 1e-5
    v = gpu.evaluar("exp(-x^2)*y", {"x": np.array([0.0, 1.0], np.float32), "y": np.array([2.0, 2.0], np.float32)})
    assert np.allclose(v, [2.0, 2 * np.exp(-1)], rtol=1e-6)
