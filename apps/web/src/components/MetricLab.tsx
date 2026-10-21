"use client";

import { FormulaSystem, parse, toMathML } from "@curvatura/formula";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadCore, type Core } from "@/lib/core";
import { formatSci } from "./LiveEquation";
import { WarpField } from "./WarpField";

/** c²/G en kg/m: convierte una longitud geométrica en masa. */
const C2_OVER_G = 299_792_458 ** 2 / 6.6743e-11;
const M_JUPITER = 1.89813e27;

type Labels = {
  velocity: string;
  radius: string;
  wall: string;
  shape: string;
  density: string;
  energy: string;
  jupiter: string;
  geometric: string;
  note: string;
  canvas: string;
  contraction: string;
  expansion: string;
};

const sys = new FormulaSystem().define("f(r) = (tanh(sigma*(r + R)) - tanh(sigma*(r - R))) / (2*tanh(sigma*R))");
const fShape = sys.fn("f(r)");
const fDeriv = sys.derivative("f(r)", "r");

/** E = -(v²/12) ∫ r² f'(r)² dr, Simpson sobre la pared (fuera de ella f' ≈ 0). */
function totalEnergy(v: number, R: number, sigma: number): number {
  const a = Math.max(0, R - 24 / sigma);
  const b = R + 24 / sigma;
  const n = 2400;
  const h = (b - a) / n;
  const s = { R, sigma, r: 0 };
  const g = (r: number) => {
    s.r = r;
    const d = fDeriv(s);
    return r * r * d * d;
  };
  let acc = g(a) + g(b);
  for (let i = 1; i < n; i++) acc += g(a + i * h) * (i % 2 ? 4 : 2);
  return (-(v * v) * (acc * h)) / 3 / 12;
}

const FORMULAS = {
  metric: "ds^2 = -dt^2 + (dx - v_s*f(r_s)*dt)^2 + dy^2 + dz^2",
  shape: "f(r_s) = (tanh(sigma*(r_s + R)) - tanh(sigma*(r_s - R))) / (2*tanh(sigma*R))",
};

function Slider(props: {
  id: string;
  label: string;
  symbol: string;
  value: number;
  min: number;
  max: number;
  step: number;
  log?: boolean;
  unit: string;
  onChange: (v: number) => void;
  onActive: (on: boolean) => void;
}) {
  const { id, label, symbol, value, min, max, step, log, unit, onChange, onActive } = props;
  const toPos = (v: number) => (log ? Math.log10(v) : v);
  const fromPos = (p: number) => (log ? 10 ** p : p);
  const shown = value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2);
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm text-muted">
          {label} <span className="font-mono text-fg">{symbol}</span>
        </label>
        <output htmlFor={id} className="font-mono text-sm tabular-nums text-fg">
          {shown} <span className="text-muted">{unit}</span>
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={toPos(min)}
        max={toPos(max)}
        step={log ? 0.01 : step}
        value={toPos(value)}
        onChange={(e) => onChange(Number(fromPos(Number(e.target.value)).toPrecision(4)))}
        onPointerDown={() => onActive(true)}
        onPointerUp={() => onActive(false)}
        onFocus={() => onActive(true)}
        onBlur={() => onActive(false)}
        className="w-full cursor-pointer"
      />
    </div>
  );
}

function Plot({ R, sigma, labels }: { R: number; sigma: number; labels: Labels }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const draw = () => {
      const { width, height } = c.getBoundingClientRect();
      if (!width) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      c.width = width * dpr;
      c.height = height * dpr;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const css = getComputedStyle(document.documentElement);
      const fg = css.getPropertyValue("--ink").trim();
      const accent = css.getPropertyValue("--red").trim();
      const line = css.getPropertyValue("--line-strong").trim();
      const pad = 8;
      const mid = height * 0.55;
      const N = 360;
      const rMax = Math.max(R + 6 / sigma, 1.5 * R);
      const s = { R, sigma, r: 0 };
      let dMax = 0;
      const d2: number[] = [];
      for (let i = 0; i <= N; i++) {
        s.r = (rMax * i) / N;
        const d = fDeriv(s);
        d2.push(d * d);
        dMax = Math.max(dMax, d * d);
      }
      ctx.strokeStyle = line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, mid);
      ctx.lineTo(width - pad, mid);
      ctx.stroke();
      const X = (i: number) => pad + ((width - 2 * pad) * i) / N;
      // ρ_E ∝ -f'² (bajo el eje)
      ctx.beginPath();
      ctx.moveTo(X(0), mid);
      d2.forEach((v, i) => ctx.lineTo(X(i), mid + (height - mid - pad) * (v / (dMax || 1))));
      ctx.lineTo(X(N), mid);
      ctx.closePath();
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.12;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // f(r) (sobre el eje)
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        s.r = (rMax * i) / N;
        const y = mid - (mid - pad) * fShape(s);
        if (i === 0) ctx.moveTo(X(i), y);
        else ctx.lineTo(X(i), y);
      }
      ctx.strokeStyle = fg;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(c);
    return () => ro.disconnect();
  }, [R, sigma]);
  return (
    <figure className="grid gap-3">
      <canvas ref={ref} className="h-44 w-full" aria-label={`${labels.shape} / ${labels.density}`} role="img" />
      <figcaption className="flex gap-6 text-xs text-muted">
        <span className="flex items-center gap-2">
          <span className="h-px w-5 bg-[var(--ink)]" aria-hidden /> {labels.shape}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-px w-5 bg-red" aria-hidden /> {labels.density}
        </span>
      </figcaption>
    </figure>
  );
}

