//! Integración numérica.

/// Simpson compuesto con `n` intervalos (se redondea a par).
pub fn simpson(f: impl Fn(f64) -> f64, a: f64, b: f64, n: usize) -> f64 {
    let n = if n % 2 == 1 { n + 1 } else { n.max(2) };
    let h = (b - a) / n as f64;
    let mut s = f(a) + f(b);
    for i in 1..n {
        s += f(a + h * i as f64) * if i % 2 == 1 { 4.0 } else { 2.0 };
    }
    s * h / 3.0
}

#[cfg(test)]
mod tests {
    #[test]
    fn integrates_polynomial_exactly() {
        let v = super::simpson(|x| x * x * x - 2.0 * x, 0.0, 2.0, 10);
        assert!((v - 0.0).abs() < 1e-12);
    }
}
