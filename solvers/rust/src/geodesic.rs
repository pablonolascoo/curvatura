//! Geodésicas de partículas de prueba en la métrica de Alcubierre (subsistema M).
//!
//! Formulación hamiltoniana: H = ½ g^{μν} p_μ p_ν, con
//!   g^{tt} = -1, g^{tx} = -v f, g^{xx} = 1 - v² f², g^{yy} = g^{zz} = 1.
//! dx^μ/dλ = g^{μν} p_ν,   dp_μ/dλ = -½ ∂_μ g^{αβ} p_α p_β.
//! La burbuja se mueve con x_s = v t. Integración RK4 de paso fijo.

use crate::alcubierre::{dshape, shape, Params};

/// Estado: (t, x, y, p_t, p_x, p_y). Movimiento en el plano z = 0.
pub type State = [f64; 6];

fn rhs(s: &State, p: &Params) -> State {
    let [t, x, y, pt, px, py] = *s;
    let dx = x - p.v * t;
    let rs = (dx * dx + y * y).sqrt().max(1e-12);
    let f = shape(rs, p);
    let fp = dshape(rs, p);
    let v = p.v;
    // Derivadas de f respecto a t, x, y.
    let (df_dt, df_dx, df_dy) = (fp * (dx / rs) * (-v), fp * (dx / rs), fp * (y / rs));
    // dx^μ/dλ
    let tdot = -pt - v * f * px;
    let xdot = -v * f * pt + (1.0 - v * v * f * f) * px;
    let ydot = py;
    // -½ ∂_μ g^{αβ} p_α p_β, con ∂g^{tx} = -v ∂f, ∂g^{xx} = -2 v² f ∂f.
    let q = |d: f64| -0.5 * (2.0 * (-v * d) * pt * px + (-2.0 * v * v * f * d) * px * px);
    [tdot, xdot, ydot, q(df_dt), q(df_dx), q(df_dy)]
}

fn rk4(s: &State, p: &Params, h: f64) -> State {
    let add = |a: &State, b: &State, k: f64| -> State { std::array::from_fn(|i| a[i] + k * b[i]) };
    let k1 = rhs(s, p);
    let k2 = rhs(&add(s, &k1, h / 2.0), p);
    let k3 = rhs(&add(s, &k2, h / 2.0), p);
    let k4 = rhs(&add(s, &k3, h), p);
    std::array::from_fn(|i| s[i] + h / 6.0 * (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i]))
}

/// Partícula inicialmente en reposo respecto al observador euleriano en (x0, y0) a t = 0.
/// p_μ = -n_μ = (-1, 0, 0) cumple H = -½ (geodésica temporal normalizada).
pub fn eulerian_start(x0: f64, y0: f64) -> State {
    [0.0, x0, y0, -1.0, 0.0, 0.0]
}

/// Integra `steps` pasos de tamaño `h` y escribe (t, x, y) de cada paso en `out` (3 · steps).
pub fn trace(start: State, p: &Params, h: f64, steps: usize, out: &mut [f64]) -> State {
    assert!(out.len() >= 3 * steps, "búfer demasiado pequeño");
    let mut s = start;
    for k in 0..steps {
        s = rk4(&s, p, h);
        out[3 * k] = s[0];
        out[3 * k + 1] = s[1];
        out[3 * k + 2] = s[2];
    }
    s
}

/// Hamiltoniano, para comprobar la conservación (debe ser -½ en geodésicas temporales).
pub fn hamiltonian(s: &State, p: &Params) -> f64 {
    let [t, x, y, pt, px, py] = *s;
    let dx = x - p.v * t;
    let f = shape((dx * dx + y * y).sqrt(), p);
    0.5 * (-pt * pt - 2.0 * p.v * f * pt * px + (1.0 - p.v * p.v * f * f) * px * px + py * py)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn center_moves_with_bubble() {
        // En el centro (f = 1) un observador euleriano viaja con la burbuja: x(t) = v t.
        let p = Params { v: 2.0, r: 1.0, sigma: 8.0 };
        let mut out = vec![0.0; 3 * 2000];
        let end = trace(eulerian_start(0.0, 0.0), &p, 1e-3, 2000, &mut out);
        assert!((end[1] - p.v * end[0]).abs() < 1e-6, "x = {}, v t = {}", end[1], p.v * end[0]);
    }

    #[test]
    fn hamiltonian_is_conserved() {
        let p = Params { v: 0.8, r: 1.0, sigma: 4.0 };
        let s0 = eulerian_start(1.3, 0.4);
        let mut out = vec![0.0; 3 * 4000];
        let end = trace(s0, &p, 1e-3, 4000, &mut out);
        assert!((hamiltonian(&end, &p) - hamiltonian(&s0, &p)).abs() < 1e-8);
    }
}
