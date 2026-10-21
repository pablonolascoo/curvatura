"use client";

/**
 * Cargador del núcleo Rust compilado a WebAssembly (solvers/rust → public/wasm/curvatura_core.wasm).
 * Sin wasm-bindgen: funciones extern "C" con f64 y búferes en memoria lineal.
 */
type Exports = {
  memory: WebAssembly.Memory;
  alloc_f64: (n: number) => number;
  free_f64: (ptr: number, n: number) => void;
  total_energy: (v: number, r: number, sigma: number) => number;
  total_energy_thin_wall: (v: number, r: number, sigma: number) => number;
  field_plane: (v: number, r: number, sigma: number, half: number, n: number, theta: number, rho: number) => void;
  trace_geodesic: (v: number, r: number, sigma: number, x0: number, y0: number, h: number, steps: number, out: number) => number;
};

let loading: Promise<Core> | null = null;

export class Core {
  constructor(private x: Exports) {}

  totalEnergy(v: number, R: number, sigma: number) {
    return this.x.total_energy(v, R, sigma);
  }

  /** θ y ρ_E en el plano z = 0, n × n. */
  field(v: number, R: number, sigma: number, half: number, n: number) {
    const pt = this.x.alloc_f64(n * n), pr = this.x.alloc_f64(n * n);
    try {
      this.x.field_plane(v, R, sigma, half, n, pt, pr);
      const mem = this.x.memory.buffer;
      return { theta: new Float64Array(mem, pt, n * n).slice(), rho: new Float64Array(mem, pr, n * n).slice() };
    } finally {
      this.x.free_f64(pt, n * n);
      this.x.free_f64(pr, n * n);
    }
  }

  /** Geodésica desde (x0, y0) en reposo euleriano. Devuelve (t, x, y) por paso y el error en H. */
  geodesic(v: number, R: number, sigma: number, x0: number, y0: number, h: number, steps: number) {
    const p = this.x.alloc_f64(3 * steps);
    try {
      const dH = this.x.trace_geodesic(v, R, sigma, x0, y0, h, steps, p);
      return { path: new Float64Array(this.x.memory.buffer, p, 3 * steps).slice(), dH };
    } finally {
      this.x.free_f64(p, 3 * steps);
    }
  }
}

export function loadCore(): Promise<Core> {
  if (!loading) {
    loading = (async () => {
      const res = await fetch("/wasm/curvatura_core.wasm");
      if (!res.ok) throw new Error(`No se pudo cargar el núcleo WebAssembly (HTTP ${res.status})`);
      const { instance } = await WebAssembly.instantiate(await res.arrayBuffer(), {});
      return new Core(instance.exports as unknown as Exports);
    })().catch((err) => {
      loading = null; // permite reintentar
      throw err;
    });
  }
  return loading;
}

type Invoke = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
const tauriInvoke = (): Invoke | undefined =>
  typeof window === "undefined" ? undefined : (window as unknown as { __TAURI__?: { core?: { invoke: Invoke } } }).__TAURI__?.core?.invoke;

export type Hardware = { hilos: number; gpu: string | null; so: string; arquitectura: string };

/** En la app de escritorio: qué hay en el equipo (núcleos y GPU). En la web, null. */
export async function nativeHardware(): Promise<Hardware | null> {
  const invoke = tauriInvoke();
  return invoke ? ((await invoke("hardware")) as Hardware) : null;
}

/**
 * En la app de escritorio, θ y ρ_E calculados por el núcleo nativo: GPU (Metal, DirectX 12, Vulkan)
 * para mapas grandes y todos los núcleos de la CPU para los pequeños. Llega en binario, sin JSON.
 * En la web devuelve null y se usa WebAssembly.
 */
export async function nativeField(v: number, R: number, sigma: number, half: number, n: number) {
  const invoke = tauriInvoke();
  if (!invoke) return null;
  const raw = (await invoke("field_plane_bin", { v, r: R, sigma, half, n })) as ArrayBuffer | number[];
  const buf = raw instanceof ArrayBuffer ? raw : new Uint8Array(raw).buffer;
  const motor = new DataView(buf).getUint32(0, true) === 1 ? "gpu" : "cpu";
  const datos = new Float32Array(buf, 4, 2 * n * n);
  return { theta: datos.subarray(0, n * n), rho: datos.subarray(n * n), motor } as const;
}
