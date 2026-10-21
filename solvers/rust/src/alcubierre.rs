//! Métrica de Alcubierre (1994): ds² = -dt² + (dx - v f(r_s) dt)² + dy² + dz².

#[derive(Clone, Copy, Debug)]
pub struct Params {
    /// Velocidad de la burbuja (fracción de c).
    pub v: f64,
    /// Radio de la burbuja.
    pub r: f64,
    /// Inverso del grosor de pared.
    pub sigma: f64,
}

/// sech² estable: 4e^{-2|u|} / (1 + e^{-2|u|})².
#[inline]
pub fn sech2(u: f64) -> f64 {
    let e = (-2.0 * u.abs()).exp();
    4.0 * e / ((1.0 + e) * (1.0 + e))
}

#[inline]
pub fn shape(rs: f64, p: &Params) -> f64 {
    ((p.sigma * (rs + p.r)).tanh() - (p.sigma * (rs - p.r)).tanh()) / (2.0 * (p.sigma * p.r).tanh())
}

#[inline]
pub fn dshape(rs: f64, p: &Params) -> f64 {
    p.sigma * (sech2(p.sigma * (rs + p.r)) - sech2(p.sigma * (rs - p.r))) / (2.0 * (p.sigma * p.r).tanh())
}

/// Expansión θ = v (x - x_s)/r_s · f'(r_s).
pub fn expansion(x: f64, y: f64, z: f64, p: &Params, xs: f64) -> f64 {
    let dx = x - xs;
    let rs = (dx * dx + y * y + z * z).sqrt();
    if rs == 0.0 { 0.0 } else { p.v * (dx / rs) * dshape(rs, p) }
}

/// Densidad de energía euleriana ρ_E = -(1/32π) v² (ρ²/r_s²) f'(r_s)².
pub fn energy_density(x: f64, y: f64, z: f64, p: &Params, xs: f64) -> f64 {
    let dx = x - xs;
    let r2 = dx * dx + y * y + z * z;
    if r2 == 0.0 {
        return 0.0;
    }
    let fp = dshape(r2.sqrt(), p);
    -p.v * p.v * ((y * y + z * z) / r2) * fp * fp / (32.0 * std::f64::consts::PI)
}

/// Energía total E = -(v²/12) ∫ r² f'(r)² dr, integrada solo sobre la pared, donde f' ≠ 0.
pub fn total_energy(p: &Params) -> f64 {
    let a = (p.r - 24.0 / p.sigma).max(0.0);
    let b = p.r + 24.0 / p.sigma;
    let i = crate::integrate::simpson(|r| { let f = dshape(r, p); r * r * f * f }, a, b, 4000);
    -p.v * p.v * i / 12.0
}

/// Límite de pared delgada (σR ≫ 1): E ≈ -v² R² σ / 36.
pub fn total_energy_thin_wall(p: &Params) -> f64 {
    -p.v * p.v * p.r * p.r * p.sigma / 36.0
}

/// Muestrea θ y ρ_E en el plano z = 0 sobre [-L, L]² con n × n puntos (fila mayor en y).
pub fn field_plane(p: &Params, half: f64, n: usize, theta: &mut [f64], rho: &mut [f64]) {
    assert!(theta.len() >= n * n && rho.len() >= n * n, "búferes demasiado pequeños");
    let step = if n > 1 { 2.0 * half / (n as f64 - 1.0) } else { 0.0 };
    for j in 0..n {
        let y = -half + step * j as f64;
        for i in 0..n {
            let x = -half + step * i as f64;
            theta[j * n + i] = expansion(x, y, 0.0, p, 0.0);
            rho[j * n + i] = energy_density(x, y, 0.0, p, 0.0);
        }
    }
}

/// Igual que [`field_plane`] pero repartiendo las filas entre todos los núcleos (feature `parallel`).
#[cfg(feature = "parallel")]
pub fn field_plane_par(p: &Params, half: f64, n: usize, theta: &mut [f64], rho: &mut [f64]) {
    use rayon::prelude::*;
    assert!(theta.len() >= n * n && rho.len() >= n * n, "búferes demasiado pequeños");
    let step = if n > 1 { 2.0 * half / (n as f64 - 1.0) } else { 0.0 };
    theta[..n * n]
        .par_chunks_mut(n)
        .zip(rho[..n * n].par_chunks_mut(n))
        .enumerate()
        .for_each(|(j, (tr, rr))| {
            let y = -half + step * j as f64;
            for i in 0..n {
                let x = -half + step * i as f64;
                tr[i] = expansion(x, y, 0.0, p, 0.0);
                rr[i] = energy_density(x, y, 0.0, p, 0.0);
            }
        });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn matches_python_and_cpp() {
        // Mismo valor que physics/ y solvers/cpp: E(v=1, R=1, σ=8) = -0.223342
        let e = total_energy(&Params { v: 1.0, r: 1.0, sigma: 8.0 });
        assert!((e + 0.223342).abs() < 1e-6, "E = {e}");
    }

    #[test]
    fn thin_wall_limit() {
        let p = Params { v: 1.0, r: 10.0, sigma: 50.0 };
        let rel = (total_energy(&p) / total_energy_thin_wall(&p) - 1.0).abs();
        assert!(rel < 1e-2, "error relativo {rel}");
    }

    #[test]
    fn expansion_sign() {
        let p = Params { v: 0.5, r: 1.0, sigma: 4.0 };
        assert!(expansion(1.0, 0.0, 0.0, &p, 0.0) < 0.0);
        assert!(expansion(-1.0, 0.0, 0.0, &p, 0.0) > 0.0);
    }

    #[cfg(feature = "parallel")]
    #[test]
    fn parallel_matches_serial() {
        let p = Params { v: 1.2, r: 1.0, sigma: 5.0 };
        let n = 300;
        let (mut a, mut b) = (vec![0.0; n * n], vec![0.0; n * n]);
        let (mut c, mut d) = (vec![0.0; n * n], vec![0.0; n * n]);
        field_plane(&p, 2.5, n, &mut a, &mut b);
        field_plane_par(&p, 2.5, n, &mut c, &mut d);
        assert_eq!(a, c);
        assert_eq!(b, d);
    }

    #[test]
    fn energy_density_never_positive() {
        let p = Params { v: 0.5, r: 1.0, sigma: 4.0 };
        let n = 64;
        let (mut t, mut r) = (vec![0.0; n * n], vec![0.0; n * n]);
        field_plane(&p, 2.0, n, &mut t, &mut r);
        assert!(r.iter().all(|&x| x <= 0.0));
    }
}