export function MetricLab({ labels, lang }: { labels: Labels; lang: string }) {
  const [v, setV] = useState(1);
  const [R, setR] = useState(100);
  const [sigma, setSigma] = useState(0.1);
  const [active, setActive] = useState<string | null>(null);

  // Núcleo Rust en WebAssembly; mientras carga (o si falla) calcula el motor de fórmulas.
  const [core, setCore] = useState<Core | null>(null);
  const [coreError, setCoreError] = useState<string | null>(null);
  useEffect(() => {
    loadCore().then(setCore, (err: unknown) => setCoreError(err instanceof Error ? err.message : String(err)));
  }, []);
  const E = useMemo(() => (core ? core.totalEnergy(v, R, sigma) : totalEnergy(v, R, sigma)), [core, v, R, sigma]);
  const mJ = (E * C2_OVER_G) / M_JUPITER;

  const hl = active ? [active] : [];
  const html = useMemo(
    () => ({
      metric: toMathML(parse(FORMULAS.metric), { highlight: hl }),
      shape: toMathML(parse(FORMULAS.shape), { highlight: hl }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active],
  );

  // La vista 3D usa la forma adimensional (σR), que es lo que fija la geometría de la pared.
  const view = { v: Math.min(v, 3), R: 1, sigma: Math.min(Math.max(sigma * R * 0.04, 1.6), 9) };
  const peak = (view.v * view.sigma) / 2;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="card relative overflow-hidden lg:col-span-7">
        <div className="relative h-full min-h-[380px] md:min-h-[560px]">
          <WarpField
            params={view}
            amplitude={0.9 / Math.max(peak, 0.5) * (0.55 + 0.25 * Math.log10(1 + v))}
            drift={false}
            label={labels.canvas}
            className="absolute inset-0"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap gap-2 p-5">
            <span className="tag tag-red">{labels.contraction}</span>
            <span className="tag tag-blue">{labels.expansion}</span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 grid gap-1 p-6 md:p-8">
            <div className="overflow-x-auto text-lg text-fg md:text-xl" dangerouslySetInnerHTML={{ __html: html.metric }} />
          </div>
        </div>
      </div>

      <div className="card lg:col-span-5">
        <div className="grid h-full gap-8 p-6 md:p-8">
          <div className="overflow-x-auto text-[0.95rem] text-fg-2" dangerouslySetInnerHTML={{ __html: html.shape }} />
          <div className="grid gap-6">
            <Slider id="v" label={labels.velocity} symbol="v" unit="c" value={v} min={0.1} max={10} step={0.01} log onChange={setV} onActive={(on) => setActive(on ? "v_s" : null)} />
            <Slider id="R" label={labels.radius} symbol="R" unit="m" value={R} min={1} max={1000} step={1} log onChange={setR} onActive={(on) => setActive(on ? "R" : null)} />
            <Slider id="sigma" label={labels.wall} symbol="σ" unit="m⁻¹" value={sigma} min={0.05} max={50} step={0.01} log onChange={setSigma} onActive={(on) => setActive(on ? "sigma" : null)} />
          </div>
          <Plot R={R} sigma={sigma} labels={labels} />
          <div className="grid gap-1 border-t border-line pt-6" aria-live="polite">
            <span className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.05em] text-muted">
              {labels.energy}
              <span className={`tag ${core ? "tag-green" : ""}`} title={coreError ?? undefined}>{core ? "Rust · WASM" : "TS"}</span>
            </span>
            <span className="font-mono text-3xl tracking-tight tabular-nums text-red">
              {formatSci(mJ, lang)} <span className="text-base text-muted">{labels.jupiter}</span>
            </span>
            <span className="font-mono text-xs tabular-nums text-muted">
              E = {formatSci(E, lang)} m ({labels.geometric})
            </span>
          </div>
          <p className="text-xs leading-relaxed text-muted">{labels.note}</p>
        </div>
      </div>
    </div>
  );
}
