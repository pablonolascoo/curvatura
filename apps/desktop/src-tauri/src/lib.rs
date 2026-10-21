//! Aplicación de escritorio de Curvatura.
//!
//! Sirve la web estática (apps/web/out) dentro de una ventana nativa y expone el núcleo
//! numérico en Rust nativo como comandos. El WebAssembly de la web sigue funcionando igual;
//! estos comandos permiten cálculos grandes sin el límite de memoria del navegador.

use curvatura_core::alcubierre::{self, Params};
use curvatura_core::geodesic;
use serde::Serialize;

#[derive(Serialize)]
struct CoreInfo {
    version: &'static str,
    target: &'static str,
}

#[tauri::command]
fn core_info() -> CoreInfo {
    CoreInfo { version: env!("CARGO_PKG_VERSION"), target: std::env::consts::ARCH }
}

#[tauri::command]
fn total_energy(v: f64, r: f64, sigma: f64) -> f64 {
    alcubierre::total_energy(&Params { v, r, sigma })
}

#[derive(Serialize)]
struct Field {
    theta: Vec<f64>,
    rho: Vec<f64>,
}

#[tauri::command]
fn field_plane(v: f64, r: f64, sigma: f64, half: f64, n: usize) -> Result<Field, String> {
    if n == 0 || n > 4096 {
        return Err(format!("n fuera de rango (1..=4096): {n}"));
    }
    let (mut theta, mut rho) = (vec![0.0; n * n], vec![0.0; n * n]);
    alcubierre::field_plane(&Params { v, r, sigma }, half, n, &mut theta, &mut rho);
    Ok(Field { theta, rho })
}

#[derive(Serialize)]
struct Path {
    points: Vec<f64>,
    d_h: f64,
}

#[tauri::command]
fn trace_geodesic(v: f64, r: f64, sigma: f64, x0: f64, y0: f64, h: f64, steps: usize) -> Result<Path, String> {
    if steps == 0 || steps > 2_000_000 {
        return Err(format!("steps fuera de rango: {steps}"));
    }
    let p = Params { v, r, sigma };
    let s0 = geodesic::eulerian_start(x0, y0);
    let mut points = vec![0.0; 3 * steps];
    let end = geodesic::trace(s0, &p, h, steps, &mut points);
    Ok(Path { points, d_h: geodesic::hamiltonian(&end, &p) - geodesic::hamiltonian(&s0, &p) })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![core_info, total_energy, field_plane, trace_geodesic])
        .run(tauri::generate_context!())
        .expect("error al iniciar Curvatura");
}
