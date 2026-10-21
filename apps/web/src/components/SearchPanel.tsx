"use client";

import Link from "next/link";
import MiniSearch from "minisearch";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";

type Chunk = { id: string; k: string; p: string | null; t: string; y: number | null; s: string; l: string; x: string; u: string | null };
type Labels = { placeholder: string; results: string; empty: string; loading: string; title: string };

const REPO = "https://github.com/pablonolascoo/curvatura/blob/main/";
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

function snippet(text: string, terms: string[]): React.ReactNode {
  const t = fold(text);
  const at = Math.max(0, Math.min(...terms.map((w) => t.indexOf(w)).filter((i) => i >= 0), text.length) - 80);
  const cut = text.slice(at, at + 320).replace(/\s+/g, " ");
  if (!terms.length) return cut;
  const re = new RegExp(`(${terms.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const folded = fold(cut);
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of folded.matchAll(re)) {
    out.push(cut.slice(last, m.index));
    out.push(<mark key={m.index} className="rounded-sm bg-yellow-bg text-fg">{cut.slice(m.index, m.index! + m[0].length)}</mark>);
    last = m.index! + m[0].length;
  }
  out.push(cut.slice(last));
  return <>{at > 0 && "…"}{out}…</>;
}

export function SearchPanel({ lang, labels, kinds }: { lang: string; labels: Labels; kinds: Record<string, string> }) {
  const [index, setIndex] = useState<MiniSearch<Chunk> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const query = useDeferredValue(q);

  useEffect(() => {
    setQ(new URLSearchParams(location.search).get("q") ?? "");
    fetch("/search/chunks.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((chunks: Chunk[]) => {
        const ms = new MiniSearch<Chunk>({
          fields: ["t", "s", "x"],
          storeFields: ["id", "k", "p", "t", "y", "s", "l", "x", "u"],
          processTerm: (term) => (term.length > 1 ? fold(term) : null),
          searchOptions: { boost: { t: 3, s: 1.5 }, prefix: true, fuzzy: 0.15 },
        });
        ms.addAll(chunks);
        setIndex(ms);
      }, (e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    history.replaceState(null, "", `${location.pathname}${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  }, [q]);

  const results = useMemo(() => {
    if (!index || query.trim().length < 2) return [];
    const seen = new Map<string, number>();
    return index
      .search(query, { filter: (r) => !kind || r.k === kind })
      .filter((r) => {
        const key = `${r.p ?? r.id}:${r.s}`; // un fragmento por sección
        if (seen.has(key)) return false;
        seen.set(key, 1);
        return true;
      })
      .slice(0, 40) as unknown as (Chunk & { score: number; terms: string[] })[];
  }, [index, query, kind]);

  return (
    <div className="grid gap-8">
      <div className="relative max-w-2xl">
        <label htmlFor="sq" className="sr-only">{labels.title}</label>
        <MagnifyingGlass size={18} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <input id="sq" name="q" type="search" autoComplete="off" spellCheck={false} value={q} onChange={(e) => setQ(e.target.value)} placeholder={labels.placeholder}
          className="h-12 w-full rounded-md border border-line bg-surface pl-11 pr-4 text-base text-fg outline-none placeholder:text-muted focus:border-line-strong" />
      </div>
      <div className="flex flex-wrap gap-2">
        {["", "paper", "equation", "doc", "note"].map((k) => (
          <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}
            className={`rounded-md px-3 py-1.5 text-sm ${kind === k ? "bg-[var(--ink)] text-[var(--bg)]" : "border border-line bg-surface text-muted hover:text-fg"}`}>
            {kinds[k || "all"]}
          </button>
        ))}
      </div>
      {error && <p className="tag tag-red w-max">{error}</p>}
      {!index && !error && <p className="text-muted">{labels.loading}</p>}
      {index && query.trim().length >= 2 && (
        <p className="font-mono text-sm text-muted">{results.length} {labels.results}</p>
      )}
      {index && query.trim().length >= 2 && results.length === 0 && <p className="card p-8 text-muted">{labels.empty}</p>}
      <ul className="border-t border-line">
        {results.map((r) => {
          const href = r.p ? `/${lang}/biblioteca/ver/?id=${encodeURIComponent(r.p)}` : r.u ? `${REPO}${r.u}` : "#";
          const external = !r.p;
          return (
            <li key={r.id} className="border-b border-line">
              <Link href={href} target={external ? "_blank" : undefined} className="group grid gap-2 py-5">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="tag">{kinds[r.k] ?? r.k}</span>
                  {r.y && <span className="font-mono text-xs text-muted">{r.y}</span>}
                  <span className="font-mono text-xs text-muted">{r.s} · {r.l}</span>
                </span>
                <span className="text-[1.05rem] text-fg group-hover:text-fg-2">{r.t}</span>
                <span className="text-sm leading-relaxed text-muted">{snippet(r.x, r.terms ?? [])}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
