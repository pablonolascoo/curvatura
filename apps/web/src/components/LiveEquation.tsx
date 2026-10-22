"use client";

import { compile, parse } from "@curvatura/formula";
import { useEffect, useMemo, useRef, useState } from "react";
import type { EquationView } from "@/lib/equations";

type Labels = { result: string; source: string; inputs: string };

/** Unidades con subíndice tipográfico: M_J → M con J subíndice. */
function Unit({ u }: { u: string }) {
  const [b, sub] = u.split("_");
  return <span className="text-base text-muted">{b}{sub && <sub>{sub}</sub>}</span>;
}

const GROUP_TEXT: Record<string, string> = { energy: "text-red", geometry: "text-blue", velocity: "text-yellow", matter: "text-green" };

const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };

/** 1.97×10² con superíndices tipográficos; números normales entre 10⁻³ y 10⁵. */
export function formatSci(x: number, lang: string, digits = 3): string {
  if (!Number.isFinite(x)) return "–";
  if (x === 0) return "0";
  const a = Math.abs(x);
  if (a >= 1e-3 && a < 1e5) return new Intl.NumberFormat(lang, { maximumSignificantDigits: digits }).format(x).replace("-", "−");
  const e = Math.floor(Math.log10(a));
  const m = new Intl.NumberFormat(lang, { minimumFractionDigits: digits - 1, maximumFractionDigits: digits - 1 }).format(x / 10 ** e);
  return `${m.replace("-", "−")}×10${String(e).replace(/./g, (c) => SUP[c] ?? c)}`;
}

/** Interpola el número mostrado en escala logarítmica, sin re-render de React por frame. */
function useTween(target: number, lang: string) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(target);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const a = from.current, b = target;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sameSign = Math.sign(a) === Math.sign(b) && a !== 0 && b !== 0;
    if (reduce || !sameSign || !Number.isFinite(a) || !Number.isFinite(b)) {
      el.textContent = formatSci(b, lang);
      from.current = b;
      return;
    }
    const la = Math.log10(Math.abs(a)), lb = Math.log10(Math.abs(b)), s = Math.sign(b);
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 420);
      const e = 1 - (1 - k) ** 3;
      const v = s * 10 ** (la + (lb - la) * e);
      el.textContent = formatSci(v, lang);
      from.current = v;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, lang]);
  return ref;
}

function Slider({ input, value, onChange, onFocus, lang }: { input: NonNullable<EquationView["compute"]>["inputs"][number]; value: number; onChange: (v: number) => void; onFocus: (on: boolean) => void; lang: string }) {
  const toPos = (v: number) => (input.log ? Math.log10(v) : v);
  const fromPos = (p: number) => (input.log ? 10 ** p : p);
  const id = `in-${input.sym}-${Math.round(input.max * 1e3)}`;
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <label htmlFor={id} className="text-fg" dangerouslySetInnerHTML={{ __html: input.html }} />
        <output htmlFor={id} className="font-mono tabular-nums text-fg">
          {formatSci(value, lang)} <span className="text-muted">{input.unit}</span>
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={toPos(input.min)}
        max={toPos(input.max)}
        step={(toPos(input.max) - toPos(input.min)) / 400}
        value={toPos(value)}
        onChange={(e) => onChange(Number(fromPos(Number(e.target.value)).toPrecision(4)))}
        onPointerDown={() => onFocus(true)}
        onPointerUp={() => onFocus(false)}
        onFocus={() => onFocus(true)}
        onBlur={() => onFocus(false)}
        className="w-full cursor-pointer"
      />
    </div>
  );
}

