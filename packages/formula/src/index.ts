export * from "./ast";
export { parse, FormulaSyntaxError } from "./parse";
export { define, inline, type Definition, type Definitions } from "./system";
export { diff, simplify } from "./diff";
export { compile, evaluate, type Compiled, type Scope } from "./compile";
export { toMathML, type MathMLOptions } from "./mathml";

import { compile } from "./compile";
import { diff } from "./diff";
import { parse } from "./parse";
import { define, inline, type Definitions } from "./system";

/** Sistema de fórmulas: definiciones con nombre, compilación y derivadas bajo demanda. */
export class FormulaSystem {
  readonly defs: Definitions = {};

  define(src: string): this {
    const [name, d] = define(src);
    this.defs[name] = d;
    return this;
  }

  expr(src: string) {
    return inline(parse(src), this.defs);
  }

  fn(src: string) {
    return compile(this.expr(src));
  }

  derivative(src: string, x: string) {
    return compile(diff(this.expr(src), x));
  }
}
