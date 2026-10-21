import { type Node, bin, call, neg, num } from "./ast";

const isNum = (n: Node, v?: number) => n.k === "num" && (v === undefined || n.v === v);

/** Simplificación algebraica ligera: plegado de constantes e identidades neutras. */
export function simplify(n: Node): Node {
  switch (n.k) {
    case "num": case "sym": return n;
    case "neg": {
      const a = simplify(n.a);
      if (a.k === "num") return num(-a.v);
      if (a.k === "neg") return a.a;
      return neg(a);
    }
    case "call": return { ...n, args: n.args.map(simplify) };
    case "eq": return { ...n, a: simplify(n.a), b: simplify(n.b) };
    case "bin": {
      const a = simplify(n.a), b = simplify(n.b);
      if (a.k === "num" && b.k === "num") {
        const v = { "+": a.v + b.v, "-": a.v - b.v, "*": a.v * b.v, "/": a.v / b.v, "^": a.v ** b.v }[n.op];
        if (Number.isFinite(v)) return num(v);
      }
      switch (n.op) {
        case "+": if (isNum(a, 0)) return b; if (isNum(b, 0)) return a; if (b.k === "neg") return simplify(bin("-", a, b.a)); break;
        case "-": if (isNum(b, 0)) return a; if (isNum(a, 0)) return simplify(neg(b)); break;
        case "*":
          if (isNum(a, 0) || isNum(b, 0)) return num(0);
          if (isNum(a, 1)) return b; if (isNum(b, 1)) return a;
          if (isNum(a, -1)) return simplify(neg(b));
          if (a.k === "neg") return simplify(neg(bin("*", a.a, b)));
          if (b.k === "neg") return simplify(neg(bin("*", a, b.a)));
          break;
        case "/": if (isNum(a, 0)) return num(0); if (isNum(b, 1)) return a; break;
        case "^": if (isNum(b, 0)) return num(1); if (isNum(b, 1)) return a; break;
      }
      return bin(n.op, a, b);
    }
  }
}

/** Derivada simbólica ∂n/∂x. Las funciones de usuario deben estar ya en línea (`inline`). */
export function diff(n: Node, x: string): Node {
  return simplify(d(n, x));
}

const OUTER: Record<string, (u: Node) => Node> = {
  sin: (u) => call("cos", u),
  cos: (u) => neg(call("sin", u)),
  tan: (u) => bin("+", num(1), bin("^", call("tan", u), num(2))),
  exp: (u) => call("exp", u),
  log: (u) => bin("/", num(1), u),
  sqrt: (u) => bin("/", num(1), bin("*", num(2), call("sqrt", u))),
  abs: (u) => bin("/", u, call("abs", u)),
  sinh: (u) => call("cosh", u),
  cosh: (u) => call("sinh", u),
  tanh: (u) => bin("^", call("sech", u), num(2)),
  sech: (u) => neg(bin("*", call("sech", u), call("tanh", u))),
  csch: (u) => neg(bin("*", call("csch", u), call("coth", u))),
  coth: (u) => neg(bin("^", call("csch", u), num(2))),
};

function d(n: Node, x: string): Node {
  switch (n.k) {
    case "num": return num(0);
    case "sym": return num(n.name === x ? 1 : 0);
    case "neg": return neg(d(n.a, x));
    case "eq": return { k: "eq", a: d(n.a, x), b: d(n.b, x) };
    case "call": {
      if (n.fn === "diff") return d(diff(n.args[0], (n.args[1] as { name: string }).name), x);
      const f = OUTER[n.fn];
      if (!f) throw new Error(`sin regla de derivación para «${n.fn}»`);
      return bin("*", f(n.args[0]), d(n.args[0], x));
    }
    case "bin": {
      const { a, b } = n, da = d(a, x), db = d(b, x);
      switch (n.op) {
        case "+": return bin("+", da, db);
        case "-": return bin("-", da, db);
        case "*": return bin("+", bin("*", da, b), bin("*", a, db));
        case "/": return bin("/", bin("-", bin("*", da, b), bin("*", a, db)), bin("^", b, num(2)));
        case "^":
          if (b.k === "num") return bin("*", bin("*", num(b.v), bin("^", a, num(b.v - 1))), da);
          return bin("*", n, bin("+", bin("*", db, call("log", a)), bin("/", bin("*", b, da), a)));
      }
    }
  }
}
