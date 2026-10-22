//! Investigador IA en la app nativa: CLIs de agente (Claude Code, Codex, Cursor) y modelo local (Ollama).
//!
//! Prioridad: CLI instalado y con sesión → modelo local → clave API (esta última va desde la página).
//! Cada CLI trabaja en una carpeta propia (`<datos>/investigacion`) donde la app deja la biblioteca en
//! texto (JSONL, una línea por paper o fragmento) sacada de sus propios recursos, y las instrucciones
//! del laboratorio en CLAUDE.md / AGENTS.md. Así el agente busca con sus propias herramientas (grep,
//! lectura, Python) sin depender de nuestra red. La salida `stream-json` de cada CLI llega a la página
//! línea a línea por un canal, sin esperar al final.

use serde::Serialize;
use serde_json::Value;
use std::path::{Path, PathBuf};
use std::sync::{Mutex, OnceLock};
use tauri::{ipc::Channel, Manager};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};

const OLLAMA: &str = "http://127.0.0.1:11434";

// ---------------------------------------------------------------- PATH y programas

/// El PATH de una app abierta desde el Finder o el menú no incluye Homebrew, ~/.local/bin, bun ni npm:
/// se toma el del shell de inicio de sesión y se añaden las carpetas habituales.
fn ruta_ampliada() -> &'static str {
    static RUTA: OnceLock<String> = OnceLock::new();
    RUTA.get_or_init(|| {
        let sep = if cfg!(windows) { ";" } else { ":" };
        let mut partes: Vec<String> = std::env::var("PATH").unwrap_or_default().split(sep).map(String::from).collect();
        #[cfg(unix)]
        {
            let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".into());
            if let Ok(o) = std::process::Command::new(shell).args(["-lc", "printf %s \"$PATH\""]).output() {
                partes.extend(String::from_utf8_lossy(&o.stdout).split(':').map(String::from));
            }
        }
        let casa = std::env::var(if cfg!(windows) { "USERPROFILE" } else { "HOME" }).unwrap_or_default();
        let extra: Vec<String> = if cfg!(windows) {
            let appdata = std::env::var("APPDATA").unwrap_or_default();
            let local = std::env::var("LOCALAPPDATA").unwrap_or_default();
            vec![format!("{appdata}\\npm"), format!("{local}\\Programs\\Ollama"), format!("{local}\\cursor-agent"), format!("{casa}\\.local\\bin"), format!("{casa}\\.bun\\bin")]
        } else {
            ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin"].iter().map(|s| s.to_string())
                .chain([".local/bin", ".bun/bin", ".npm-global/bin", ".cargo/bin", ".volta/bin"].iter().map(|s| format!("{casa}/{s}")))
                .collect()
        };
        partes.extend(extra);
        let mut vistos = std::collections::HashSet::new();
        partes.retain(|p| !p.is_empty() && vistos.insert(p.clone()));
        partes.join(sep)
    })
}

fn buscar(nombre: &str) -> Option<PathBuf> {
    let sep = if cfg!(windows) { ';' } else { ':' };
    let exts: &[&str] = if cfg!(windows) { &[".exe", ".cmd", ".bat", ""] } else { &[""] };
    for dir in ruta_ampliada().split(sep) {
        for e in exts {
            let p = Path::new(dir).join(format!("{nombre}{e}"));
            if p.is_file() {
                return Some(p);
            }
        }
    }
    None
}

/// Prepara un comando; en Windows los atajos de npm (.cmd) pasan por cmd y sin ventana de consola.
fn comando(programa: &Path) -> tokio::process::Command {
    let es_cmd = programa.extension().map(|e| e == "cmd" || e == "bat").unwrap_or(false);
    let mut c = if es_cmd {
        let mut c = tokio::process::Command::new("cmd");
        c.arg("/C").arg(programa);
        c
    } else {
        tokio::process::Command::new(programa)
    };
    c.env("PATH", ruta_ampliada());
    #[cfg(windows)]
    c.creation_flags(0x08000000);
    c
}

async fn version(programa: &Path) -> Option<String> {
    let mut c = comando(programa);
    c.arg("--version").stdin(std::process::Stdio::null()).kill_on_drop(true);
    let o = tokio::time::timeout(std::time::Duration::from_secs(8), c.output()).await.ok()?.ok()?;
    let t = String::from_utf8_lossy(&o.stdout).lines().next().unwrap_or("").trim().to_string();
    Some(if t.is_empty() { "?".into() } else { t })
}

