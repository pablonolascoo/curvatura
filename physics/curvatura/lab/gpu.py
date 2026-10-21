"""Fórmulas en la GPU de cualquier equipo: SymPy → shader WGSL → wgpu (Metal, DirectX 12, Vulkan).

No depende de CUDA: funciona en Mac (Apple Silicon), Windows (NVIDIA, AMD, Intel) y Linux.
Precisión simple (f32): ideal para barridos y mapas de millones de puntos. Para cifras finales,
`rapido.evaluar` (f64, numba en todos los núcleos) o `cotas` (rigurosas).
"""

from __future__ import annotations

import time
from functools import lru_cache

import numpy as np
import sympy as sp

from .expr import lados, leer

FUN = {"exp": "exp", "log": "log", "sin": "sin", "cos": "cos", "tan": "tan", "tanh": "tanh", "sinh": "sinh",
       "cosh": "cosh", "sqrt": "sqrt", "Abs": "abs", "atan": "atan", "asin": "asin", "acos": "acos"}
GRUPO = 256


def _num(x) -> str:
    v = float(x)
    return f"{v:.9g}" if ("e" in f"{v:.9g}" or "." in f"{v:.9g}") else f"{v:.9g}.0"


def wgsl(e: sp.Expr, nombres: dict) -> str:
    """Expresión SymPy → expresión WGSL (f32)."""
    if e.is_Symbol:
        return nombres[e]
    if e is sp.pi:
        return _num(np.pi)
    if e is sp.E:
        return _num(np.e)
    if e.is_Number:
        return _num(e)
    if e.is_Add:
        return "(" + " + ".join(wgsl(a, nombres) for a in e.args) + ")"
    if e.is_Mul:
        return "(" + " * ".join(wgsl(a, nombres) for a in e.args) + ")"
    if e.is_Pow:
        b, k = e.args
        if k.is_Integer and abs(int(k)) <= 8:
            base = wgsl(b, nombres)
            prod = "(" + " * ".join([base] * abs(int(k))) + ")"
            return prod if k > 0 else f"(1.0 / {prod})"
        if k == sp.Rational(1, 2):
            return f"sqrt({wgsl(b, nombres)})"
        if k == -sp.Rational(1, 2):
            return f"inverseSqrt({wgsl(b, nombres)})"
        return f"pow({wgsl(b, nombres)}, {wgsl(k, nombres)})"
    nombre = type(e).__name__
    if nombre == "sech":
        return f"(1.0 / cosh({wgsl(e.args[0], nombres)}))"
    if nombre in FUN:
        return f"{FUN[nombre]}({wgsl(e.args[0], nombres)})"
    raise ValueError(f"la GPU no admite {nombre}: usa rapido.evaluar")


def shader(e: sp.Expr, syms: list[sp.Symbol]) -> str:
    sustituciones, (red,) = sp.cse(e)
    nombres = {s: f"a{i}[i]" for i, s in enumerate(syms)}
    lineas = []
    for k, (s, sub) in enumerate(sustituciones):
        lineas.append(f"  let t{k}: f32 = {wgsl(sub, nombres)};")
        nombres[s] = f"t{k}"
    entradas = "\n".join(f"@group(0) @binding({i}) var<storage, read> a{i}: array<f32>;" for i in range(len(syms)))
    return f"""{entradas}
@group(0) @binding({len(syms)}) var<storage, read_write> salida: array<f32>;
struct N {{ n: u32, ancho: u32 }};
@group(0) @binding({len(syms) + 1}) var<uniform> tam: N;
@compute @workgroup_size({GRUPO})
fn main(@builtin(global_invocation_id) g: vec3<u32>) {{
  let i = g.y * tam.ancho + g.x;
  if (i >= tam.n) {{ return; }}
{chr(10).join(lineas)}
  salida[i] = {wgsl(red, nombres)};
}}
"""


@lru_cache(maxsize=1)
def dispositivo():
    import wgpu

    a = wgpu.gpu.request_adapter_sync(power_preference="high-performance")
    if a is None or a.info.get("adapter_type") == "CPU":
        return None
    limites = {"max-storage-buffer-binding-size": a.limits["max-storage-buffer-binding-size"],
               "max-buffer-size": a.limits["max-buffer-size"]}
    return a.request_device_sync(required_limits=limites), f"{a.info['device']} · {a.info['backend_type']}"


def disponible() -> str | None:
    try:
        d = dispositivo()
        return d[1] if d else None
    except Exception:
        return None


_kernels: dict = {}


