import { type Node, bin, call, neg, num, sym } from "./ast";

type Tok = { t: "num" | "id" | "op"; v: string; at: number };

export class FormulaSyntaxError extends Error {
  constructor(message: string, public readonly at: number) {
    super(`${message} (posición ${at})`);
  }
}

function lex(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    const m = /^(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+(?:e[+-]?\d+)?)/i.exec(src.slice(i));
    if (m) { out.push({ t: "num", v: m[0], at: i }); i += m[0].length; continue; }
    const id = /^[A-Za-z][A-Za-z0-9_]*/.exec(src.slice(i));
    if (id) { out.push({ t: "id", v: id[0], at: i }); i += id[0].length; continue; }
    const two = src.slice(i, i + 2);
    if (two === ">=" || two === "<=") { out.push({ t: "op", v: two, at: i }); i += 2; continue; }
    if ("+-*/^(),=~".includes(c)) { out.push({ t: "op", v: c, at: i }); i++; continue; }
    throw new FormulaSyntaxError(`carácter inesperado «${c}»`, i);
  }
  return out;
}

/**
 * Gramática:
 *   eq      := sum (rel sum)?          rel: = >= <= ~
 *   sum     := product (('+'|'-') product)*
 *   product := unary (('*'|'/') unary)*
 *   unary   := '-' unary | power
 *   power   := atom ('^' unary)?          (asociativa por la derecha)
 *   atom    := num | id | id '(' args ')' | '(' sum ')'
 */
export function parse(src: string): Node {
  const toks = lex(src);
  let p = 0;
  const peek = () => toks[p];
  const isOp = (v: string) => peek()?.t === "op" && peek().v === v;
  const expect = (v: string) => {
    if (!isOp(v)) throw new FormulaSyntaxError(`se esperaba «${v}»`, peek()?.at ?? src.length);
    p++;
  };

  const sum = (): Node => {
    let a = product();
    while (isOp("+") || isOp("-")) { const op = toks[p++].v as "+" | "-"; a = bin(op, a, product()); }
    return a;
  };
  const product = (): Node => {
    let a = unary();
    while (isOp("*") || isOp("/")) { const op = toks[p++].v as "*" | "/"; a = bin(op, a, unary()); }
    return a;
  };
  const unary = (): Node => (isOp("-") ? (p++, neg(unary())) : power());
  const power = (): Node => {
    const a = atom();
    return isOp("^") ? (p++, bin("^", a, unary())) : a;
  };
  const atom = (): Node => {
    const t = peek();
    if (!t) throw new FormulaSyntaxError("expresión incompleta", src.length);
    if (t.t === "num") { p++; return num(Number(t.v)); }
    if (t.t === "id") {
      p++;
      if (isOp("(")) {
        p++;
        const args: Node[] = [];
        if (!isOp(")")) { args.push(sum()); while (isOp(",")) { p++; args.push(sum()); } }
        expect(")");
        return call(t.v, ...args);
      }
      return sym(t.v);
    }
    if (isOp("(")) { p++; const e = sum(); expect(")"); return e; }
    throw new FormulaSyntaxError(`token inesperado «${t.v}»`, t.at);
  };

  const left = sum();
  const REL = ["=", ">=", "<=", "~"] as const;
  const rel = REL.find((r) => isOp(r));
  const result: Node = rel ? (p++, { k: "eq", a: left, b: sum(), rel }) : left;
  if (p < toks.length) throw new FormulaSyntaxError(`sobra «${toks[p].v}»`, toks[p].at);
  return result;
}