/// Binario de cada CLI. Cursor se instala como `cursor-agent` (y en versiones nuevas también `agent`).
fn binario(cli: &str) -> Option<PathBuf> {
    match cli {
        "claude" => buscar("claude"),
        "codex" => buscar("codex"),
        "cursor" => buscar("cursor-agent").or_else(|| buscar("agent")),
        "ollama" => buscar("ollama"),
        _ => None,
    }
}

// ---------------------------------------------------------------- detección

#[derive(Serialize)]
pub struct Cli {
    id: &'static str,
    ruta: String,
    version: String,
}

#[derive(Serialize)]
pub struct Deteccion {
    clis: Vec<Cli>,
    ollama_instalado: bool,
    ollama_activo: bool,
    ollama_modelos: Vec<String>,
    memoria_gb: u64,
    sistema: &'static str,
}

fn memoria_gb() -> u64 {
    #[cfg(target_os = "macos")]
    {
        if let Ok(o) = std::process::Command::new("sysctl").args(["-n", "hw.memsize"]).output() {
            if let Ok(b) = String::from_utf8_lossy(&o.stdout).trim().parse::<u64>() {
                return (b as f64 / 1_073_741_824.0).round() as u64;
            }
        }
    }
    #[cfg(target_os = "linux")]
    {
        if let Ok(t) = std::fs::read_to_string("/proc/meminfo") {
            if let Some(kb) = t.lines().find(|l| l.starts_with("MemTotal")).and_then(|l| l.split_whitespace().nth(1)).and_then(|n| n.parse::<u64>().ok()) {
                return (kb as f64 / 1_048_576.0).round() as u64;
            }
        }
    }
    #[cfg(windows)]
    {
        if let Ok(o) = std::process::Command::new("powershell").args(["-NoProfile", "-Command", "(Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory"]).output() {
            if let Ok(b) = String::from_utf8_lossy(&o.stdout).trim().parse::<u64>() {
                return (b as f64 / 1_073_741_824.0).round() as u64;
            }
        }
    }
    0
}

fn cliente(segundos: u64) -> reqwest::Client {
    reqwest::Client::builder().timeout(std::time::Duration::from_secs(segundos)).build().unwrap_or_default()
}

async fn ollama_modelos() -> Option<Vec<String>> {
    let v: Value = cliente(3).get(format!("{OLLAMA}/api/tags")).send().await.ok()?.json().await.ok()?;
    Some(v["models"].as_array()?.iter().filter_map(|m| m["name"].as_str().map(String::from)).collect())
}

#[tauri::command]
pub async fn agente_detectar() -> Result<Deteccion, String> {
    let mut clis = Vec::new();
    for id in ["claude", "codex", "cursor"] {
        if let Some(ruta) = binario(id) {
            if let Some(version) = version(&ruta).await {
                clis.push(Cli { id, ruta: ruta.display().to_string(), version });
            }
        }
    }
    let modelos = ollama_modelos().await;
    Ok(Deteccion {
        clis,
        ollama_instalado: binario("ollama").is_some(),
        ollama_activo: modelos.is_some(),
        ollama_modelos: modelos.unwrap_or_default(),
        memoria_gb: tokio::task::spawn_blocking(memoria_gb).await.unwrap_or(0),
        sistema: if cfg!(target_os = "macos") { "macos" } else if cfg!(windows) { "windows" } else { "linux" },
    })
}

// ---------------------------------------------------------------- carpeta de trabajo

fn carpeta(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let d = app.path().app_data_dir().map_err(|e| e.to_string())?.join("investigacion");
    std::fs::create_dir_all(d.join("biblioteca")).map_err(|e| e.to_string())?;
    Ok(d)
}

fn recurso(app: &tauri::AppHandle, ruta: &str) -> Option<Vec<u8>> {
    let r = app.asset_resolver();
    r.get(ruta.to_string()).or_else(|| r.get(format!("/{ruta}"))).map(|a| a.bytes)
}

/// Convierte un JSON (lista u objeto) en JSONL: una línea por elemento, cómodo para grep.
fn a_jsonl(bytes: &[u8], destino: &Path) -> Result<usize, String> {
    let v: Value = serde_json::from_slice(bytes).map_err(|e| e.to_string())?;
    let filas: Vec<&Value> = match &v {
        Value::Array(a) => a.iter().collect(),
        Value::Object(o) => o.values().collect(),
        _ => vec![],
    };
    let mut s = String::new();
    for f in &filas {
        s.push_str(&serde_json::to_string(f).map_err(|e| e.to_string())?);
        s.push('\n');
    }
    std::fs::write(destino, s).map_err(|e| e.to_string())?;
    Ok(filas.len())
}

