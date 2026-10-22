"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useRef, useState } from "react";
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
  const [listo, setListo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [results, setResults] = useState<(Chunk & { score: number; terms: string[] })[]>([]);
  const query = useDeferredValue(q);
  const worker = useRef<Worker | null>(null);
  const turno = useRef(0);

  // El índice se construye en un Web Worker: la página no se congela mientras se prepara.
  useEffect(() => {
    setQ(new URLSearchParams(location.search).get("q") ?? "");
    const w = new Worker(new URL("../workers/buscar.worker.ts", import.meta.url), { type: "module" });
    worker.current = w;
    w.onmessage = (e: MessageEvent) => {
      const m = e.data;
      if (m.tipo === "listo") setListo(true);
      else if (m.tipo === "error") setError(m.error);
      else if (m.tipo === "resultados" && m.n === turno.current) {
        setListo(true);
        setResults(m.res);
      }
    };
    w.postMessage({ tipo: "preparar" });
    return () => w.terminate();
  }, []);

  useEffect(() => {
    history.replaceState(null, "", `${location.pathname}${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  }, [q]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    worker.current?.postMessage({ tipo: "buscar", n: ++turno.current, q: query, kind });
  }, [query, kind]);
  const index = listo;

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
      {!index && !error && (
        <ul className="grid gap-px border-t border-line" aria-busy="true" aria-label={labels.loading}>
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="grid gap-2 border-b border-line py-5">
              <span className="h-4 w-40 animate-pulse rounded bg-gray-bg" />
              <span className="h-5 w-3/4 animate-pulse rounded bg-gray-bg" />
              <span className="h-10 w-full animate-pulse rounded bg-gray-bg" />
            </li>
          ))}
        </ul>
      )}
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
