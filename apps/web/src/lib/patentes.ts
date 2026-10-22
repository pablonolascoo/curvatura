import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { banderaOficina, type Patente } from "./patentesComun";

const DIR = path.resolve(process.cwd(), "../../library/patentes");

type Fila = { numero: string; titulo: string; fecha: string; fecha_prioridad?: string; inventores?: string[]; titular?: string; oficina?: string;
  paises_prioridad?: string[]; estado?: string; cpc?: string[]; palabras?: string[]; cita_a?: number; citada_por?: number; relevancia: number; url: string; resumen?: string };

let cache: Patente[] | null = null;

/** Patentes de library/patentes/indice.yaml, de la más reciente a la más antigua (igual que patentes.json). */
export function getPatentes(): Patente[] {
  if (cache) return cache;
  const f = path.join(DIR, "indice.yaml");
  if (!existsSync(f)) return (cache = []);
  const tf = path.join(DIR, "titulos.yaml");
  const trad = existsSync(tf) ? ((YAML.parse(readFileSync(tf, "utf8")) as Record<string, { es?: string; fr?: string }>) ?? {}) : {};
  cache = ((YAML.parse(readFileSync(f, "utf8")) as Fila[]) ?? []).map((x) => ({
    n: x.numero, t: x.titulo, te: trad[x.numero]?.es ?? null, tf: trad[x.numero]?.fr ?? null, y: x.fecha, yp: x.fecha_prioridad || null,
    i: x.inventores ?? [], h: x.titular || null, o: (x.oficina || x.numero.slice(0, 2)).toUpperCase(), pp: x.paises_prioridad ?? [], e: x.estado || null,
    cpc: x.cpc ?? [], k: x.palabras ?? [], ca: x.cita_a ?? 0, cp: x.citada_por ?? 0, r: x.relevancia, u: x.url,
    ue: `https://worldwide.espacenet.com/patent/search?q=pn%3D${encodeURIComponent(x.numero)}`, ab: x.resumen || null,
  }));
  return cache;
}

/** Resumen para portadas: total, oficinas (con bandera) y la fecha más reciente. */
export function resumenPatentes() {
  const ps = getPatentes();
  const oficinas = new Map<string, number>();
  for (const p of ps) oficinas.set(p.o, (oficinas.get(p.o) ?? 0) + 1);
  return {
    total: ps.length,
    oficinas: [...oficinas.entries()].sort((a, b) => b[1] - a[1]).map(([o, n]) => ({ o, n, bandera: banderaOficina(o) })),
    ultima: ps[0]?.y ?? null,
  };
}