/// Deja la biblioteca en texto (una vez por versión de la app) y las instrucciones de esta sesión.
#[tauri::command]
pub async fn agente_espacio(app: tauri::AppHandle, instrucciones: String) -> Result<String, String> {
    let dir = carpeta(&app)?;
    let marca = dir.join("biblioteca").join(".version");
    let version = app.package_info().version.to_string();
    if std::fs::read_to_string(&marca).ok().as_deref() != Some(version.as_str()) {
        let app2 = app.clone();
        let dir2 = dir.clone();
        tokio::task::spawn_blocking(move || -> Result<(), String> {
            let b = dir2.join("biblioteca");
            if let Some(x) = recurso(&app2, "library/index.json") {
                a_jsonl(&x, &b.join("indice.jsonl"))?;
            }
            if let Some(x) = recurso(&app2, "search/chunks.json") {
                a_jsonl(&x, &b.join("fragmentos.jsonl"))?;
            }
            // Fichas completas (resúmenes en es/en/fr, DOI, arXiv…), repartidas por inicial.
            let mut fichas = String::new();
            for c in "abcdefghijklmnopqrstuvwxyz0123456789_".chars() {
                if let Some(x) = recurso(&app2, &format!("library/p/{c}.json")) {
                    if let Ok(Value::Object(o)) = serde_json::from_slice::<Value>(&x) {
                        for f in o.values() {
                            fichas.push_str(&f.to_string());
                            fichas.push('\n');
                        }
                    }
                }
            }
            std::fs::write(b.join("fichas.jsonl"), fichas).map_err(|e| e.to_string())?;
            if let Some(x) = recurso(&app2, "library/patentes.json") {
                a_jsonl(&x, &b.join("patentes.jsonl"))?;
            }
            Ok(())
        })
        .await
        .map_err(|e| e.to_string())??;
        std::fs::write(&marca, &version).map_err(|e| e.to_string())?;
    }
    // Claude Code lee CLAUDE.md; Codex y Cursor, AGENTS.md.
    for f in ["CLAUDE.md", "AGENTS.md"] {
        std::fs::write(dir.join(f), &instrucciones).map_err(|e| e.to_string())?;
    }
    Ok(dir.display().to_string())
}

// ---------------------------------------------------------------- ejecutar un CLI

static PARAR: Mutex<Option<tokio::sync::oneshot::Sender<()>>> = Mutex::new(None);

fn argumentos(cli: &str, sesion: Option<&str>, modelo: Option<&str>, dir: &Path) -> Vec<String> {
    let mut a: Vec<String> = Vec::new();
    let s = |x: &str| x.to_string();
    match cli {
        "claude" => {
            a.extend(["-p", "--output-format", "stream-json", "--verbose", "--include-partial-messages", "--permission-mode", "dontAsk"].map(s));
            // Solo leer, buscar, consultar la web y calcular con Python: nada de editar ni borrar.
            a.push(s("--allowedTools"));
            a.push(s("Read Grep Glob WebSearch WebFetch Bash(python3:*) Bash(python:*) Bash(grep:*) Bash(rg:*) Bash(wc:*) Bash(head:*) Bash(jq:*)"));
            if let Some(id) = sesion { a.extend([s("--resume"), s(id)]); }
            if let Some(m) = modelo { a.extend([s("--model"), s(m)]); }
        }
        "codex" => {
            a.extend(["exec", "--json", "--skip-git-repo-check", "--sandbox", "read-only", "-C"].map(s));
            a.push(dir.display().to_string());
            if let Some(m) = modelo { a.extend([s("-m"), s(m)]); }
            if let Some(id) = sesion { a.extend([s("resume"), s(id)]); }
            a.push(s("-")); // el mensaje llega por la entrada estándar
        }
        _ => {
            a.extend(["-p", "--output-format", "stream-json", "--stream-partial-output", "--trust", "--sandbox", "enabled", "--force"].map(s));
            if let Some(id) = sesion { a.extend([s("--resume"), s(id)]); }
            if let Some(m) = modelo { a.extend([s("--model"), s(m)]); }
        }
    }
    a
}