def compilar(formula):
    import wgpu

    e = lados(leer(formula)) if isinstance(formula, str) else formula
    if isinstance(formula, str) and isinstance(leer(formula), sp.Equality):
        e = leer(formula).rhs
    syms = sorted(e.free_symbols, key=lambda s: s.name)
    clave = sp.srepr(e)
    if clave not in _kernels:
        dev, _ = dispositivo()
        modulo = dev.create_shader_module(code=shader(e, syms))
        _kernels[clave] = (dev.create_compute_pipeline(layout="auto", compute={"module": modulo, "entry_point": "main"}), syms)
    return _kernels[clave]


def evaluar(formula, valores: dict[str, np.ndarray | float], tiempo: bool = False):
    """Como rapido.evaluar, pero en la GPU y en f32. Con `tiempo=True` devuelve (resultado, ms de GPU)."""
    import wgpu

    dev, _ = dispositivo()
    pipe, syms = compilar(formula)
    args = np.broadcast_arrays(*[np.asarray(valores[s.name], dtype=np.float32) for s in syms])
    n = args[0].size
    U = wgpu.BufferUsage
    bufs = [dev.create_buffer_with_data(data=np.ascontiguousarray(a, dtype=np.float32).ravel(), usage=U.STORAGE) for a in args]
    salida = dev.create_buffer(size=4 * n, usage=U.STORAGE | U.COPY_SRC)
    grupos = -(-n // GRUPO)
    gx = min(grupos, 65535)
    gy = -(-grupos // gx)
    tam = dev.create_buffer_with_data(data=np.array([n, gx * GRUPO], dtype=np.uint32), usage=U.UNIFORM)
    entradas = [{"binding": i, "resource": {"buffer": b, "offset": 0, "size": b.size}} for i, b in enumerate(bufs)]
    entradas += [{"binding": len(bufs), "resource": {"buffer": salida, "offset": 0, "size": salida.size}},
                 {"binding": len(bufs) + 1, "resource": {"buffer": tam, "offset": 0, "size": tam.size}}]
    grupo = dev.create_bind_group(layout=pipe.get_bind_group_layout(0), entries=entradas)
    t0 = time.perf_counter()
    enc = dev.create_command_encoder()
    p = enc.begin_compute_pass()
    p.set_pipeline(pipe)
    p.set_bind_group(0, grupo)
    p.dispatch_workgroups(gx, gy, 1)
    p.end()
    dev.queue.submit([enc.finish()])
    r = np.frombuffer(dev.queue.read_buffer(salida), dtype=np.float32).reshape(args[0].shape)
    ms = (time.perf_counter() - t0) * 1000
    return (r, ms) if tiempo else r


def shader_barrido(e: sp.Expr, syms: list[sp.Symbol]) -> str:
    """Rejilla generada en la GPU (sin subir datos) y reducción por grupo: min, max, suma, nº negativos."""
    d = len(syms)
    sustituciones, (red,) = sp.cse(e)
    nombres = {s: f"v{i}" for i, s in enumerate(syms)}
    coords = []
    for i in range(d):
        c = "xyzw"[i % 4]
        coords.append(f"    let n{i} = rr.n[{i // 4}].{c}; let q{i} = resto % n{i}; resto = resto / n{i};")
        coords.append(f"    let v{i}: f32 = rr.ini[{i // 4}].{c} + rr.paso[{i // 4}].{c} * f32(q{i});")
    lineas = []
    for k, (s, sub) in enumerate(sustituciones):
        lineas.append(f"    let t{k}: f32 = {wgsl(sub, nombres)};")
        nombres[s] = f"t{k}"
    return f"""struct R {{ ini: array<vec4<f32>, 2>, paso: array<vec4<f32>, 2>, n: array<vec4<u32>, 2>, total: u32, ancho: u32 }};
@group(0) @binding(0) var<uniform> rr: R;
@group(0) @binding(1) var<storage, read_write> parcial: array<vec4<f32>>;
var<workgroup> mn: array<f32, {GRUPO}>;
var<workgroup> mx: array<f32, {GRUPO}>;
var<workgroup> sm: array<f32, {GRUPO}>;
var<workgroup> ng: array<f32, {GRUPO}>;
@compute @workgroup_size({GRUPO})
fn main(@builtin(global_invocation_id) g: vec3<u32>, @builtin(local_invocation_index) l: u32, @builtin(workgroup_id) w: vec3<u32>) {{
  let idx = g.y * rr.ancho + g.x;
  var y: f32 = 0.0;
  var valido = idx < rr.total;
  if (valido) {{
    var resto = idx;
{chr(10).join(coords)}
{chr(10).join(lineas)}
    y = {wgsl(red, nombres)};
    valido = (y == y) && abs(y) < 3.0e38;
  }}
  mn[l] = select(3.0e38, y, valido);
  mx[l] = select(-3.0e38, y, valido);
  sm[l] = select(0.0, y, valido);
  ng[l] = select(0.0, 1.0, valido && y < 0.0);
  workgroupBarrier();
  for (var s = {GRUPO // 2}u; s > 0u; s = s >> 1u) {{
    if (l < s) {{ mn[l] = min(mn[l], mn[l + s]); mx[l] = max(mx[l], mx[l + s]); sm[l] = sm[l] + sm[l + s]; ng[l] = ng[l] + ng[l + s]; }}
    workgroupBarrier();
  }}
  if (l == 0u) {{ parcial[w.y * (rr.ancho / {GRUPO}u) + w.x] = vec4<f32>(mn[0], mx[0], sm[0], ng[0]); }}
}}
"""


def _trozo(dev, pipe, ini, paso, n) -> tuple[np.ndarray, int]:
    import wgpu

    total = int(np.prod(n.astype(np.float64)))
    grupos = -(-total // GRUPO)
    gx = min(grupos, 65535)
    gy = -(-grupos // gx)
    U = wgpu.BufferUsage
    uni = np.zeros(28, np.uint32)
    uni[0:8] = ini.view(np.uint32)
    uni[8:16] = paso.view(np.uint32)
    uni[16:24] = n
    uni[24], uni[25] = total, gx * GRUPO
    ubuf = dev.create_buffer_with_data(data=uni, usage=U.UNIFORM)
    parcial = dev.create_buffer(size=16 * gx * gy, usage=U.STORAGE | U.COPY_SRC)
    grupo = dev.create_bind_group(layout=pipe.get_bind_group_layout(0), entries=[
        {"binding": 0, "resource": {"buffer": ubuf, "offset": 0, "size": ubuf.size}},
        {"binding": 1, "resource": {"buffer": parcial, "offset": 0, "size": parcial.size}}])
    enc = dev.create_command_encoder()
    p = enc.begin_compute_pass()
    p.set_pipeline(pipe)
    p.set_bind_group(0, grupo)
    p.dispatch_workgroups(gx, gy, 1)
    p.end()
    dev.queue.submit([enc.finish()])
    return np.frombuffer(dev.queue.read_buffer(parcial), dtype=np.float32).reshape(-1, 4).astype(np.float64), total


def barrido(formula, rangos: dict[str, tuple[float, float, int]]) -> dict:
    """Recorre una rejilla de hasta 8 dimensiones (miles de millones de puntos) sin subir datos a la GPU.
    rangos: símbolo → (inicio, fin, n). Devuelve mínimo, máximo, media, fracción negativa, puntos y tiempo.
    Si la rejilla es enorme se parte en trozos a lo largo de la última variable."""
    e = lados(leer(formula)) if isinstance(formula, str) else formula
    if isinstance(formula, str) and isinstance(leer(formula), sp.Equality):
        e = leer(formula).rhs
    syms = sorted(e.free_symbols, key=lambda s: s.name)
    if not 1 <= len(syms) <= 8:
        raise ValueError("entre 1 y 8 variables")
    dev, nombre = dispositivo()
    ini = np.zeros(8, np.float32)
    paso = np.zeros(8, np.float32)
    n = np.ones(8, np.uint32)
    for i, s in enumerate(syms):
        a, b, k = rangos[s.name]
        ini[i], n[i] = a, int(k)
        paso[i] = (b - a) / (int(k) - 1) if int(k) > 1 else 0.0
    clave = ("barrido", sp.srepr(e))
    if clave not in _kernels:
        _kernels[clave] = dev.create_compute_pipeline(layout="auto", compute={
            "module": dev.create_shader_module(code=shader_barrido(e, syms)), "entry_point": "main"})
    pipe = _kernels[clave]
    ultimo = len(syms) - 1
    resto = int(np.prod(n[:ultimo].astype(np.float64)))
    por_trozo = max(1, min(int(n[ultimo]), (2**31 - 1) // max(1, resto)))
    if resto >= 2**31:
        raise ValueError("demasiados puntos en las primeras variables: reduce su resolución")
    t0 = time.perf_counter()
    partes, total = [], 0
    for j0 in range(0, int(n[ultimo]), por_trozo):
        ini_t, n_t = ini.copy(), n.copy()
        ini_t[ultimo] = ini[ultimo] + paso[ultimo] * j0
        n_t[ultimo] = min(por_trozo, int(n[ultimo]) - j0)
        v, t = _trozo(dev, pipe, ini_t, paso, n_t)
        partes.append(v)
        total += t
    v = np.concatenate(partes)
    ms = (time.perf_counter() - t0) * 1000
    v = v[v[:, 0] < 3e38] if (v[:, 0] < 3e38).any() else v
    return {"motor": f"GPU {nombre}", "puntos": total, "ms": round(ms, 2), "Gpuntos_s": round(total / ms / 1e6, 2),
            "min": float(v[:, 0].min()), "max": float(v[:, 1].max()), "media": float(v[:, 2].sum() / total),
            "fraccion_negativa": float(v[:, 3].sum() / total)}
