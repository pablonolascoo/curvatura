"use client";

import { useEffect, useRef, useState } from "react";
import { loadCore, nativeField, nativeHardware, type Core, type Hardware } from "@/lib/core";
import { formatSci } from "../LiveEquation";

type Labels = { core: string; coreBody: string; time: string; energy: string; conservation: string; clickHint: string; loading: string; error: string; contraction: string; expansion: string; velocity: string; radius: string; wall: string };

const N = 220;
const HALF = 2.5;

function rgb(css: string): [number, number, number] {
  const c = document.createElement("canvas").getContext("2d")!;
  c.fillStyle = css;
  const h = c.fillStyle as string; // normaliza a #rrggbb
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}

export function CoreLab({ labels, lang }: { labels: Labels; lang: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [core, setCore] = useState<Core | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [p, setP] = useState({ v: 1.2, R: 1, sigma: 5 });
  const [stats, setStats] = useState<{ ms: number; E: number; dH: number | null }>({ ms: 0, E: 0, dH: null });
  const paths = useRef<Float64Array[]>([]);
  const [hw, setHw] = useState<Hardware | null>(null);
  const [res, setRes] = useState<{ n: number; motor: string }>({ n: N, motor: "Rust · WebAssembly" });
  const turno = useRef(0);

  useEffect(() => {
    loadCore().then(setCore, (e: unknown) => setErr(e instanceof Error ? e.message : String(e)));
    nativeHardware().then(setHw, () => setHw(null));
  }, []);

  const draw = async () => {
    const c = canvas.current;
    if (!c || !core) return;
    const mio = ++turno.current;
    const css = getComputedStyle(document.documentElement);
    const bg = rgb(css.getPropertyValue("--surface").trim());
    const red = rgb(css.getPropertyValue("--red").trim());
    const blue = rgb(css.getPropertyValue("--blue").trim());
    const ink = css.getPropertyValue("--ink").trim();
    const { width } = c.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio, 2);
    // En la app nativa se calcula a la resolución real de la pantalla (GPU o todos los núcleos).
    const n = hw ? Math.max(N, Math.min(2048, Math.round(width * dpr))) : N;
    const t0 = performance.now();
    const nativo = hw ? await nativeField(p.v, p.R, p.sigma, HALF, n).catch(() => null) : null;
    const theta = nativo ? nativo.theta : core.field(p.v, p.R, p.sigma, HALF, n).theta;
    const E = core.totalEnergy(p.v, p.R, p.sigma);
    const ms = performance.now() - t0;
    if (mio !== turno.current) return; // llegó un cálculo más nuevo
    const N_ = n;
    let peak = 0;
    for (const x of theta) peak = Math.max(peak, Math.abs(x));
    const img = new ImageData(N_, N_);
    for (let j = 0; j < N_; j++)
      for (let i = 0; i < N_; i++) {
        const th = theta[(N_ - 1 - j) * N_ + i] / (peak || 1);
        const col = th < 0 ? red : blue;
        const k = Math.min(1, Math.abs(th)) ** 0.7;
        const o = 4 * (j * N_ + i);
        for (let ch = 0; ch < 3; ch++) img.data[o + ch] = bg[ch] + (col[ch] - bg[ch]) * k;
        img.data[o + 3] = 255;
      }
    const off = document.createElement("canvas");
    off.width = off.height = N_;
    off.getContext("2d")!.putImageData(img, 0, 0);
    c.width = c.height = width * dpr;
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, c.width, c.height);
    // Geodésicas en el marco de la burbuja: (x - v t, y).
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.5 * dpr;
    const S = c.width / (2 * HALF);
    for (const path of paths.current) {
      ctx.beginPath();
      for (let k = 0; k < path.length / 3; k++) {
        const X = (path[3 * k + 1] - p.v * path[3 * k] + HALF) * S;
        const Y = (HALF - path[3 * k + 2]) * S;
        if (k === 0) ctx.moveTo(X, Y);
        else ctx.lineTo(X, Y);
      }
      ctx.stroke();
    }
    setStats((s) => ({ ...s, ms, E }));
    setRes({ n: N_, motor: nativo ? (nativo.motor === "gpu" ? `Rust nativo · GPU ${hw?.gpu ?? ""}` : `Rust nativo · CPU ${hw?.hilos ?? ""} hilos`) : "Rust · WebAssembly" });
  };

  useEffect(() => { void draw(); }, [core, p, hw]); // eslint-disable-line react-hooks/exhaustive-deps

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!core) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x0 = ((e.clientX - r.left) / r.width) * 2 * HALF - HALF;
    const y0 = HALF - ((e.clientY - r.top) / r.height) * 2 * HALF;
    const { path, dH } = core.geodesic(p.v, p.R, p.sigma, x0, y0, 2e-3, 3000);
    paths.current = [...paths.current.slice(-7), path];
    setStats((s) => ({ ...s, dH }));
    void draw();
  };

  const slider = (key: "v" | "R" | "sigma", label: string, min: number, max: number) => (
    <label className="grid gap-2 text-sm">
      <span className="flex justify-between text-muted">
        {label} <span className="font-mono text-fg tabular-nums">{p[key].toFixed(2)}</span>
      </span>
      <input type="range" min={min} max={max} step={(max - min) / 200} value={p[key]} onChange={(e) => { paths.current = []; setP({ ...p, [key]: Number(e.target.value) }); }} />
    </label>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="card relative overflow-hidden lg:col-span-7">
        {!core && !err && <div className="aspect-square animate-pulse bg-gray-bg" aria-label={labels.loading} />}
        {err && <p className="tag tag-red m-6">{labels.error}: {err}</p>}
        <canvas ref={canvas} onClick={onClick} className={`aspect-square w-full cursor-crosshair ${core ? "" : "hidden"}`} aria-label={labels.clickHint} role="img" />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap gap-2 p-4">
          <span className="tag tag-red">{labels.contraction}</span>
          <span className="tag tag-blue">{labels.expansion}</span>
          <span className="tag">{labels.clickHint}</span>
        </div>
      </div>
      <div className="card grid content-start gap-6 p-6 md:p-8 lg:col-span-5">
        <div className="grid gap-2">
          <h3 className="font-serif text-2xl tracking-[-0.02em]">{labels.core}</h3>
          <p className="text-sm text-muted">{labels.coreBody}</p>
        </div>
        {slider("v", `${labels.velocity} v (c)`, 0.1, 4)}
        {slider("R", `${labels.radius} R`, 0.4, 1.8)}
        {slider("sigma", `${labels.wall} σ`, 1, 20)}
        <dl className="grid gap-3 border-t border-line pt-5 font-mono text-sm tabular-nums">
          <div className="flex justify-between"><dt className="text-muted">{labels.time}</dt><dd className="text-fg">{stats.ms.toFixed(1)} ms · {res.n}×{res.n}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">{labels.energy}</dt><dd className="text-red">{formatSci(stats.E, lang)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">{labels.conservation} ΔH</dt><dd className={stats.dH === null ? "text-muted" : Math.abs(stats.dH) < 1e-6 ? "text-green" : "text-yellow"}>{stats.dH === null ? "–" : formatSci(stats.dH, lang)}</dd></div>
        </dl>
        <span className="tag tag-green w-max normal-case tracking-normal">{res.motor}</span>
      </div>
    </div>
  );
}
