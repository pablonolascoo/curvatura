import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";

/** Despiece de ingeniería del prototipo (library/prototipo/prototipo.yaml), generado con IA y verificable. */
type T = { es: string; en?: string; fr?: string };
export type Pieza = {
  id: string;
  nivel: "mesa" | "vehiculo";
  nombre: T;
  funcion: T;
  estado: "calculado" | "boceto" | "abierto";
  obstaculos: number[];
  geometria: { tipo: string; radio_m?: number; dimensiones_m?: number[]; posicion_m?: number[]; color?: string };
  material?: { nombre: T; designacion?: string; composicion?: { elemento: string; porcentaje_masa: number | string }[]; por_que?: T;
    propiedades?: { nombre: string; valor: string | number; unidad?: string; fuente?: string }[] };
  electronica?: { elemento: string; especificacion?: string; por_que?: T }[];
  cableado?: { tramo: string; tipo: string; por_que?: T }[];
  cifras?: { nombre: string; valor: string | number; unidad?: string; fuente?: string }[];
  boceto?: T;
  siguiente_paso?: T;
};
export type Nivel = { id: "mesa" | "vehiculo"; nombre: T; descripcion: T };
export type Prototipo = { generado: string; niveles: Nivel[]; piezas: Pieza[] };

const FILE = path.resolve(process.cwd(), "../../library/prototipo/prototipo.yaml");

export function getPrototipo(): Prototipo | null {
  if (!existsSync(FILE)) return null;
  return YAML.parse(readFileSync(FILE, "utf8")) as Prototipo;
}

/** Texto en el idioma pedido, con el español como respaldo. */
export const tx = (t: T | undefined, lang: string) => (t ? ((t as Record<string, string>)[lang] ?? t.es) : "");
