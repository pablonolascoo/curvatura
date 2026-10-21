export type Node =
  | { k: "num"; v: number }
  | { k: "sym"; name: string }
  | { k: "neg"; a: Node }
  | { k: "bin"; op: "+" | "-" | "*" | "/" | "^"; a: Node; b: Node }
  | { k: "call"; fn: string; args: Node[] }
  | { k: "eq"; a: Node; b: Node };

export const num = (v: number): Node => ({ k: "num", v });
export const sym = (name: string): Node => ({ k: "sym", name });
export const neg = (a: Node): Node => ({ k: "neg", a });
export const bin = (op: "+" | "-" | "*" | "/" | "^", a: Node, b: Node): Node => ({ k: "bin", op, a, b });
export const call = (fn: string, ...args: Node[]): Node => ({ k: "call", fn, args });

/** Funciones conocidas por el motor. */
export const FUNCTIONS = [
  "sin", "cos", "tan", "exp", "log", "sqrt", "abs",
  "sinh", "cosh", "tanh", "sech", "csch", "coth", "diff",
] as const;

export function symbols(n: Node, out = new Set<string>()): Set<string> {
  switch (n.k) {
    case "sym": out.add(n.name); break;
    case "neg": symbols(n.a, out); break;
    case "bin": case "eq": symbols(n.a, out); symbols(n.b, out); break;
    case "call": n.args.forEach((a) => symbols(a, out)); break;
  }
  return out;
}
