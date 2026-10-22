#!/usr/bin/env bun
/**
 * Prepara los datos estáticos de la biblioteca para la web:
 *   public/library/<id>/figures/   figuras de los papers con licencia abierta
 *   public/library/index.json      listado completo (lo carga el buscador de la biblioteca)
 *   public/library/patentes.json   patentes relacionadas (datos bibliográficos y resumen oficial)
 *   public/search/chunks.json      fragmentos del índice RAG (búsqueda en el texto completo de la biblioteca)
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
// Fichas agrupadas por la inicial del id (≈36 archivos en vez de miles: límite de archivos de Workers).
const shards = new Map<string, Record<string, unknown>>();
const shardOf = (id: string) => (/^[a-z0-9]/.test(id) ? id[0] : "_");

let figs = 0;
const rows: unknown[] = [];
const usedFlags = new Set<string>();
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
  // Sin resumen publicable: resumen propio escrito con IA a partir de fuentes públicas (resumen.<lang>.md).
  let propio = false;
  if (!Object.keys(abstracts).length) {
    for (const f of readdirSync(dir)) {
      const mm = /^resumen\.([a-z]{2})\.md$/.exec(f);
      if (mm) { abstracts[mm[1]] = readFileSync(path.join(dir, f), "utf8").trim(); propio = true; }
    }
  }
  const sh = shards.get(shardOf(id)) ?? {};
  shards.set(shardOf(id), sh);
  sh[id] = ({
    id, title: m.title, authors: m.authors ?? [], year: m.year, venue: m.venue, doi: m.doi ?? null, arxiv: m.arxiv ?? null,
    source: m.source, license: m.license, subsystems: m.subsystems ?? [], kind: m.kind, verified: !!m.verified,
    relevance: m.relevance ?? "media", language: m.language ?? "en", cited_by: m.cited_by ?? 0, abstracts, propio,
    countries: m.countries ?? [], titles: existsSync(path.join(dir, "titles.yaml")) ? YAML.parse(readFileSync(path.join(dir, "titles.yaml"), "utf8")) : null,
  });
  for (const c of m.countries ?? []) usedFlags.add(String(c).toLowerCase());
  const titles = existsSync(path.join(dir, "titles.yaml")) ? YAML.parse(readFileSync(path.join(dir, "titles.yaml"), "utf8")) : null;
  rows.push({
    te: titles?.es ?? null,
    tf: titles?.fr ?? null,
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
    f: m.countries ?? [],
  });
}
// Patentes (ia/curvatura_ia/patentes.py): de la más reciente a la más antigua, con su oficina y su país de prioridad.
// WO (OMPI) y EP (Oficina Europea) no son países: se muestran con la bandera de la ONU y de la UE.
const OFICINA_BANDERA: Record<string, string> = { WO: "un", EP: "eu", EA: "eu" };
const patentesFile = path.join(REPO, "library/patentes/indice.yaml");
const titulosPat = path.join(REPO, "library/patentes/titulos.yaml");
if (existsSync(patentesFile)) {
  type Pat = { numero: string; titulo: string; fecha: string; fecha_prioridad?: string; inventores?: string[]; titular?: string; oficina?: string;
    paises_prioridad?: string[]; estado?: string; cpc?: string[]; palabras?: string[]; cita_a?: number; citada_por?: number; relevancia: number; url: string; resumen?: string };
  const lista = (YAML.parse(readFileSync(patentesFile, "utf8")) as Pat[]) ?? [];
  const trad = existsSync(titulosPat) ? (YAML.parse(readFileSync(titulosPat, "utf8")) as Record<string, { es?: string; fr?: string }>) ?? {} : {};
  const bandera = (c: string) => OFICINA_BANDERA[c] ?? c.toLowerCase();
  const pats = lista.map((x) => {
    const of = (x.oficina || x.numero.slice(0, 2)).toUpperCase();
    for (const c of [of, ...(x.paises_prioridad ?? [])]) usedFlags.add(bandera(c));
    return {
      n: x.numero, t: x.titulo, te: trad[x.numero]?.es ?? null, tf: trad[x.numero]?.fr ?? null,
      y: x.fecha, yp: x.fecha_prioridad || null, i: x.inventores ?? [], h: x.titular || null,
      o: of, pp: x.paises_prioridad ?? [], e: x.estado || null, cpc: x.cpc ?? [], k: x.palabras ?? [],
      ca: x.cita_a ?? 0, cp: x.citada_por ?? 0, r: x.relevancia, u: x.url,
      ue: `https://worldwide.espacenet.com/patent/search?q=pn%3D${encodeURIComponent(x.numero)}`, ab: x.resumen || null,
    };
  });
  writeFileSync(path.join(PUB, "library/patentes.json"), JSON.stringify(pats));
}

// Banderas circulares (flag-icons, MIT): solo las de los países presentes.
const FLAGS = path.join(path.dirname(require.resolve("flag-icons/package.json")), "flags/1x1");
rmSync(path.join(PUB, "flags"), { recursive: true, force: true });
mkdirSync(path.join(PUB, "flags"), { recursive: true });
for (const c of usedFlags) if (existsSync(path.join(FLAGS, `${c}.svg`))) cpSync(path.join(FLAGS, `${c}.svg`), path.join(PUB, "flags", `${c}.svg`));
for (const [k, v] of shards) writeFileSync(path.join(PUB, "library/p", `${k}.json`), JSON.stringify(v));
writeFileSync(path.join(PUB, "library/index.json"), JSON.stringify(rows));
writeFileSync(path.join(PUB, "library/static-ids.json"), JSON.stringify(staticIds));

// Mapa semántico 3D (ia/curvatura_ia/mapa.py): versión compacta para el navegador, con vecinos por índice.
const mapaFile = path.join(REPO, "library/index/mapa.json");
if (existsSync(mapaFile)) {
  const m = JSON.parse(readFileSync(mapaFile, "utf8")) as {
    modelo: string; grupos: { id: number; nombre: string; n: number }[];
    puntos: { id: string; x: number; y: number; z: number; g: number; v: string[] }[];
  };
  const nombresFile = path.join(REPO, "library/index/mapa-grupos.json");
  const curados = existsSync(nombresFile)
    ? (JSON.parse(readFileSync(nombresFile, "utf8")).grupos as { id: number; clave: string; es: string; en: string; fr: string }[])
    : [];
  const idx = new Map(m.puntos.map((pt, i) => [pt.id, i]));
  const grupos = m.grupos.map((g) => {
    const c = curados.find((x) => x.id === g.id && x.clave === g.nombre);
    return { id: g.id, n: g.n, es: c?.es ?? g.nombre, en: c?.en ?? g.nombre, fr: c?.fr ?? g.nombre };
  });
  writeFileSync(path.join(PUB, "library/mapa.json"), JSON.stringify({
    modelo: m.modelo, grupos, ids: m.puntos.map((pt) => pt.id),
    p: m.puntos.flatMap((pt) => [pt.x, pt.y, pt.z]), g: m.puntos.map((pt) => pt.g),
    v: m.puntos.map((pt) => pt.v.map((id) => idx.get(id) ?? -1).filter((i) => i >= 0)),
  }));
}

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

// ── SEO, GEO y AEO: sitemap, robots y llms.txt ───────────────────────────────
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://curvatura.consultora-bim.workers.dev").replace(/\/$/, "");
const LANGS = ["es", "en", "fr"];
const today = new Date().toISOString().slice(0, 10);
const pages = ["", "ecuaciones/", "laboratorio/", "biblioteca/", "prototipo/", "notas/"];
const notes = existsSync(path.join(import.meta.dir, "../content/notas"))
  ? [...new Set(readdirSync(path.join(import.meta.dir, "../content/notas")).map((f) => f.replace(/\.(es|en|fr)\.md$/, "")))]
  : [];
const urls = [
  ...pages.map((p) => ({ p, pri: p === "" ? "1.0" : "0.8" })),
  ...notes.map((n) => ({ p: `notas/${n}/`, pri: "0.6" })),
  ...staticIds.map((id) => ({ p: `biblioteca/${id}/`, pri: "0.5" })),
];
const xml = urls
  .map(({ p, pri }) =>
    LANGS.map((l) =>
      `<url><loc>${SITE}/${l}/${p}</loc><lastmod>${today}</lastmod><priority>${pri}</priority>` +
      LANGS.map((a) => `<xhtml:link rel="alternate" hreflang="${a}" href="${SITE}/${a}/${p}"/>`).join("") +
      `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/es/${p}"/></url>`).join(""))
  .join("\n");
writeFileSync(path.join(PUB, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${xml}\n</urlset>\n`);
writeFileSync(path.join(PUB, "robots.txt"), [
  "# Contenido abierto para investigación: buscadores y asistentes de IA son bienvenidos.",
  "User-agent: *", "Allow: /", "Disallow: /pyodide/", "",
  ...["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot"].flatMap((b) => [`User-agent: ${b}`, "Allow: /", ""]),
  `Sitemap: ${SITE}/sitemap.xml`, "",
].join("\n"));

const readYaml = (f: string) => YAML.parse(readFileSync(f, "utf8"));
const eqDir = path.join(REPO, "library/equations");
const eqs = readdirSync(eqDir).filter((f) => f.endsWith(".yaml") && f !== "constants.yaml").map((f) => readYaml(path.join(eqDir, f)));
const obst = existsSync(path.join(import.meta.dir, "../content/obstaculos/en.yaml")) ? readYaml(path.join(import.meta.dir, "../content/obstaculos/en.yaml")) as { id: string; title: string; status: string; summary: string; subsystem: string }[] : [];
const core = rows.filter((r) => (r as { r: number }).r === 2).length;
const llms = [
  "# Curvatura",
  "",
  "> Open research programme (Spanish, English, French) to take the warp drive from general relativity to engineering. It contains a classified library of warp-drive and energy-condition papers, verified computations (Python, Rust/WebAssembly, C++), machine-readable key equations, and a synthesis of what currently prevents building a useful warp drive. Author: Pablo Nolasco. Code: PolyForm Noncommercial 1.0.0; content: CC BY-NC-SA 4.0.",
  "",
  "Key facts:",
  "- The Alcubierre metric (1994) is an exact solution but requires negative Eulerian energy density in the bubble wall: rho_E = -v_s^2 rho^2 (df/dr_s)^2 / (32 pi r_s^2) in G = c = 1.",
  "- Total energy reduces to E = -(v_s^2/12) ∫ r^2 f'(r)^2 dr ≈ -v_s^2 R^2 sigma / 36 for thin walls (reproduced in Python, C++, Rust and the web engine: E = -0.223342 for v = 1, R = 1, sigma = 8).",
  "- Generic warp drives violate the null energy condition (Santiago, Schuster & Visser 2022). Only subluminal, positive-energy, massive, constant-velocity shells are currently supported (Fuchs et al. 2024: 2.365 Jupiter masses between R1 = 10 m and R2 = 20 m).",
  `- Library: ${rows.length} papers from arXiv and the OpenAlex citation graph, ${core} of core relevance; full text only for CC BY / CC0 papers.`,
  "",
  "## Main pages",
  ...LANGS.map((l) => `- [Home (${l})](${SITE}/${l}/): overview, live metric, nine subsystems, obstacles, roadmap`),
  `- [Key equations](${SITE}/en/ecuaciones/): animated, computable equations with their source paper`,
  `- [Lab](${SITE}/en/laboratorio/): Rust/WebAssembly core, Python (Pyodide) and formula engine in the browser`,
  `- [Library](${SITE}/en/biblioteca/): searchable, classified paper library`,
  `- [AI search](${SITE}/en/biblioteca/): semantic 3D map of the library and full-text search with exact citations`,
  `- [Prototype](${SITE}/en/prototipo/): engineering breakdown of the tabletop demonstrator and the conceptual vehicle`,
  "",
  "## What prevents building a warp drive",
  ...obst.map((o) => `- ${o.title} (${o.subsystem}, ${o.status}): ${o.summary}`),
  "",
  "## Key equations",
  ...eqs.map((e: { id: string; title: { en: string }; expr: string; paper: string }) => `- ${e.title.en}: \`${e.expr}\` (source: ${SITE}/en/biblioteca/${e.paper}/)`),
  "",
  "## Optional",
  `- [Sitemap](${SITE}/sitemap.xml)`,
  "- [Source code](https://github.com/pablonolascoo/curvatura)",
  "",
].join("\n");
writeFileSync(path.join(PUB, "llms.txt"), llms);

console.log(`sync-library: ${rows.length} papers (${staticIds.length} con página estática), figuras de ${figs}, paquete Python copiado`);
