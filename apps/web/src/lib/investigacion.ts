import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { Locale } from "./i18n";
import { getConstants, getEquations } from "./equations";

export type EstadoPieza = "viva" | "conflicto" | "lejana" | "teorica";
export type Investigacion = {
  fecha: string;
  camino: { titulo: string; texto: string; piezas: { nombre: string; estado: EstadoPieza; cifra: string; siguiente: string; informe: string }[] };
  leyes: { titulo: string; texto: string; informe: string }[];
  descartadas: string[];
  objeciones: string[];
  experimentos: string[];
};

/** Estado de la investigación (docs/investigacion/soluciones.md) localizado para la web. */
export function getInvestigacion(lang: Locale): Investigacion {
  const f = path.resolve(process.cwd(), "content/investigacion", `${lang}.yaml`);
  return YAML.parse(readFileSync(f, "utf8")) as Investigacion;
}

export const INFORME_URL = (id: string) => `https://github.com/pablonolascoo/curvatura/blob/main/docs/investigacion/ideas/${id}.md`;

/** Ecuaciones del proyecto en forma compacta para la herramienta de cálculo del agente. */
export type EcuacionAgente = { id: string; paper: string; titulo: string; resultado: string; unidad: string; entradas: Record<string, { min: number; max: number; defecto: number; unidad: string }> };

export function getEcuacionesAgente(lang: Locale): { ecuaciones: EcuacionAgente[]; constantes: Record<string, number> } {
  const ecuaciones = getEquations()
    .filter((e) => e.compute)
    .map((e) => ({
      id: e.id,
      paper: e.paper,
      titulo: e.title[lang] ?? e.title.es,
      resultado: e.compute!.result,
      unidad: e.compute!.unit,
      entradas: Object.fromEntries(Object.entries(e.compute!.inputs).map(([k, v]) => [k, { min: v.min, max: v.max, defecto: v.default, unidad: v.unit }])),
    }));
  return { ecuaciones, constantes: getConstants() };
}
