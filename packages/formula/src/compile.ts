import type { Node } from "./ast";
import { diff } from "./diff";

export type Scope = Record<string, number>;
export type Compiled = (scope: Scope) => number;

const JS_FN: Record<string, string> = {
  sin: "Math.sin", cos: "Math.cos", tan: "Math.tan", exp: "Math.exp", log: "Math.log",
  sqrt: "Math.sqrt", abs: "Math.abs", sinh: "Math.sinh", cosh: "Math.cosh", tanh: "Math.tanh",
  sech: "F.sech", csch: "F.csch", coth: "F.coth",
};
/** Simpson compuesto (n par). */
function simpson(f: (x: number) => number, a: number, b: number, n = 600): number {
  const h = (b - a) / n;
  let acc = f(a) + f(b);
  for (let i = 1; i < n; i++) acc += f(a + i * h) * (i % 2 ? 4 : 2);
  return (acc * h) / 3;
}

const F = {
  int: simpson,
  sech: (u: number) => { const e = Math.exp(-2 * Math.abs(u)); return (2 * Math.sqrt(e)) / (1 + e); },
  csch: (u: number) => 1 / Math.sinh(u),
  coth: (u: number) => 1 / Math.tanh(u),
};
const CONST: Record<string, number> = { pi: Math.PI, e: Math.E };

let depth = 0;

function js(n: Node, s = "s"): string {
  const r = (m: Node) => js(m, s);
  switch (n.k) {
    case "num": return `(${n.v})`;
    case "sym": return n.name in CONST ? `(${CONST[n.name]})` : `${s}[${JSON.stringify(n.name)}]`;
    case "neg": return `(-${r(n.a)})`;
    case "bin": return n.op === "^" ? `(${r(n.a)}**${r(n.b)})` : `(${r(n.a)}${n.op}${r(n.b)})`;
    case "eq": return n.b.k === "eq" ? r(n.b.a) : r(n.b); // a = b ≤ c: se evalúa b
    case "call":
      if (n.fn === "diff") return r(diff(n.args[0], (n.args[1] as { name: string }).name));
      if (n.fn === "int") {
        // int(f, x, a, b): integral definida, numérica (Simpson) con su propio ámbito.
        const [f, x, a, b] = n.args;
        if (x?.k !== "sym" || !a || !b) throw new Error("int espera (expresión, variable, a, b)");
        const inner = `s${++depth}`;
        return `F.int((_x)=>{const ${inner}=Object.assign({}, ${s}, {${JSON.stringify(x.name)}: _x}); return ${js(f, inner)};}, ${r(a)}, ${r(b)})`;
      }
      if (!JS_FN[n.fn]) throw new Error(`función no compilable «${n.fn}»`);
      return `${JS_FN[n.fn]}(${n.args.map(r).join(",")})`;
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
