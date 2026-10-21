import { type Node, FUNCTIONS } from "./ast";
import { parse } from "./parse";

/** Definición de función de usuario: f(r) = cuerpo. */
export type Definition = { params: string[]; body: Node };
export type Definitions = Record<string, Definition>;

/** "f(r) = tanh(r)" → ["f", { params: ["r"], body }] */
export function define(src: string): [string, Definition] {
  const n = parse(src);
  if (n.k !== "eq" || n.a.k !== "call" || !n.a.args.every((a) => a.k === "sym")) {
    throw new Error(`definición no válida: «${src}». Forma esperada: f(x, y) = expresión`);
  }
  return [n.a.fn, { params: n.a.args.map((a) => (a as { name: string }).name), body: n.b }];
}

function substitute(n: Node, env: Record<string, Node>): Node {
  switch (n.k) {
    case "sym": return env[n.name] ?? n;
    case "num": return n;
    case "neg": return { k: "neg", a: substitute(n.a, env) };
    case "bin": return { ...n, a: substitute(n.a, env), b: substitute(n.b, env) };
    case "eq": return { ...n, a: substitute(n.a, env), b: substitute(n.b, env) };
    case "call": return { ...n, args: n.args.map((a) => substitute(a, env)) };
  }
}

/** Sustituye recursivamente las funciones de usuario por su cuerpo. */
export function inline(n: Node, defs: Definitions, depth = 0): Node {
  if (depth > 64) throw new Error("definiciones recursivas");
  switch (n.k) {
    case "num": case "sym": return n;
    case "neg": return { k: "neg", a: inline(n.a, defs, depth) };
    case "bin": case "eq": return { ...n, a: inline(n.a, defs, depth), b: inline(n.b, defs, depth) };
    case "call": {
      const args = n.args.map((a) => inline(a, defs, depth));
      const d = defs[n.fn];
      if (!d) {
        if (!(FUNCTIONS as readonly string[]).includes(n.fn)) throw new Error(`función desconocida «${n.fn}»`);
        return { ...n, args };
      }
      if (d.params.length !== args.length) throw new Error(`«${n.fn}» espera ${d.params.length} argumentos`);
      const env = Object.fromEntries(d.params.map((p, i) => [p, args[i]]));
      return inline(substitute(d.body, env), defs, depth + 1);
    }
  }
}
