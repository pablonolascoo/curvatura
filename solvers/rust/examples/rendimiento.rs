//! cargo run --release --features gpu --example rendimiento [n]
//! Mismo campo (θ y ρ_E en n × n puntos) en un hilo, en todos los núcleos y en la GPU.
use curvatura_core::alcubierre::{field_plane, field_plane_par, Params};
use std::time::Instant;

fn main() {
    let n: usize = std::env::args().nth(1).and_then(|a| a.parse().ok()).unwrap_or(4096);
    let p = Params { v: 1.0, r: 1.0, sigma: 8.0 };
    let (mut t, mut r) = (vec![0.0; n * n], vec![0.0; n * n]);
    let mpts = (n * n) as f64 / 1e6;
    let mide = |nombre: &str, f: &mut dyn FnMut()| {
        f();
        let i = Instant::now();
        for _ in 0..3 { f(); }
        let ms = i.elapsed().as_secs_f64() * 1000.0 / 3.0;
        println!("{nombre:<24} {ms:>9.2} ms   {:>8.0} Mpuntos/s", mpts / (ms / 1000.0));
    };
    println!("{n} × {n} = {mpts:.1} M puntos · {} hilos", rayon::current_num_threads());
    mide("CPU 1 hilo (f64)", &mut || field_plane(&p, 2.5, n, &mut t, &mut r));
    mide("CPU todos (f64, rayon)", &mut || field_plane_par(&p, 2.5, n, &mut t, &mut r));
    match curvatura_core::gpu::Gpu::new() {
        Some(g) => {
            println!("GPU: {}", g.nombre);
            let (mut tg, mut rg) = (vec![0f32; n * n], vec![0f32; n * n]);
            mide("GPU con lectura (f32)", &mut || g.field_plane_into(&p, 2.5, n, &mut tg, &mut rg));
            mide("GPU solo cálculo (f32)", &mut || g.solo_calculo(&p, 2.5, n));
        }
        None => println!("GPU: no disponible"),
    }
}
