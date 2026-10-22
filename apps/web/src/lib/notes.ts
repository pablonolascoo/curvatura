import "server-only";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { Locale } from "./i18n";

const ROOT = path.resolve(process.cwd(), "content/notas");

export type Note = { slug: string; lang: Locale; title: string; date: string; summary: string; body: string };

function parse(file: string, slug: string, lang: Locale): Note {
  // Saltos de línea de Windows (CRLF) a \n: en Windows git puede entregar los .md así.
  const src = readFileSync(file, "utf8").replace(/\r\n?/g, "\n");
  const m = /^---\n([\s\S]+?)\n---\n([\s\S]*)$/.exec(src);
  if (!m) throw new Error(`Nota sin cabecera: ${file}`);
  const fm = YAML.parse(m[1]) as { title: string; date: string; summary: string };
  return { slug, lang, title: fm.title, date: String(fm.date), summary: fm.summary, body: m[2] };
}

export function getNotes(lang: Locale): Note[] {
  if (!existsSync(ROOT)) return [];
  return readdirSync(ROOT)
    .filter((f) => f.endsWith(`.${lang}.md`))
    .map((f) => parse(path.join(ROOT, f), f.replace(`.${lang}.md`, ""), lang))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getNoteSlugs(): string[] {
  if (!existsSync(ROOT)) return [];
  return [...new Set(readdirSync(ROOT).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.(es|en|fr)\.md$/, "")))];
}

export function getNote(slug: string, lang: Locale): Note | null {
  const f = path.join(ROOT, `${slug}.${lang}.md`);
  return existsSync(f) ? parse(f, slug, lang) : null;
}