/// Lanza el CLI con el mensaje y manda cada línea de su salida por el canal:
/// `{"o":"out","l":…}`, `{"o":"err","l":…}` y al final `{"o":"fin","codigo":…}`.
#[tauri::command]
pub async fn agente_cli(app: tauri::AppHandle, cli: String, mensaje: String, sesion: Option<String>, modelo: Option<String>, canal: Channel<Value>) -> Result<(), String> {
    let programa = binario(&cli).ok_or_else(|| format!("No encuentro el CLI «{cli}» en este ordenador."))?;
    let dir = carpeta(&app)?;
    let mut c = comando(&programa);
    c.args(argumentos(&cli, sesion.as_deref().filter(|x| !x.is_empty()), modelo.as_deref().filter(|x| !x.is_empty()), &dir))
        .current_dir(&dir)
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .kill_on_drop(true);
    if cli == "cursor" {
        // Cursor va con su sesión (`cursor-agent login`); una CURSOR_API_KEY vieja en el entorno la estropea.
        c.env_remove("CURSOR_API_KEY");
    }
    let mut hijo = c.spawn().map_err(|e| format!("No se pudo abrir {}: {e}", programa.display()))?;
    if let Some(mut entrada) = hijo.stdin.take() {
        entrada.write_all(mensaje.as_bytes()).await.map_err(|e| e.to_string())?;
        drop(entrada);
    }
    let (tx, mut rx) = tokio::sync::oneshot::channel();
    if let Ok(mut p) = PARAR.lock() {
        *p = Some(tx);
    }
    let mut out = BufReader::new(hijo.stdout.take().ok_or("sin salida")?).lines();
    let mut err = BufReader::new(hijo.stderr.take().ok_or("sin salida de errores")?).lines();
    let (mut fin_out, mut fin_err) = (false, false);
    while !(fin_out && fin_err) {
        tokio::select! {
            _ = &mut rx => {
                let _ = hijo.kill().await;
                let _ = canal.send(serde_json::json!({"o": "fin", "codigo": -1, "parado": true}));
                return Ok(());
            }
            l = out.next_line(), if !fin_out => match l {
                Ok(Some(l)) => { let _ = canal.send(serde_json::json!({"o": "out", "l": l})); }
                _ => fin_out = true,
            },
            l = err.next_line(), if !fin_err => match l {
                Ok(Some(l)) => { let _ = canal.send(serde_json::json!({"o": "err", "l": l})); }
                _ => fin_err = true,
            },
        }
    }
    let codigo = hijo.wait().await.map(|s| s.code().unwrap_or(-1)).unwrap_or(-1);
    let _ = canal.send(serde_json::json!({"o": "fin", "codigo": codigo}));
    Ok(())
}

#[tauri::command]
pub fn agente_parar() {
    if let Ok(mut p) = PARAR.lock() {
        if let Some(tx) = p.take() {
            let _ = tx.send(());
        }
    }
}

/// Abre una terminal del sistema con el comando de inicio de sesión del CLI (la sesión es del usuario).
#[tauri::command]
pub fn agente_login(cli: String) -> Result<(), String> {
    let orden = match cli.as_str() {
        "claude" => "claude auth login",
        "codex" => "codex login",
        "cursor" => "cursor-agent login",
        _ => return Err("CLI desconocido".into()),
    };
    #[cfg(target_os = "macos")]
    {
        let guion = format!("tell application \"Terminal\" to do script \"{orden}\"\ntell application \"Terminal\" to activate");
        std::process::Command::new("osascript").args(["-e", &guion]).spawn().map_err(|e| e.to_string())?;
    }
    #[cfg(windows)]
    {
        std::process::Command::new("cmd").args(["/C", "start", "cmd", "/K", orden]).spawn().map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        let t = ["x-terminal-emulator", "gnome-terminal", "konsole", "xterm"].iter().find(|t| buscar(t).is_some()).ok_or("No encuentro una terminal")?;
        std::process::Command::new(t).args(["-e", &format!("sh -c '{orden}; exec sh'")]).spawn().map_err(|e| e.to_string())?;
    }
    Ok(())
}

// ---------------------------------------------------------------- Ollama (modelo local)

static MOTOR: Mutex<Option<std::process::Child>> = Mutex::new(None);

