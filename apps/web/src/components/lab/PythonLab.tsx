"use client";

import { useRef, useState } from "react";
import { Play } from "@phosphor-icons/react";

type Labels = { python: string; pythonBody: string; run: string; running: string; loadPython: string; pythonSize: string; output: string; presets: string; loading: string };

const CDN = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
let PYODIDE = CDN;

const PRESETS: Record<string, string> = {
  "Einstein → ρ_E": `# Tensor de Einstein simbólico desde la métrica y comparación con la fórmula de Alcubierre
import sympy as sp
from curvatura.metrics import alcubierre as A
from curvatura.tensor import geometry, eulerian_energy_density

(t, x, y, z), g, alpha, beta, _ = A.symbolic(sp.Rational(1, 2), 1, 4)
geo = geometry(g, (t, x, y, z))
rho = sp.lambdify((t, x, y, z), eulerian_energy_density(geo, alpha, beta), "numpy")
for p in [(0.9, 0.3, 0.1), (-1.1, 0.2, -0.4)]:
    num = float(rho(0.0, *p)); ana = float(A.energy_density(*p, 0.5, 1.0, 4.0))
    print(f"{p}: Einstein {num:.10e}   cerrada {ana:.10e}   error {abs(num/ana-1):.1e}")`,
  "Energía total": `from curvatura.metrics import alcubierre as A
from curvatura.units import length_to_mass, M_JUPITER
print(f"{'R (m)':>8} {'σ (1/m)':>8} {'E (m)':>12} {'M (Júpiter)':>14}")
for R, s in [(1, 8), (10, 1), (100, 0.1), (100, 1), (1000, 0.01)]:
    E = A.total_energy(1.0, R, s)
    print(f"{R:>8} {s:>8} {E:>12.4e} {length_to_mass(E)/M_JUPITER:>14.4e}")`,
  "Condiciones de energía": `# Tensor energía-momento en la tétrada euleriana y barrido de observadores (como Warp Factory)
import numpy as np, sympy as sp
from curvatura.metrics import alcubierre as A
from curvatura.tensor import geometry, eulerian_tetrad_flat, stress_energy_frame
from curvatura.energy_conditions import nec_min, wec_min

(t, x, y, z), g, alpha, beta, _ = A.symbolic(sp.Rational(1, 2), 1, 4)
geo = geometry(g, (t, x, y, z))
T = sp.lambdify((t, x, y, z), stress_energy_frame(geo, eulerian_tetrad_flat(alpha, beta)), "numpy")
for p in [(0, 0, 0), (0.3, 0.9, 0), (1.0, 0.1, 0), (2.5, 0, 0)]:
    Tab = np.array(T(0.0, *p), dtype=float)
    print(f"{str(p):<16} ρ={Tab[0,0]:+.3e}  NEC mín={nec_min(Tab):+.3e}  WEC mín={wec_min(Tab):+.3e}")`,
};

type Py = { runPythonAsync: (code: string) => Promise<unknown>; setStdout: (o: { batched: (s: string) => void }) => void; setStderr: (o: { batched: (s: string) => void }) => void; FS: { mkdirTree: (p: string) => void; writeFile: (p: string, d: string) => void }; loadPackage: (p: string[]) => Promise<void> };
declare global { interface Window { loadPyodide?: (o: { indexURL: string }) => Promise<Py> } }

async function boot(onLog: (s: string) => void): Promise<Py> {
  // La app de escritorio lleva Pyodide dentro (public/pyodide); la web usa el CDN.
  const local = await fetch("/pyodide/pyodide-lock.json", { method: "HEAD" }).then((r) => r.ok, () => false);
  PYODIDE = local ? "/pyodide/" : CDN;
  if (!window.loadPyodide) {
    await new Promise<void>((ok, fail) => {
      const s = document.createElement("script");
      s.src = `${PYODIDE}pyodide.js`;
      s.onload = () => ok();
      s.onerror = () => fail(new Error("No se pudo descargar Pyodide"));
      document.head.appendChild(s);
    });
  }
  const py = await window.loadPyodide!({ indexURL: PYODIDE });
  onLog("numpy, sympy, scipy…");
  await py.loadPackage(["numpy", "sympy", "scipy"]);
  const files: string[] = await (await fetch("/py/manifest.json")).json();
  for (const f of files) {
    const dir = f.split("/").slice(0, -1).join("/");
    py.FS.mkdirTree(`/home/pyodide/${dir}`);
    py.FS.writeFile(`/home/pyodide/${f}`, await (await fetch(`/py/${f}`)).text());
  }
  return py;
}

export function PythonLab({ labels }: { labels: Labels }) {
  const py = useRef<Py | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "running">("idle");
  const [code, setCode] = useState(PRESETS["Einstein → ρ_E"]);
  const [out, setOut] = useState("");

  const ensure = async () => {
    if (py.current) return py.current;
    setState("loading");
    setOut(`${labels.loading}\n`);
    try {
      py.current = await boot((s) => setOut((o) => o + s + "\n"));
      py.current.setStdout({ batched: (s) => setOut((o) => o + s + "\n") });
      py.current.setStderr({ batched: (s) => setOut((o) => o + s + "\n") });
      setState("ready");
      setOut("");
      return py.current;
    } catch (e) {
      setState("idle");
      setOut(`Error: ${e instanceof Error ? e.message : String(e)}`);
      return null;
    }
  };

  const run = async () => {
    const p = await ensure();
    if (!p) return;
    setState("running");
    setOut("");
    const t0 = performance.now();
    try {
      await p.runPythonAsync(code);
      setOut((o) => o + `\n· ${((performance.now() - t0) / 1000).toFixed(2)} s`);
    } catch (e) {
      setOut((o) => o + String(e));
    } finally {
      setState("ready");
    }
  };

  return (
    <div className="card grid gap-5 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <h3 className="font-serif text-2xl tracking-[-0.02em]">{labels.python}</h3>
          <p className="max-w-[60ch] text-sm text-muted">{labels.pythonBody} {state === "idle" && labels.pythonSize}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(PRESETS).map((k) => (
            <button key={k} type="button" onClick={() => setCode(PRESETS[k])} className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-muted hover:text-fg">{k}</button>
          ))}
        </div>
      </div>
      <label htmlFor="py-code" className="sr-only">Python</label>
      <textarea id="py-code" value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} rows={12}
        onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run(); }}
        className="w-full resize-y rounded-md border border-line bg-bg-2 p-4 font-mono text-[13px] leading-relaxed text-fg outline-none focus:border-line-strong" />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={run} disabled={state === "loading" || state === "running"}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-[var(--ink)] px-5 text-[15px] font-medium text-[var(--bg)] transition-transform active:scale-[0.98] disabled:opacity-60">
          <Play size={16} weight="fill" aria-hidden />
          {state === "idle" ? labels.loadPython : state === "loading" ? labels.loading : state === "running" ? labels.running : labels.run}
        </button>
        <span className="text-xs text-muted"><kbd>⌘</kbd> <kbd>Enter</kbd></span>
        <span className="tag tag-green ml-auto">Pyodide · CPython 3.12</span>
      </div>
      <div className="grid gap-2">
        <span className="text-xs uppercase tracking-[0.05em] text-muted">{labels.output}</span>
        <pre aria-live="polite" className="min-h-24 overflow-x-auto whitespace-pre-wrap rounded-md border border-line bg-surface p-4 font-mono text-[13px] text-fg-2">{out}</pre>
      </div>
    </div>
  );
}
