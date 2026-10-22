import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import YAML from "yaml";
import { ejecutarHerramienta, type Contexto } from "./agente";

const DIR = new URL("../../../../library/equations/", import.meta.url).pathname;
const constantes = YAML.parse(readFileSync(DIR + "constants.yaml", "utf8")) as Record<string, number>;
const ecuaciones = readdirSync(DIR)
  .filter((f) => f.endsWith(".yaml") && f !== "constants.yaml")
  .map((f) => YAML.parse(readFileSync(DIR + f, "utf8")))
  .filter((e) => e.compute)
  .map((e) => ({ id: e.id, paper: e.paper, titulo: e.title.es, resultado: e.compute.result, unidad: e.compute.unit,
    entradas: Object.fromEntries(Object.entries(e.compute.inputs as Record<string, { min: number; max: number; default: number; unit: string }>).map(([k, v]) => [k, { min: v.min, max: v.max, defecto: v.default, unidad: v.unit }])) }));
const ctx: Contexto = { lang: "es", estado: "", ecuaciones, constantes };

test("calcular con constantes del proyecto", async () => {
  // Masa mínima de la cáscara (soluciones.md): ⅔·β·R·c²/G en masas de Júpiter, β = 0,02 y R₁ = 10 m (Fuchs 2024), sin el término de pared.
  const r = await ejecutarHerramienta("calcular", { expresion: "2/3*beta*R*c^2/G/M_J", variables: { beta: 0.02, R: 10 } }, ctx);
  expect(r).toContain("= 0.0945907");
});

test("calcular avisa de variables sin valor", async () => {
  await expect(ejecutarHerramienta("calcular", { expresion: "x*y + 1", variables: { x: 2 } }, ctx)).rejects.toThrow("y");
});

test("barrido detecta cambios de signo", async () => {
  const r = await ejecutarHerramienta("calcular", { expresion: "sin(x)", barrer: { variable: "x", desde: 0.1, hasta: 10, puntos: 400 } }, ctx);
  expect(r).toContain("cambios de signo: 3");
});

test("ecuaciones del proyecto: lista y evaluación con valores por defecto", async () => {
  expect(await ejecutarHerramienta("ecuacion_proyecto", {}, ctx)).toContain("Ecuaciones disponibles");
  for (const e of ecuaciones) {
    const r = await ejecutarHerramienta("ecuacion_proyecto", { id: e.id }, ctx);
    expect(r).toContain(e.unidad);
  }
});
