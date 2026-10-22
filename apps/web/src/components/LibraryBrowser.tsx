"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Flags } from "./Flags";
import { getJSON, INDICE_BIBLIOTECA, precargar, shardDe } from "@/lib/datos";

type Row = { st: 0 | 1; te: string | null; tf: string | null; f: string[]; id: string; t: string; a: string[]; y: number; v: string; k: string; s: string[]; o: 0 | 1; c: number; ab: 0 | 1; r: 0 | 1 | 2 };

type Labels = {
  search: string; all: string; subsystem: string; kind: string; empty: string; fulltext: string;
  kinds: Record<string, string>; count: string; relevance: string; core: string; country: string; aiTitle: string; sort: string; recent: string; cited: string; more: string; loading: string; onlyOpen: string;
};

const SUBSYSTEMS = ["G", "C", "E", "S", "D", "Q", "M", "P", "V"];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-200 ${on ? "bg-[var(--ink)] text-[var(--bg)]" : "border border-line bg-surface text-muted hover:text-fg"}`}>
      {children}
    </button>
  );
}

/** Lee y escribe los filtros en la URL (?q=&s=&k=&o=&sort=) para poder enlazarlos. */
function useUrlState() {
  const [st, setSt] = useState({ q: "", s: "", k: "", c: "", o: false, all: false, core: false, sort: "recent" as "recent" | "cited" });
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    setSt({ q: u.get("q") ?? "", s: u.get("s") ?? "", k: u.get("k") ?? "", c: u.get("c") ?? "", o: u.get("o") === "1", all: u.get("all") === "1", core: u.get("core") === "1", sort: u.get("sort") === "cited" ? "cited" : "recent" });
  }, []);
  const update = (patch: Partial<typeof st>) =>
    setSt((prev) => {
      const next = { ...prev, ...patch };
      const u = new URLSearchParams();
      if (next.q) u.set("q", next.q);
      if (next.s) u.set("s", next.s);
      if (next.k) u.set("k", next.k);
      if (next.c) u.set("c", next.c);
      if (next.o) u.set("o", "1");
      if (next.all) u.set("all", "1");
      if (next.core) u.set("core", "1");
      if (next.sort !== "recent") u.set("sort", next.sort);
      history.replaceState(null, "", `${location.pathname}${u.size ? `?${u}` : ""}`);
      return next;
    });
  return [st, update] as const;
}

export function LibraryBrowser({ lang, labels, names }: { lang: string; labels: Labels; names: Record<string, string> }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [st, set] = useUrlState();
  const query = useDeferredValue(st.q.trim().toLowerCase());

  useEffect(() => {
    getJSON<Row[]>(INDICE_BIBLIOTECA, "high").then(setRows, (e: Error) => setError(e.message));
  }, []);

  const list = useMemo(() => {
    if (!rows) return [];
    const words = query.split(/\s+/).filter(Boolean);
    return rows
      .filter((r) => (!st.s || r.s.includes(st.s)) && (!st.k || r.k === st.k) && (!st.o || r.o) && (st.all || r.r > 0) && (!st.core || r.r === 2)
        && (!st.c || r.f?.includes(st.c))
        && words.every((w) => `${r.t} ${r.te ?? ""} ${r.tf ?? ""} ${r.a.join(" ")} ${r.y} ${r.v}`.toLowerCase().includes(w)))
      .sort((a, b) => (st.sort === "cited" ? b.c - a.c || b.y - a.y : b.y - a.y || b.c - a.c));
  }, [rows, query, st]);
  const kinds = useMemo(() => [...new Set((rows ?? []).map((r) => r.k))].sort(), [rows]);
  const countries = useMemo(() => {
    const n = new Map<string, number>();
    for (const r of rows ?? []) for (const c of r.f ?? []) n.set(c, (n.get(c) ?? 0) + 1);
    return [...n.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([c]) => c);
  }, [rows]);
  const title = (r: Row) => (lang === "es" ? r.te : lang === "fr" ? r.tf : null) ?? r.t;

  return (
    <div className="grid gap-10">
      <div className="grid gap-6">
        <div className="relative max-w-xl">
          <label htmlFor="q" className="sr-only">{labels.search}</label>
          <MagnifyingGlass size={18} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input id="q" name="q" type="search" autoComplete="off" spellCheck={false} value={st.q} onChange={(e) => set({ q: e.target.value })} placeholder={labels.search}
            className="h-11 w-full rounded-md border border-line bg-surface pl-11 pr-4 text-base text-fg outline-none placeholder:text-muted focus:border-line-strong" />
        </div>
        <div className="grid gap-3">
          <span className="text-xs uppercase tracking-[0.05em] text-muted">{labels.subsystem}</span>
          <div className="flex flex-wrap gap-2">
            <Chip on={!st.s} onClick={() => set({ s: "" })}>{labels.all}</Chip>
            {SUBSYSTEMS.map((s) => (
              <Chip key={s} on={st.s === s} onClick={() => set({ s: st.s === s ? "" : s })}>
                <span className="font-mono">{s}</span> {names[s]}
              </Chip>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          <span className="text-xs uppercase tracking-[0.05em] text-muted">{labels.kind}</span>
          <div className="flex flex-wrap gap-2">
            <Chip on={!st.k} onClick={() => set({ k: "" })}>{labels.all}</Chip>
            {kinds.map((k) => (
              <Chip key={k} on={st.k === k} onClick={() => set({ k: st.k === k ? "" : k })}>{labels.kinds[k] ?? k}</Chip>
            ))}
          </div>
        </div>
        {countries.length > 0 && (
          <div className="grid gap-3">
            <span className="text-xs uppercase tracking-[0.05em] text-muted">{labels.country}</span>
            <div className="flex flex-wrap gap-2">
              <Chip on={!st.c} onClick={() => set({ c: "" })}>{labels.all}</Chip>
              {countries.map((c) => (
                <Chip key={c} on={st.c === c} onClick={() => set({ c: st.c === c ? "" : c })}>
                  <span className="inline-flex items-center gap-2"><Flags codes={[c]} lang={lang} size={16} /><span className="font-mono text-xs">{c}</span></span>
                </Chip>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-fg-2">
            <input type="checkbox" checked={st.o} onChange={(e) => set({ o: e.target.checked })} className="size-4 accent-[var(--ink)]" />
            {labels.onlyOpen}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-fg-2">
            <input type="checkbox" checked={st.core} onChange={(e) => set({ core: e.target.checked })} className="size-4 accent-[var(--ink)]" />
            {labels.core}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-fg-2">
            <input type="checkbox" checked={st.all} onChange={(e) => set({ all: e.target.checked })} className="size-4 accent-[var(--ink)]" />
            {labels.relevance}
          </label>
          <span className="flex items-center gap-2 text-muted">
            {labels.sort}
            <Chip on={st.sort === "recent"} onClick={() => set({ sort: "recent" })}>{labels.recent}</Chip>
            <Chip on={st.sort === "cited"} onClick={() => set({ sort: "cited" })}>{labels.cited}</Chip>
          </span>
          {rows && <span className="ml-auto font-mono text-muted tabular-nums">{list.length} {labels.count}</span>}
          {lang !== "en" && <span className="tag tag-yellow w-full justify-center normal-case tracking-normal sm:w-max">{labels.aiTitle}</span>}
        </div>
      </div>

      {error && <p className="tag tag-red w-max">{error}</p>}
      {!rows && !error && (
        <ul className="grid gap-px" aria-busy="true" aria-label={labels.loading}>
          {Array.from({ length: 8 }, (_, i) => <li key={i} className="h-16 animate-pulse rounded-md bg-gray-bg" />)}
        </ul>
      )}
      {rows && list.length === 0 && <p className="card p-10 text-center text-muted">{labels.empty}</p>}
      {rows && list.length > 0 && <Lista list={list} lang={lang} labels={labels} title={title} />}
    </div>
  );
}

/**
 * Lista virtualizada sobre el scroll de la ventana: solo existen en el DOM las filas visibles y un
 * margen generoso por arriba y por abajo (overscan), ya medidas y pintadas antes de entrar en pantalla.
 * Al acercar el ratón o el foco a una fila se precarga su ficha.
 */
function Lista({ list, lang, labels, title }: { list: Row[]; lang: string; labels: Labels; title: (r: Row) => string }) {
  const ul = useRef<HTMLUListElement>(null);
  const [margen, setMargen] = useState(0);
  useLayoutEffect(() => {
    const medir = () => setMargen((ul.current?.getBoundingClientRect().top ?? 0) + window.scrollY);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);
  const v = useWindowVirtualizer({ count: list.length, estimateSize: () => 96, overscan: 12, scrollMargin: margen });
  const href = (r: Row) => (r.st ? `/${lang}/biblioteca/${r.id}/` : `/${lang}/biblioteca/ver/?id=${encodeURIComponent(r.id)}`);
  const router = useRouter();
  // Al acercarse a una fila: su página (estática) o los datos de su ficha (visor) quedan cargados antes del clic.
  const pre = (r: Row) => () => (r.st ? router.prefetch(href(r)) : precargar(shardDe(r.id)));
  return (
    <ul ref={ul} className="relative border-t border-line" style={{ height: v.getTotalSize() }}>
      {v.getVirtualItems().map((it) => {
        const r = list[it.index];
        return (
          <li key={r.id} data-index={it.index} ref={v.measureElement} className="absolute inset-x-0 top-0"
            style={{ transform: `translateY(${it.start - v.options.scrollMargin}px)` }}>
            <Link href={href(r)} prefetch={false} onPointerEnter={pre(r)} onFocus={pre(r)}
              className="group grid gap-1.5 border-b border-line py-5 md:grid-cols-12 md:items-baseline md:gap-8">
              <span className="font-mono text-sm text-muted md:col-span-1">{r.y}</span>
              <span className="grid gap-1 md:col-span-8">
                <span className="text-[1.05rem] text-fg group-hover:text-fg-2">{title(r)}</span>
                <span className="flex min-w-0 items-center gap-3 text-sm text-muted">
                  <Flags codes={r.f ?? []} lang={lang} />
                  <span className="line-clamp-1">{r.a.join(", ")}</span>
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-1.5 md:col-span-3 md:justify-end">
                {r.r === 2 && <span className="tag tag-blue">{labels.core}</span>}
                {r.o === 1 && <span className="tag tag-green">{labels.fulltext}</span>}
                <span className="tag">{labels.kinds[r.k] ?? r.k}</span>
                <span className="font-mono text-xs text-muted">{r.s.join(" ")}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
