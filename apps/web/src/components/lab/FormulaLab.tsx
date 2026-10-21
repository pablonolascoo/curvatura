"use client";

import { FormulaSyntaxError, compile, diff, parse, symbols, toMathML, type Node } from "@curvatura/formula";
import { useMemo, useState } from "react";
import { formatSci } from "../LiveEquation";

type Labels = { formula: string; formulaBody: string; expression: string; derivative: string; value: string; error: string };

const CONST = new Set(["pi", "e"]);

export function FormulaLab({ labels, lang }: { labels: Labels; lang: string }) {
  const [src, setSrc] = useState("v_s^2 * R^2 * sigma / 36 * tanh(sigma*R)");
  const [vals, setVals] = useState<Record<string, number>>({});
  const [wrt, setWrt] = useState("sigma");

  const res = useMemo(() => {
    try {
      const ast: Node = parse(src);
      const rhs = ast.k === "eq" ? ast.b : ast;
      const vars = [...symbols(rhs)].filter((s) => !CONST.has(s)).sort();
      return { ast, rhs, vars, error: null as string | null };
    } catch (e) {
      return { ast: null, rhs: null, vars: [] as string[], error: e instanceof FormulaSyntaxError || e instanceof Error ? e.message : String(e) };
    }
  }, [src]);

  const out = useMemo(() => {
    if (!res.rhs) return null;
    const scope = Object.fromEntries(res.vars.map((v) => [v, vals[v] ?? 1]));
    try {
      const value = compile(res.rhs)(scope);
      const x = res.vars.includes(wrt) ? wrt : res.vars[0];
      const d = x ? diff(res.rhs, x) : null;
      return { value, x, dHtml: d ? toMathML(d) : "", dValue: d ? compile(d)(scope) : NaN, html: toMathML(res.ast!), error: null as string | null };
    } catch (e) {
      return { value: NaN, x: "", dHtml: "", dValue: NaN, html: toMathML(res.ast!), error: e instanceof Error ? e.message : String(e) };
    }
  }, [res, vals, wrt]);

  return (
    <div className="card grid gap-6 p-6 md:p-8">
      <div className="grid gap-2">
        <h3 className="font-serif text-2xl tracking-[-0.02em]">{labels.formula}</h3>
        <p className="text-sm text-muted">{labels.formulaBody}</p>
      </div>
      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-[0.05em] text-muted">{labels.expression}</span>
        <input value={src} onChange={(e) => setSrc(e.target.value)} spellCheck={false} autoComplete="off" name="expression"
          className="h-11 rounded-md border border-line bg-bg-2 px-4 font-mono text-sm text-fg outline-none focus:border-line-strong" />
      </label>
      {(res.error || out?.error) && <p className="tag tag-red w-max normal-case tracking-normal">{labels.error}: {res.error ?? out?.error}</p>}
      {out && (
        <>
          <div translate="no" className="overflow-x-auto text-xl text-fg" dangerouslySetInnerHTML={{ __html: out.html }} />
          {res.vars.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {res.vars.map((v) => (
                <label key={v} className="grid gap-1 text-sm">
                  <span className="font-mono text-muted">{v}</span>
                  <input type="number" step="any" value={vals[v] ?? 1} onChange={(e) => setVals({ ...vals, [v]: Number(e.target.value) })}
                    className="h-10 rounded-md border border-line bg-surface px-3 font-mono text-fg outline-none focus:border-line-strong" />
                </label>
              ))}
            </div>
          )}
          <div className="grid gap-4 border-t border-line pt-5 md:grid-cols-2">
            <div className="grid gap-1">
              <span className="text-xs uppercase tracking-[0.05em] text-muted">{labels.value}</span>
              <span className="font-mono text-2xl tabular-nums text-fg">{formatSci(out.value, lang)}</span>
            </div>
            {out.x && (
              <div className="grid gap-2">
                <label className="flex items-center gap-2 text-xs uppercase tracking-[0.05em] text-muted">
                  {labels.derivative}
                  <select value={out.x} onChange={(e) => setWrt(e.target.value)} className="rounded border border-line bg-surface px-2 py-1 font-mono text-xs normal-case text-fg">
                    {res.vars.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </label>
                <div translate="no" className="overflow-x-auto text-fg-2" dangerouslySetInnerHTML={{ __html: out.dHtml }} />
                <span className="font-mono text-sm tabular-nums text-muted">= {formatSci(out.dValue, lang)}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
