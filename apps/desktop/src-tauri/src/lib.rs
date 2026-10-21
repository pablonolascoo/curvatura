//! Aplicación de escritorio de Curvatura.
//!
//! Sirve la web estática (apps/web/out) dentro de una ventana nativa y expone el núcleo
//! numérico en Rust nativo como comandos. El WebAssembly de la web sigue funcionando igual;
//! estos comandos permiten cálculos grandes sin el límite de memoria del navegador.

use curvatura_core::alcubierre::{self, Params};
use std::path::PathBuf;
use tauri::Manager;
use tauri_plugin_shell::ShellExt;
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
    alcubierre::field_plane_par(&Params { v, r, sigma }, half, n, &mut theta, &mut rho); // todos los núcleos
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

/// Actualizaciones automáticas: comprueba al arrancar y cada 6 h contra latest.json de GitHub
/// Releases. El paquete va firmado (minisign) y solo se instala si la firma coincide con la clave
/// pública de tauri.conf.json. Si las notas de la versión contienen «[obligatoria]», no se puede
/// posponer.
async fn buscar_actualizacion(app: tauri::AppHandle) -> Result<(), String> {
    use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};
    use tauri_plugin_updater::UpdaterExt;

    let Some(update) = app.updater().map_err(|e| e.to_string())?.check().await.map_err(|e| e.to_string())? else {
        return Ok(());
    };
    let notas = update.body.clone().unwrap_or_default();
    let obligatoria = notas.contains("[obligatoria]");
    let texto = format!(
        "Curvatura {} está disponible. Tienes la {}.\n\n{}",
        update.version,
        update.current_version,
        notas.replace("[obligatoria]", "").trim()
    );
    let botones = if obligatoria {
        MessageDialogButtons::OkCustom("Actualizar y reiniciar".into())
    } else {
        MessageDialogButtons::OkCancelCustom("Actualizar y reiniciar".into(), "Más tarde".into())
    };
    let acepta = app
        .dialog()
        .message(texto)
        .title("Actualización de Curvatura")
        .kind(MessageDialogKind::Info)
        .buttons(botones)
        .blocking_show();
    if !acepta && !obligatoria {
        return Ok(());
    }
    update.download_and_install(|_, _| {}, || {}).await.map_err(|e| e.to_string())?;
    app.restart();
}

// ── Python nativo ───────────────────────────────────────────────────────────
// La app lleva `uv` dentro (sidecar). La primera vez instala en la carpeta de datos de la app un
// Python 3.12 propio con numpy, sympy y scipy; el paquete `curvatura` va como recurso. No toca el
// Python del sistema ni necesita permisos de administrador.

const PAQUETES: &[&str] = &["numpy", "sympy", "scipy", "matplotlib"];

fn datos(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path().app_data_dir().map(|d| d.join("python")).map_err(|e| e.to_string())
}

fn python_bin(base: &std::path::Path) -> PathBuf {
    if cfg!(windows) { base.join("venv").join("Scripts").join("python.exe") } else { base.join("venv").join("bin").join("python") }
}

#[derive(Serialize)]
struct PythonInfo {
    instalado: bool,
    ruta: String,
}

#[tauri::command]
fn python_info(app: tauri::AppHandle) -> Result<PythonInfo, String> {
    let base = datos(&app)?;
    let bin = python_bin(&base);
    Ok(PythonInfo { instalado: bin.exists() && base.join(".listo").exists(), ruta: bin.display().to_string() })
}

async fn uv(app: &tauri::AppHandle, base: &std::path::Path, args: &[&str]) -> Result<String, String> {
    let out = app
        .shell()
        .sidecar("uv")
        .map_err(|e| e.to_string())?
        .args(args)
        .env("UV_PYTHON_INSTALL_DIR", base.join("interpretes"))
        .env("UV_CACHE_DIR", base.join("cache"))
        .output()
        .await
        .map_err(|e| e.to_string())?;
    let texto = format!("{}{}", String::from_utf8_lossy(&out.stdout), String::from_utf8_lossy(&out.stderr));
    if out.status.success() { Ok(texto) } else { Err(texto) }
}

#[tauri::command]
async fn python_setup(app: tauri::AppHandle) -> Result<String, String> {
    let base = datos(&app)?;
    std::fs::create_dir_all(&base).map_err(|e| e.to_string())?;
    let venv = base.join("venv");
    let venv_s = venv.display().to_string();
    let mut log = uv(&app, &base, &["venv", "--python", "3.12", "--seed", &venv_s]).await?;
    let py = python_bin(&base).display().to_string();
    let mut args = vec!["pip", "install", "--python", py.as_str()];
    args.extend_from_slice(PAQUETES);
    log += &uv(&app, &base, &args).await?;
    std::fs::write(base.join(".listo"), env!("CARGO_PKG_VERSION")).map_err(|e| e.to_string())?;
    Ok(log)
}

#[derive(Serialize)]
struct Ejecucion {
    salida: String,
    ok: bool,
    segundos: f64,
}

#[tauri::command]
async fn python_run(app: tauri::AppHandle, codigo: String, limite_s: Option<u64>) -> Result<Ejecucion, String> {
    let base = datos(&app)?;
    let py = python_bin(&base);
    if !py.exists() {
        return Err("Python nativo no está instalado todavía.".into());
    }
    let recursos = app.path().resource_dir().map_err(|e| e.to_string())?.join("python");
    let script = base.join("ultimo.py");
    std::fs::write(&script, codigo).map_err(|e| e.to_string())?;
    let t0 = std::time::Instant::now();
    let mut cmd = tokio::process::Command::new(&py);
    cmd.arg(&script).env("PYTHONPATH", &recursos).env("MPLBACKEND", "Agg").current_dir(&base).kill_on_drop(true);
    let limite = std::time::Duration::from_secs(limite_s.unwrap_or(600));
    let out = tokio::time::timeout(limite, cmd.output())
        .await
        .map_err(|_| format!("Se superó el límite de {} s", limite.as_secs()))?
        .map_err(|e| e.to_string())?;
    Ok(Ejecucion {
        salida: format!("{}{}", String::from_utf8_lossy(&out.stdout), String::from_utf8_lossy(&out.stderr)),
        ok: out.status.success(),
        segundos: t0.elapsed().as_secs_f64(),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if !cfg!(debug_assertions) {
                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    loop {
                        if let Err(e) = buscar_actualizacion(handle.clone()).await {
                            eprintln!("[actualizaciones] {e}"); // sin red o sin versión publicada: se reintenta luego
                        }
                        tokio::time::sleep(std::time::Duration::from_secs(6 * 3600)).await;
                    }
                });
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![core_info, total_energy, field_plane, trace_geodesic, python_info, python_setup, python_run])
        .run(tauri::generate_context!())
        .expect("error al iniciar Curvatura");
}
