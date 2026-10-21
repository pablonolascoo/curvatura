import numpy as np
import pytest
import sympy as sp

from curvatura.energy_conditions import nec_min, wec_min
from curvatura.metrics import alcubierre as A
from curvatura.tensor import eulerian_energy_density, geometry

V, R, SIG = 0.5, 1.0, 4.0


@pytest.fixture(scope="module")
def rho_symbolic():
    (t, x, y, z), g, alpha, beta, _ = A.symbolic(sp.Rational(1, 2), sp.Integer(1), sp.Integer(4))
    geo = geometry(g, (t, x, y, z))
    rho = eulerian_energy_density(geo, alpha, beta)
    return sp.lambdify((t, x, y, z), rho, "numpy")


@pytest.mark.parametrize("pt", [(0.9, 0.3, 0.1), (-1.1, 0.2, -0.4), (0.2, 1.0, 0.0), (0.0, 0.0, 1.05)])
def test_einstein_matches_analytic_energy_density(rho_symbolic, pt):
    """G_μν n^μ n^ν / 8π calculado desde la métrica = fórmula cerrada de Alcubierre."""
    x, y, z = pt
    numeric = float(rho_symbolic(0.0, x, y, z))
    analytic = float(A.energy_density(x, y, z, V, R, SIG))
    assert numeric == pytest.approx(analytic, rel=1e-9, abs=1e-14)


def test_energy_density_is_never_positive():
    g = np.linspace(-2, 2, 41)
    X, Y, Z = np.meshgrid(g, g, g, indexing="ij")
    assert np.all(A.energy_density(X, Y, Z, V, R, SIG) <= 0)


def test_expansion_sign_front_and_back():
    assert A.expansion(R, 0, 0, V, R, SIG) < 0  # delante: contracción
    assert A.expansion(-R, 0, 0, V, R, SIG) > 0  # detrás: expansión


def test_shape_function_limits():
    assert A.shape(0.0, R, 20) == pytest.approx(1.0, rel=1e-12)
    assert A.shape(5.0, R, 20) == pytest.approx(0.0, abs=1e-12)


def test_total_energy_volume_integral_matches_radial_reduction():
    """∫ρ dV en 3D (cilíndricas) = -(v²/12)∫r² f'² dr."""
    from scipy import integrate

    f = lambda rho, x: 2 * np.pi * rho * A.energy_density(x, rho, 0.0, V, R, SIG)  # noqa: E731
    E3, _ = integrate.dblquad(f, -4, 4, 0, 4, epsabs=1e-10, epsrel=1e-8)
    assert E3 == pytest.approx(A.total_energy(V, R, SIG), rel=1e-6)


def test_thin_wall_limit():
    E = A.total_energy(1.0, 10.0, 50.0)
    assert E == pytest.approx(A.total_energy_thin_wall(1.0, 10.0, 50.0), rel=1e-2)


def test_energy_conditions_detect_negative_density():
    rho = -1.0
    T = np.diag([rho, 0.0, 0.0, 0.0])
    assert wec_min(T) < 0
    assert nec_min(np.diag([1.0, 1.0, 1.0, 1.0])) > 0


def test_energy_conditions_violated_in_the_wall():
    """En la pared de Alcubierre se violan NEC y WEC; cerca del centro el contenido es despreciable."""
    from curvatura.tensor import eulerian_tetrad_flat, stress_energy_frame

    (t, x, y, z), g, alpha, beta, _ = A.symbolic(sp.Rational(1, 2), sp.Integer(1), sp.Integer(4))
    geo = geometry(g, (t, x, y, z))
    T = sp.lambdify((t, x, y, z), stress_energy_frame(geo, eulerian_tetrad_flat(alpha, beta)), "numpy")
    wall = np.array(T(0.0, 0.3, 0.9, 0.0), dtype=float)
    centre = np.array(T(0.0, 0.05, 0.02, 0.0), dtype=float)  # r = 0 exacto es 0/0 en la expresión
    assert wec_min(wall) < 0 and nec_min(wall) < 0
    assert np.abs(centre).max() < 1e-2 * np.abs(wall).max()
