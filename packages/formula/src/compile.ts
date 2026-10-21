import type { Node } from "./ast";
import { diff } from "./diff";

export type Scope = Record<string, number>;
export type Compiled = (scope: Scope) => number;

const JS_FN: Record<string, string> = {
  sin: "Math.sin", cos: "Math.cos", tan: "Math.tan", exp: "Math.exp", log: "Math.log",
  sqrt: "Math.sqrt", abs: "Math.abs", sinh: "Math.sinh", cosh: "Math.cosh", tanh: "Math.tanh",
  sech: "F.sech", csch: "F.csch", coth: "F.coth",
};
const F = {
  sech: (u: number) => { const e = Math.exp(-2 * Math.abs(u)); return (2 * Math.sqrt(e)) / (1 + e); },
  csch: (u: number) => 1 / Math.sinh(u),
  coth: (u: number) => 1 / Math.tanh(u),
};
const CONST: Record<string, number> = { pi: Math.PI, e: Math.E };

function js(n: Node): string {
  switch (n.k) {
    case "num": return `(${n.v})`;
    case "sym": return n.name in CONST ? `(${CONST[n.name]})` : `s[${JSON.stringify(n.name)}]`;
    case "neg": return `(-${js(n.a)})`;
    case "bin": return n.op === "^" ? `(${js(n.a)}**${js(n.b)})` : `(${js(n.a)}${n.op}${js(n.b)})`;
    case "eq": return js(n.b);
    case "call":
      if (n.fn === "diff") return js(diff(n.args[0], (n.args[1] as { name: string }).name));
      if (!JS_FN[n.fn]) throw new Error(`función no compilable «${n.fn}»`);
      return `${JS_FN[n.fn]}(${n.args.map(js).join(",")})`;
  }
}

/** Compila a una función JS nativa: miles de evaluaciones por frame sin coste de interpretación. */
export function compile(n: Node): Compiled {
  const body = js(n);
  // eslint-disable-next-line no-new-func
  const f = new Function("s", "F", `return ${body};`) as (s: Scope, f: typeof F) => number;
  return (scope) => f(scope, F);
}

/** Evaluación directa sin compilar (útil para una sola llamada). */
export function evaluate(n: Node, scope: Scope): number {
  return compile(n)(scope);
}
