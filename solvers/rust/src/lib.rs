//! Curvatura · núcleo numérico.
//!
//! Unidades geométricas G = c = 1, signatura (-,+,+,+). Mismas convenciones que
//! `physics/curvatura/metrics/alcubierre.py` y `solvers/cpp`.
//!
//! El mismo código se compila a nativo (app de escritorio, tests) y a `wasm32-unknown-unknown`
//! (web). La interfaz WebAssembly está en [`wasm`]: funciones `extern "C"` con `f64` y
//! búferes en memoria lineal, sin dependencias.

pub mod alcubierre;
pub mod geodesic;
pub mod integrate;

#[cfg(target_arch = "wasm32")]
pub mod wasm;
