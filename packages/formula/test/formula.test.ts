import { describe, expect, test } from "bun:test";
import { FormulaSystem, compile, diff, evaluate, parse, toMathML, FormulaSyntaxError } from "../src";

describe("parser", () => {
  test("precedencia y asociatividad", () => {
    expect(evaluate(parse("2 + 3 * 4 ^ 2 ^ 0.5"), {})).toBeCloseTo(2 + 3 * 4 ** Math.SQRT2, 12);
    expect(evaluate(parse("-2^2"), {})).toBe(-4);
    expect(evaluate(parse("(1 - 2) - 3"), {})).toBe(-4);
  });
  test("errores con posición", () => {
    expect(() => parse("2 + * 3")).toThrow(FormulaSyntaxError);
    expect(() => parse("tanh(x")).toThrow(/posición/);
  });
});

describe("Alcubierre", () => {
  const sys = new FormulaSystem()
    .define("f(r) = (tanh(sigma*(r + R)) - tanh(sigma*(r - R))) / (2*tanh(sigma*R))")
    .define("rs(x, y, z) = sqrt(x^2 + y^2 + z^2)")
    .define("theta(x, y, z) = v_s * x / rs(x, y, z) * diff(f(r), r)");

  const p = { v_s: 0.5, R: 1, sigma: 4 };

  test("función de forma: 1 en el centro, 0 lejos", () => {
    const f = sys.fn("f(r)");
    expect(f({ ...p, sigma: 20, r: 0 })).toBeCloseTo(1, 12);
    expect(f({ ...p, sigma: 20, r: 5 })).toBeCloseTo(0, 12);
  });

  test("derivada simbólica = diferencia finita", () => {
    const df = sys.derivative("f(r)", "r");
    const f = sys.fn("f(r)");
    const h = 1e-6;
    for (const r of [0.3, 0.9, 1.1, 1.7]) {
      const fd = (f({ ...p, r: r + h }) - f({ ...p, r: r - h })) / (2 * h);
      expect(df({ ...p, r })).toBeCloseTo(fd, 6);
    }
  });

  test("θ: contracción delante, expansión detrás (mismo signo que physics/)", () => {
    // θ depende de r = rs(x,y,z) dentro de diff(f(r), r): se pasa r explícito.
    const th = sys.fn("theta(x, y, z)");
    const at = (x: number) => th({ ...p, x, y: 0, z: 0, r: Math.abs(x) });
    expect(at(1)).toBeLessThan(0);
    expect(at(-1)).toBeGreaterThan(0);
  });
});

describe("diff", () => {
  test("reglas básicas", () => {
    const d = compile(diff(parse("x^3 * sin(x) / exp(x)"), "x"));
    const x = 0.7;
    const ref = (3 * x ** 2 * Math.sin(x) + x ** 3 * Math.cos(x) - x ** 3 * Math.sin(x)) / Math.exp(x);
    expect(d({ x })).toBeCloseTo(ref, 12);
  });
});

describe("MathML", () => {
  test("métrica con diferenciales, griegas y subíndices", () => {
    const m = toMathML(parse("ds^2 = -dt^2 + (dx - v_s*f(r_s)*dt)^2 + dy^2 + dz^2"), { highlight: ["v_s"] });
    expect(m).toContain('<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">');
    expect(m).toContain('data-sym="v_s" data-active=""');
    expect(m).toContain('<mi mathvariant="normal">d</mi><mi>t</mi>');
    expect(toMathML(parse("sigma*R"))).toContain("σ");
  });
});
