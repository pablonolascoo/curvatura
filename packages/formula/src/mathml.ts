import type { Node } from "./ast";

const GREEK: Record<string, string> = {
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", eta: "η", theta: "θ", kappa: "κ",
  lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", pi: "π", rho: "ρ", sigma: "σ", tau: "τ", phi: "φ",
  chi: "χ", psi: "ψ", omega: "ω", Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Sigma: "Σ",
  Phi: "Φ", Psi: "Ψ", Omega: "Ω", inf: "∞", hbar: "ℏ",
};
const DIFFERENTIALS = new Set(["dt", "dx", "dy", "dz", "dr", "ds"]);
const PREC: Record<string, number> = { "=": 0, "+": 1, "-": 1, "*": 2, "/": 2, neg: 3, "^": 4 };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const glyph = (s: string) => GREEK[s] ?? s;

export type MathMLOptions = {
  display?: "block" | "inline";
  /** Símbolos a resaltar (atributo data-active). */
  highlight?: Iterable<string>;
};

function symbol(name: string, hl: Set<string>): string {
  const attr = ` data-sym="${esc(name)}"${hl.has(name) ? ' data-active=""' : ""}`;
  if (DIFFERENTIALS.has(name)) return `<mrow${attr}><mi mathvariant="normal">d</mi><mi>${name[1]}</mi></mrow>`;
  // base_sub__sup → base con subíndice y superíndice (K_ij, K__ij, R__3).
  const [lower, upper] = name.split("__");
  const [base, ...sub] = lower.split("_");
  const idx = (parts: string[]) => `<mi mathvariant="italic">${esc(parts.map(glyph).join(""))}</mi>`;
  const b = `<mi${glyph(base).length > 1 ? ' mathvariant="normal"' : ""}>${esc(glyph(base))}</mi>`;
  const supParts = upper ? upper.split("_") : [];
  if (!sub.length && !supParts.length) return b.replace("<mi", `<mi${attr}`);
  if (!supParts.length) return `<msub${attr}>${b}${idx(sub)}</msub>`;
  if (!sub.length) return `<msup${attr}>${b}${idx(supParts)}</msup>`;
  return `<msubsup${attr}>${b}${idx(sub)}${idx(supParts)}</msubsup>`;
}

function prec(n: Node): number {
  if (n.k === "bin") return PREC[n.op];
  if (n.k === "neg") return PREC.neg;
  if (n.k === "eq") return PREC["="];
  return 9;
}

const paren = (s: string) => `<mrow><mo>(</mo>${s}<mo>)</mo></mrow>`;

function render(n: Node, hl: Set<string>): string {
  const sub = (c: Node, min: number, strict = false) => {
    const s = render(c, hl);
    const p = prec(c);
    return p < min || (strict && p === min) ? paren(s) : s;
  };
  switch (n.k) {
    case "num": return `<mn>${Number.isInteger(n.v) ? n.v : +n.v.toPrecision(6)}</mn>`;
    case "sym": return symbol(n.name, hl);
    case "neg": return `<mrow><mo>−</mo>${sub(n.a, PREC.neg)}</mrow>`;
    case "eq": {
      const op = { "=": "=", ">=": "≥", "<=": "≤", "~": "≈" }[n.rel ?? "="];
      return `<mrow>${render(n.a, hl)}<mo>${op}</mo>${render(n.b, hl)}</mrow>`;
    }
    case "call": {
      if (n.fn === "sqrt") return `<msqrt>${render(n.args[0], hl)}</msqrt>`;
      if (n.fn === "abs") return `<mrow><mo>|</mo>${render(n.args[0], hl)}<mo>|</mo></mrow>`;
      if (n.fn === "int") {
        const [f, x, a, b] = n.args;
        return `<mrow><msubsup><mo>∫</mo>${render(a, hl)}${render(b, hl)}</msubsup>${sub(f, PREC["*"])}<mo>&#x2062;</mo><mi mathvariant="normal">d</mi>${render(x, hl)}</mrow>`;
      }
      if (n.fn === "diff") {
        const [f, x] = n.args;
        return `<mfrac><mrow><mi mathvariant="normal">d</mi>${sub(f, 9)}</mrow><mrow><mi mathvariant="normal">d</mi>${render(x, hl)}</mrow></mfrac>`;
      }
      const name = `<mi${n.fn.length > 1 ? ' mathvariant="normal"' : ""}>${esc(n.fn)}</mi><mo>&#x2061;</mo>`;
      return `<mrow>${name}${paren(n.args.map((a) => render(a, hl)).join("<mo>,</mo>"))}</mrow>`;
    }
    case "bin":
      switch (n.op) {
        case "/": return `<mfrac>${render(n.a, hl)}${render(n.b, hl)}</mfrac>`;
        case "^": return `<msup>${sub(n.a, 9)}${render(n.b, hl)}</msup>`;
        case "*": {
          const numeric = n.a.k === "num" && n.b.k === "num";
          const op = numeric ? "<mo>·</mo>" : "<mo>&#x2062;</mo>";
          return `<mrow>${sub(n.a, PREC["*"])}${op}${sub(n.b, PREC["*"], true)}</mrow>`;
        }
        default:
          return `<mrow>${sub(n.a, PREC[n.op])}<mo>${n.op === "-" ? "−" : "+"}</mo>${sub(n.b, PREC[n.op], true)}</mrow>`;
      }
  }
}

export function toMathML(n: Node, opts: MathMLOptions = {}): string {
  const hl = new Set(opts.highlight ?? []);
  return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="${opts.display ?? "block"}">${render(n, hl)}</math>`;
}