export function LiveEquation({ eq, lang, labels, paperHref, compact }: { eq: EquationView; lang: string; labels: Labels; paperHref?: string; compact?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [vals, setVals] = useState<Record<string, number>>(() => Object.fromEntries((eq.compute?.inputs ?? []).map((i) => [i.sym, i.default])));

  // Entrada escalonada al aparecer en pantalla.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.classList.add("eq-anim");
        io.disconnect();
      }
    }, { rootMargin: "0px 0px 35% 0px", threshold: 0 }); // arranca justo antes de verse
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Resalta todas las apariciones del símbolo enfocado.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    el.classList.toggle("eq-focus", !!focus);
    el.querySelectorAll<HTMLElement>("[data-sym]").forEach((n) => {
      if (focus && n.dataset.sym === focus) n.setAttribute("data-on", "");
      else n.removeAttribute("data-on");
    });
  }, [focus]);

  const fns = useMemo(() => {
    if (!eq.compute) return null;
    try {
      return { main: compile(parse(eq.compute.result)), also: eq.compute.also ? compile(parse(eq.compute.also.expr)) : null, error: null };
    } catch (err) {
      return { main: null, also: null, error: err instanceof Error ? err.message : String(err) };
    }
  }, [eq.compute]);

  const scope = { ...(eq.compute?.constants ?? {}), ...vals };
  const main = fns?.main ? fns.main(scope) : NaN;
  const also = fns?.also ? fns.also(scope) : NaN;
  const mainRef = useTween(main, lang);
  const alsoRef = useTween(also, lang);
  // El texto inicial lo pinta React una vez; después solo lo actualiza la interpolación.
  const [first] = useState(() => ({ main: formatSci(main, lang), also: formatSci(also, lang) }));

  return (
    <article className="card grid gap-6 p-6 md:p-8">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-serif text-xl tracking-[-0.02em] md:text-2xl">{eq.title}</h3>
        <span className="font-mono text-xs text-muted">{eq.subsystem}</span>
      </header>

      <div
        ref={box}
        translate="no"
        className="overflow-x-auto py-2 text-[1.15rem] text-fg md:text-[1.4rem]"
        onPointerOver={(e) => {
          const s = (e.target as HTMLElement).closest<HTMLElement>("[data-sym]")?.dataset.sym;
          setFocus(s ?? null);
        }}
        onPointerLeave={() => setFocus(null)}
        dangerouslySetInnerHTML={{ __html: eq.html }}
      />

      {!compact && (
        <ul className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          {eq.legend.map((l) => (
            <li key={l.sym}>
              <button
                type="button"
                onMouseEnter={() => setFocus(l.sym)}
                onMouseLeave={() => setFocus(null)}
                onFocus={() => setFocus(l.sym)}
                onBlur={() => setFocus(null)}
                className="flex w-full items-baseline gap-3 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-gray-bg"
              >
                <span translate="no" className="min-w-12 shrink-0" dangerouslySetInnerHTML={{ __html: l.html }} />
                <span className="text-muted">{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {eq.compute && (
        <div className="grid gap-5 border-t border-line pt-6">
          {fns?.error && <p className="tag tag-red w-max">{fns.error}</p>}
          {eq.compute.inputs.map((i) => (
            <Slider key={i.sym} input={i} lang={lang} value={vals[i.sym]} onChange={(v) => setVals((s) => ({ ...s, [i.sym]: v }))} onFocus={(on) => setFocus(on ? i.sym : null)} />
          ))}
          <div className="grid gap-1" aria-live="polite">
            <span className="text-xs uppercase tracking-[0.05em] text-muted">{labels.result}</span>
            <span className="font-mono text-2xl tabular-nums tracking-tight text-fg md:text-3xl">
              <span ref={mainRef} className={GROUP_TEXT[eq.legend[0]?.group] ?? ""}>{first.main}</span> <Unit u={eq.compute.unit} />
            </span>
            {eq.compute.also && (
              <span className="font-mono text-sm tabular-nums text-muted">
                {eq.compute.also.label}: <span ref={alsoRef} className="text-fg">{first.also}</span> <Unit u={eq.compute.also.unit} />
              </span>
            )}
          </div>
        </div>
      )}

      {(eq.note || paperHref) && (
        <footer className="grid gap-2 text-sm">
          {eq.note && <p className="text-muted">{eq.note}</p>}
          {paperHref && (
            <a href={paperHref} className="w-max text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg">
              {labels.source}
            </a>
          )}
        </footer>
      )}
    </article>
  );
}
