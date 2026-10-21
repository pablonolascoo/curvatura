use rayon::prelude::*;
use std::time::Instant;

const V: f64 = 0.5;
const R: f64 = 1.0;
const SIGMA: f64 = 4.0;
const HALF: f64 = 2.5;

#[inline]
fn sech2(u: f64) -> f64 { let e = (-2.0 * u.abs()).exp(); 4.0 * e / ((1.0 + e) * (1.0 + e)) }

#[inline]
fn rho(x: f64, y: f64) -> f64 {
    let r2 = x * x + y * y;
    if r2 == 0.0 { return 0.0; }
    let r = r2.sqrt();
    let fp = SIGMA * (sech2(SIGMA * (r + R)) - sech2(SIGMA * (r - R))) / (2.0 * (SIGMA * R).tanh());
    -V * V * (y * y / r2) * fp * fp / (32.0 * std::f64::consts::PI)
}

fn row(n: usize, j: usize) -> f64 {
    let step = 2.0 * HALF / (n as f64 - 1.0);
    let y = -HALF + step * j as f64;
    (0..n).map(|i| rho(-HALF + step * i as f64, y)).sum()
}

fn main() {
    let n: usize = std::env::args().nth(1).unwrap().parse().unwrap();
    let (mut b1, mut bp, mut s) = (f64::INFINITY, f64::INFINITY, 0.0);
    for _ in 0..5 {
        let t = Instant::now();
        s = (0..n).map(|j| row(n, j)).sum();
        b1 = b1.min(t.elapsed().as_secs_f64());
        let t = Instant::now();
        let _p: f64 = (0..n).into_par_iter().map(|j| row(n, j)).sum();
        bp = bp.min(t.elapsed().as_secs_f64());
    }
    println!("rust {:.3} {:.3} {:.6e}", b1 * 1e3, bp * 1e3, s);
}
