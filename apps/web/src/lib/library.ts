import "server-only";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { Locale } from "./i18n";

const ROOT = path.resolve(process.cwd(), "../../library/papers");

export type Paper = {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  doi: string | null;
  arxiv: string | null;
  source: string;
  language: string;
  subsystems: string[];
  kind: string;
  license: string;
  fulltext: boolean | "source";
  translations: string[];
  verified: boolean;
};

const OPEN = new Set(["CC-BY-4.0", "CC-BY-SA-4.0", "CC0-1.0", "public-domain"]);

let cache: Paper[] | null = null;

export function getPapers(): Paper[] {
  if (cache) return cache;
  cache = readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(path.join(ROOT, d.name, "meta.yaml")))
    .map((d) => {
      const raw = YAML.parse(readFileSync(path.join(ROOT, d.name, "meta.yaml"), "utf8")) as Paper;
      if (!raw?.id || raw.id !== d.name) throw new Error(`meta.yaml inválido en library/papers/${d.name}`);
      return { ...raw, translations: raw.translations ?? [], subsystems: raw.subsystems ?? [] };
    })
    .sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
  return cache;
}

export function getPaper(id: string): Paper | undefined {
  return getPapers().find((p) => p.id === id);
}

export const isOpenLicense = (p: Paper) => OPEN.has(p.license);

function read(id: string, file: string): string | null {
  const f = path.join(ROOT, id, file);
  return existsSync(f) ? readFileSync(f, "utf8") : null;
}

export type PaperVersion = { lang: string; original: boolean; abstract: string | null; text: string | null };

/** Versiones disponibles del paper: original primero, luego es/en/fr si existen. */
export function getVersions(p: Paper): PaperVersion[] {
  const langs = [p.language, ...(["es", "en", "fr"] as const).filter((l) => l !== p.language)];
  return langs
    .map((lang) => ({
      lang,
      original: lang === p.language,
      abstract: read(p.id, `abstract.${lang}.md`),
      text: isOpenLicense(p) ? read(p.id, `text.${lang}.md`) : null,
    }))
    .filter((v) => v.original || v.abstract || v.text);
}

export function citation(p: Paper): string {
  const a = p.authors.length > 3 ? `${p.authors[0]} et al.` : p.authors.join(", ");
  return `${a} (${p.year}). ${p.title}. ${p.venue}.${p.doi ? ` doi:${p.doi}` : ""}`;
}

export const paperHref = (lang: Locale, id: string) => `/${lang}/biblioteca/${id}/`;