/// Arranca Ollama si está instalado y no responde. Se para al cerrar la app (para liberar la memoria).
#[tauri::command]
pub async fn ollama_arrancar() -> Result<bool, String> {
    if ollama_modelos().await.is_some() {
        return Ok(true);
    }
    let p = binario("ollama").ok_or("Ollama no está instalado.")?;
    let mut c = std::process::Command::new(p);
    c.arg("serve").env("PATH", ruta_ampliada()).stdout(std::process::Stdio::null()).stderr(std::process::Stdio::null());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        c.creation_flags(0x08000000);
    }
    let hijo = c.spawn().map_err(|e| e.to_string())?;
    if let Ok(mut m) = MOTOR.lock() {
        *m = Some(hijo);
    }
    for _ in 0..40 {
        tokio::time::sleep(std::time::Duration::from_millis(250)).await;
        if ollama_modelos().await.is_some() {
            return Ok(true);
        }
    }
    Err("Ollama no ha arrancado en 10 s.".into())
}

pub fn ollama_parar() {
    if let Ok(mut m) = MOTOR.lock() {
        if let Some(mut h) = m.take() {
            let _ = h.kill();
        }
    }
}

/// Petición a un servidor local (Ollama, LM Studio) con la respuesta en trozos por el canal.
/// Solo 127.0.0.1/localhost: no sirve de puente a internet. Evita el CORS de la vista web.
#[tauri::command]
pub async fn local_http(url: String, metodo: String, cuerpo: Option<String>, canal: Channel<Value>) -> Result<u16, String> {
    let u = reqwest::Url::parse(&url).map_err(|e| e.to_string())?;
    if u.scheme() != "http" || !matches!(u.host_str(), Some("127.0.0.1") | Some("localhost")) {
        return Err("Solo se permiten servidores locales.".into());
    }
    let c = reqwest::Client::new();
    let mut req = if metodo == "POST" { c.post(u) } else { c.get(u) };
    if let Some(b) = cuerpo {
        req = req.header("content-type", "application/json").body(b);
    }
    let mut r = req.send().await.map_err(|e| e.to_string())?;
    let estado = r.status().as_u16();
    // Un carácter UTF-8 puede quedar partido entre dos trozos: se guarda el resto para el siguiente.
    let mut resto: Vec<u8> = Vec::new();
    while let Some(trozo) = r.chunk().await.map_err(|e| e.to_string())? {
        resto.extend_from_slice(&trozo);
        let valido = match std::str::from_utf8(&resto) { Ok(_) => resto.len(), Err(e) => e.valid_up_to() };
        if valido > 0 {
            let _ = canal.send(Value::String(String::from_utf8_lossy(&resto[..valido]).into_owned()));
            resto.drain(..valido);
        }
    }
    if !resto.is_empty() {
        let _ = canal.send(Value::String(String::from_utf8_lossy(&resto).into_owned()));
    }
    Ok(estado)
}

#[cfg(test)]
mod pruebas {
    use super::*;

    #[test]
    fn claude_solo_lee_y_calcula() {
        let a = argumentos("claude", Some("s1"), Some("opus"), Path::new("/tmp/x"));
        assert!(a.windows(2).any(|w| w[0] == "--output-format" && w[1] == "stream-json"));
        assert!(a.windows(2).any(|w| w[0] == "--resume" && w[1] == "s1"));
        let permitidas = &a[a.iter().position(|x| x == "--allowedTools").unwrap() + 1];
        assert!(!permitidas.contains("Edit") && !permitidas.contains("Write"));
    }

    #[test]
    fn codex_retoma_con_opciones_antes_del_subcomando() {
        let a = argumentos("codex", Some("th"), None, Path::new("/tmp/x"));
        let r = a.iter().position(|x| x == "resume").unwrap();
        assert!(a.iter().position(|x| x == "--json").unwrap() < r);
        assert!(a.windows(2).any(|w| w[0] == "--sandbox" && w[1] == "read-only"));
        assert_eq!(a.last().unwrap(), "-");
    }

    #[test]
    fn jsonl_de_lista_y_de_objeto() {
        let d = std::env::temp_dir().join("curvatura-jsonl");
        std::fs::create_dir_all(&d).unwrap();
        assert_eq!(a_jsonl(br#"[{"a":1},{"a":2}]"#, &d.join("l.jsonl")).unwrap(), 2);
        assert_eq!(a_jsonl(br#"{"x":{"a":1}}"#, &d.join("o.jsonl")).unwrap(), 1);
        assert_eq!(std::fs::read_to_string(d.join("l.jsonl")).unwrap(), "{\"a\":1}\n{\"a\":2}\n");
    }

    #[test]
    fn encuentra_programas_en_el_path_ampliado() {
        // `ls` existe en cualquier Unix; en Windows, `cmd`.
        assert!(buscar(if cfg!(windows) { "cmd" } else { "ls" }).is_some());
    }
}
