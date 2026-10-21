import "server-only";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { parse, toMathML } from "@curvatura/formula";
import type { Locale } from "./i18n";

const ROOT = path.resolve(process.cwd(), "../../library/equations");

type L10n = Record<Locale, string>;
type Input = { min: number; max: number; default: number; unit: string; log?: boolean };

export type EquationSpec = {
  id: string;
  paper: string;
  subsystem: string;
  title: L10n;
  expr: string;
  symbols: Record<string, { group: string } & L10n>;
  note?: L10n;
  compute?: {
    result: string;
    unit: string;
    inputs: Record<string, Input>;
    constants?: string[];
    also?: { label: L10n; expr: string; unit: string };
  };
};

/** Lo que recibe el componente cliente: ya localizado y con el MathML preparado. */
export type EquationView = {
  id: string;
  paper: string;
  subsystem: string;
  title: string;
  note: string | null;
  html: string;
  legend: { sym: string; group: string; label: string; html: string }[];
  compute: null | {
    result: string;
    unit: string;
    inputs: (Input & { sym: string; html: string })[];
    constants: Record<string, number>;
    also: null | { label: string; expr: string; unit: string };
  };
};

let cache: EquationSpec[] | null = null;
let constants: Record<string, number> | null = null;

export function getConstants(): Record<string, number> {
  if (!constants) constants = YAML.parse(readFileSync(path.join(ROOT, "constants.yaml"), "utf8")) as Record<string, number>;
  return constants;
}

export function getEquations(): EquationSpec[] {
  if (cache) return cache;
  if (!existsSync(ROOT)) return (cache = []);
  cache = readdirSync(ROOT)
    .filter((f) => f.endsWith(".yaml") && f !== "constants.yaml")
    .map((f) => {
      const e = YAML.parse(readFileSync(path.join(ROOT, f), "utf8")) as EquationSpec;
      if (!e?.id || !e.expr) throw new Error(`Ecuación inválida: library/equations/${f}`);
      parse(e.expr); // falla en build si el DSL está mal
      return e;
    })
    .sort((a, b) => "GCESDQMPV".indexOf(a.subsystem) - "GCESDQMPV".indexOf(b.subsystem) || a.id.localeCompare(b.id));
  return cache;
}

/** Marca cada símbolo con su grupo y cada término con su orden de aparición. */
function decorate(html: string, symbols: EquationSpec["symbols"]): string {
  let t = 0;
  return html
    .replace(/<(mi|msub|msup|msubsup|mrow) data-sym="([^"]+)"/g, (_m, tag: string, sym: string) => {
      const g = symbols[sym]?.group ?? "plain";
      return `<${tag} class="eq-term" style="--t:${t++}" data-group="${g}" data-sym="${sym}"`;
    })
    .replace(/<(mo|mn)>/g, (_m, tag: string) => `<${tag} class="eq-term" style="--t:${t++}">`);
}

export function equationView(e: EquationSpec, lang: Locale): EquationView {
  const c = getConstants();
  const symHtml = (s: string) => decorate(toMathML(parse(s), { display: "inline" }), e.symbols);
  return {
    id: e.id,
    paper: e.paper,
    subsystem: e.subsystem,
    title: e.title[lang],
    note: e.note?.[lang] ?? null,
    html: decorate(toMathML(parse(e.expr)), e.symbols),
    legend: Object.entries(e.symbols).map(([sym, s]) => ({ sym, group: s.group, label: s[lang], html: symHtml(sym) })),
    compute: e.compute
      ? {
          result: e.compute.result,
          unit: e.compute.unit,
          inputs: Object.entries(e.compute.inputs ?? {}).map(([sym, i]) => ({ ...i, sym, html: symHtml(sym) })),
          constants: Object.fromEntries((e.compute.constants ?? []).map((k) => [k, c[k]])),
          also: e.compute.also ? { label: e.compute.also.label[lang], expr: e.compute.also.expr, unit: e.compute.also.unit } : null,
        }
      : null,
  };
}

export const getEquation = (id: string) => getEquations().find((e) => e.id === id);
export const equationsForPaper = (paper: string) => getEquations().filter((e) => e.paper === paper);
