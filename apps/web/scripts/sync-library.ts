#!/usr/bin/env bun
/**
 * Prepara los datos estáticos de la biblioteca para la web:
 *   public/library/<id>/figures/   figuras de los papers con licencia abierta
 *   public/library/index.json      listado completo (lo carga el buscador de la biblioteca)
 *   public/search/chunks.json      fragmentos del índice RAG (lo carga /buscar)
 *   public/py/curvatura/           paquete Python para Pyodide (laboratorio)
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";

const REPO = path.resolve(import.meta.dir, "../../..");
const PAPERS = path.join(REPO, "library/papers");
const PUB = path.resolve(import.meta.dir, "../public");
const OPEN = new Set(["CC-BY-4.0", "CC-BY-SA-4.0", "CC0-1.0", "public-domain"]);

rmSync(path.join(PUB, "library"), { recursive: true, force: true });
mkdirSync(path.join(PUB, "library"), { recursive: true });

// Papers con ecuaciones del registro: siempre con página estática.
const eqPapers = new Set(
  readdirSync(path.join(REPO, "library/equations"))
    .filter((f) => f.endsWith(".yaml") && f !== "constants.yaml")
    .map((f) => YAML.parse(readFileSync(path.join(REPO, "library/equations", f), "utf8"))?.paper)
    .filter(Boolean),
);
const staticIds: string[] = [];
mkdirSync(path.join(PUB, "library/p"), { recursive: true });

let figs = 0;
const rows: unknown[] = [];
for (const id of readdirSync(PAPERS)) {
  const dir = path.join(PAPERS, id);
  const metaFile = path.join(dir, "meta.yaml");
  if (!existsSync(metaFile)) continue;
  const m = YAML.parse(readFileSync(metaFile, "utf8"));
  if (existsSync(path.join(dir, "figures"))) {
    cpSync(path.join(dir, "figures"), path.join(PUB, "library", id, "figures"), { recursive: true });
    figs++;
  }
  // Página estática (SEO, texto completo) solo para lo importante; el resto lo pinta el visor.
  const isStatic = m.relevance === "alta" || OPEN.has(m.license) || !m.harvest || eqPapers.has(id);
  if (isStatic) staticIds.push(id);
  const abstracts: Record<string, string> = {};
  for (const f of readdirSync(dir)) {
    const mm = /^abstract\.([a-z]{2})\.md$/.exec(f);
    if (mm) abstracts[mm[1]] = readFileSync(path.join(dir, f), "utf8").trim();
  }
  writeFileSync(path.join(PUB, "library/p", `${id}.json`), JSON.stringify({
    id, title: m.title, authors: m.authors ?? [], year: m.year, venue: m.venue, doi: m.doi ?? null, arxiv: m.arxiv ?? null,
    source: m.source, license: m.license, subsystems: m.subsystems ?? [], kind: m.kind, verified: !!m.verified,
    relevance: m.relevance ?? "media", language: m.language ?? "en", cited_by: m.cited_by ?? 0, abstracts,
  }));
  rows.push({
    st: isStatic ? 1 : 0,
    id,
    t: m.title,
    a: (m.authors ?? []).slice(0, 8),
    y: m.year,
    v: m.venue,
    k: m.kind,
    s: m.subsystems ?? [],
    o: OPEN.has(m.license) ? 1 : 0,
    c: m.cited_by ?? 0,
    ab: existsSync(path.join(dir, "abstract.en.md")) ? 1 : 0,
    r: m.relevance === "alta" ? 2 : m.relevance === "baja" ? 0 : 1,
  });
}
writeFileSync(path.join(PUB, "library/index.json"), JSON.stringify(rows));
writeFileSync(path.join(PUB, "library/static-ids.json"), JSON.stringify(staticIds));

const chunksFile = path.join(REPO, "library/index/chunks.jsonl");
mkdirSync(path.join(PUB, "search"), { recursive: true });
if (existsSync(chunksFile)) {
  const chunks = readFileSync(chunksFile, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .map((c) => ({ id: c.id, k: c.kind, p: c.paper ?? null, t: c.title, y: c.year ?? null, s: c.section, l: c.lang, x: c.text, u: c.url ?? null }));
  writeFileSync(path.join(PUB, "search/chunks.json"), JSON.stringify(chunks));
}

rmSync(path.join(PUB, "py"), { recursive: true, force: true });
cpSync(path.join(REPO, "physics/curvatura"), path.join(PUB, "py/curvatura"), {
  recursive: true,
  filter: (src) => !src.includes("__pycache__"),
});

const pyFiles: string[] = [];
const walk = (d: string, rel: string) => {
  for (const f of readdirSync(d, { withFileTypes: true })) {
    if (f.isDirectory()) walk(path.join(d, f.name), `${rel}/${f.name}`);
    else if (f.name.endsWith(".py")) pyFiles.push(`${rel}/${f.name}`);
  }
};
walk(path.join(PUB, "py/curvatura"), "curvatura");
writeFileSync(path.join(PUB, "py/manifest.json"), JSON.stringify(pyFiles));

console.log(`sync-library: ${rows.length} papers (${staticIds.length} con página estática), figuras de ${figs}, paquete Python copiado`);
