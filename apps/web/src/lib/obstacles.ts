import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { Locale } from "./i18n";
import { getPaper } from "./library";

const ROOT = path.resolve(process.cwd(), "content/obstaculos");

type Raw = {
  id: string;
  subsystem: string;
  status: "bloqueante" | "abierto" | "parcial";
  title: string;
  summary: string;
  evidence: string[];
  leads: { text: string; papers: string[] }[];
};

export type Obstacle = Omit<Raw, "evidence" | "leads"> & {
  evidence: { id: string; label: string }[];
  leads: { text: string; papers: { id: string; label: string }[] }[];
};

function ref(id: string) {
  const p = getPaper(id);
  if (!p) return null; // una referencia rota se omite en la web y la marca `bun run check:obstacles`
  const a = p.authors[0]?.split(" ").at(-1) ?? id;
  return { id, label: `${a}${p.authors.length > 1 ? " et al." : ""} ${p.year}` };
}

export function getObstacles(lang: Locale): Obstacle[] {
  const f = path.join(ROOT, `${lang}.yaml`);
  const file = existsSync(f) ? f : path.join(ROOT, "es.yaml");
  if (!existsSync(file)) return [];
  const raw = (YAML.parse(readFileSync(file, "utf8")) as Raw[]) ?? [];
  return raw.map((o) => ({
    ...o,
    evidence: o.evidence.map(ref).filter((x) => !!x),
    leads: o.leads.map((l) => ({ text: l.text, papers: l.papers.map(ref).filter((x) => !!x) })),
  }));
}
