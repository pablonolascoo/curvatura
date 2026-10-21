import { parse, toMathML } from "@curvatura/formula";

type Props = { expr: string; display?: "block" | "inline"; highlight?: string[]; className?: string };

/** Fórmula en el DSL de @curvatura/formula renderizada a MathML nativo. */
export function Formula({ expr, display = "block", highlight, className }: Props) {
  const html = toMathML(parse(expr), { display, highlight });
  return <span translate="no" className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
