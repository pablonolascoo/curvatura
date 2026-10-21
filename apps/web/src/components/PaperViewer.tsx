"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react";
import { Flags } from "./Flags";

type Paper = {
  id: string; title: string; authors: string[]; year: number; venue: string; doi: string | null; arxiv: string | null;
  source: string; license: string; subsystems: string[]; kind: string; verified: boolean; relevance: string; language: string;
  cited_by: number; abstracts: Record<string, string>; countries?: string[]; titles?: Record<string, string> | null;
};

type Labels = {
  back: string; source: string; license: string; subsystem: string; kind: string; verified: string; unverified: string;
  abstract: string; noAbstract: string; noFulltext: string; translation: string; original: string; loading: string; empty: string; country: string;
  kinds: Record<string, string>;
};

const NAMES: Record<string, string> = { es: "Español", en: "English", fr: "Français" };

/** Ficha ligera para papers sin página estática: lee /library/p/<id>.json. */
export function PaperViewer({ lang, labels }: { lang: string; labels: Labels }) {
  const [p, setP] = useState<Paper | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState(lang);

  useEffect(() => {
    const id = new URLSearchParams(location.search).get("id") ?? "";
    if (!/^[a-z0-9-]+$/.test(id)) {
      setErr(labels.empty);
      return;
    }
    fetch("/library/static-ids.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((ids: string[]) => {
        if (ids.includes(id)) location.replace(`/${lang}/biblioteca/${id}/`); // tiene página completa
      })
      .catch(() => {});
    fetch(`/library/p/${/^[a-z0-9]/.test(id) ? id[0] : "_"}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(labels.empty))))
      .then((all: Record<string, Paper>) => all[id] ?? Promise.reject(new Error(labels.empty)))
      .then((d: Paper) => {
        setP(d);
        document.title = `${d.title} · Curvatura`;
        setTab(d.abstracts[lang] ? lang : d.language);
      }, (e: Error) => setErr(e.message));
  }, [lang, labels.empty]);

  if (err) return <p className="card p-10 text-muted">{err}</p>;
  if (!p)
    return (
      <div className="grid gap-4" aria-busy="true" aria-label={labels.loading}>
        <div className="h-10 w-2/3 animate-pulse rounded-md bg-gray-bg" />
        <div className="h-40 animate-pulse rounded-md bg-gray-bg" />
      </div>
    );

  const langs = [p.language, ...["es", "en", "fr"].filter((l) => l !== p.language)].filter((l) => p.abstracts[l]);
  const meta: [string, React.ReactNode][] = [
    [labels.source, <a key="s" href={p.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-fg underline decoration-line-strong underline-offset-4">{p.arxiv ? `arXiv:${p.arxiv}` : p.doi ?? p.source}<ArrowUpRight size={14} weight="bold" aria-hidden /></a>],
    ["DOI", p.doi ? <a key="d" href={`https://doi.org/${p.doi}`} target="_blank" rel="noreferrer" className="break-all text-fg underline decoration-line-strong underline-offset-4">{p.doi}</a> : "-"],
    [labels.license, <span key="l" className="font-mono">{p.license}</span>],
    ...(p.countries?.length ? [[labels.country, <Flags key="f" codes={p.countries} lang={lang} max={6} withNames />] as [string, React.ReactNode]] : []),
    [labels.subsystem, <span key="ss" className="font-mono">{p.subsystems.join(" ")}</span>],
    [labels.kind, labels.kinds[p.kind] ?? p.kind],
    ["", <span key="v" className={`tag ${p.verified ? "tag-green" : "tag-yellow"}`}>{p.verified ? labels.verified : labels.unverified}</span>],
  ];

  return (
    <article className="grid gap-14 lg:grid-cols-12">
      <header className="grid content-start gap-8 lg:col-span-4">
        <Link href={`/${lang}/biblioteca/`} className="inline-flex w-max items-center gap-2 text-sm text-muted hover:text-fg">
          <ArrowLeft size={16} weight="bold" aria-hidden /> {labels.back}
        </Link>
        <div className="grid gap-4">
          <span className="font-mono text-sm text-muted">{p.year}</span>
          <h1 className="font-serif text-[clamp(1.9rem,3.2vw,2.6rem)] leading-[1.1] tracking-[-0.02em]">{p.titles?.[lang] ?? p.title}</h1>
          {p.titles?.[lang] && p.titles[lang] !== p.title && <p lang={p.language} className="font-serif text-lg italic text-muted">{p.title}</p>}
          <p className="text-fg-2">{p.authors.join(", ")}</p>
          <p className="text-sm text-muted">{p.venue}</p>
        </div>
        <dl className="grid gap-4 border-t border-line pt-6 text-sm">
          {meta.map(([k, v], i) => (
            <div key={i} className="grid grid-cols-3 gap-4">
              <dt className="text-muted">{k}</dt>
              <dd className="col-span-2 text-fg-2">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="card p-5 text-sm leading-relaxed text-muted">{labels.noFulltext}</p>
      </header>
      <div className="grid min-w-0 content-start gap-8 lg:col-span-8">
        {langs.length > 1 && (
          <div role="tablist" className="flex flex-wrap gap-2">
            {langs.map((l) => (
              <button key={l} role="tab" type="button" aria-selected={tab === l} onClick={() => setTab(l)}
                className={`rounded-md px-3.5 py-1.5 text-sm ${tab === l ? "bg-[var(--ink)] text-[var(--bg)]" : "border border-line bg-surface text-muted hover:text-fg"}`}>
                {NAMES[l] ?? l}
                {l === p.language && <span className="ml-2 font-mono text-[11px] opacity-70">{labels.original}</span>}
              </button>
            ))}
          </div>
        )}
        {tab !== p.language && p.abstracts[tab] && <p className="text-sm text-muted">{labels.translation}</p>}
        <section className="grid gap-4">
          <h2 className="text-xs uppercase tracking-[0.05em] text-muted">{labels.abstract}</h2>
          {p.abstracts[tab] ? <p className="prose-paper text-lg text-fg">{p.abstracts[tab]}</p> : <p className="text-muted">{labels.noAbstract}</p>}
        </section>
      </div>
    </article>
  );
}
