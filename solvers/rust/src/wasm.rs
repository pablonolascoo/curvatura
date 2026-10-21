//! Interfaz WebAssembly: `extern "C"` con f64 y búferes en memoria lineal.
//! El cargador JS vive en `apps/web/src/lib/core.ts`.

use crate::alcubierre::{self, Params};
use crate::geodesic;

#[no_mangle]
pub extern "C" fn alloc_f64(n: usize) -> *mut f64 {
    let mut v = vec![0.0f64; n];
    let ptr = v.as_mut_ptr();
    std::mem::forget(v);
    ptr
}

/// # Safety
/// `ptr` y `n` deben venir de `alloc_f64`.
#[no_mangle]
pub unsafe extern "C" fn free_f64(ptr: *mut f64, n: usize) {
    drop(Vec::from_raw_parts(ptr, n, n));
}

#[no_mangle]
pub extern "C" fn total_energy(v: f64, r: f64, sigma: f64) -> f64 {
    alcubierre::total_energy(&Params { v, r, sigma })
}

#[no_mangle]
pub extern "C" fn total_energy_thin_wall(v: f64, r: f64, sigma: f64) -> f64 {
    alcubierre::total_energy_thin_wall(&Params { v, r, sigma })
}

/// # Safety
/// `theta` y `rho` deben apuntar a `n * n` f64 válidos.
#[no_mangle]
pub unsafe extern "C" fn field_plane(v: f64, r: f64, sigma: f64, half: f64, n: usize, theta: *mut f64, rho: *mut f64) {
    let t = std::slice::from_raw_parts_mut(theta, n * n);
    let p = std::slice::from_raw_parts_mut(rho, n * n);
    alcubierre::field_plane(&Params { v, r, sigma }, half, n, t, p);
}

/// Traza una geodésica desde (x0, y0) en reposo euleriano. Devuelve H final - H inicial.
/// # Safety
/// `out` debe apuntar a `3 * steps` f64 válidos.
#[no_mangle]
pub unsafe extern "C" fn trace_geodesic(v: f64, r: f64, sigma: f64, x0: f64, y0: f64, h: f64, steps: usize, out: *mut f64) -> f64 {
    let p = Params { v, r, sigma };
    let s0 = geodesic::eulerian_start(x0, y0);
    let buf = std::slice::from_raw_parts_mut(out, 3 * steps);
    let end = geodesic::trace(s0, &p, h, steps, buf);
    geodesic::hamiltonian(&end, &p) - geodesic::hamiltonian(&s0, &p)
}
