"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";

export type PaperRow = {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  kind: string;
  subsystems: string[];
  open: boolean;
  href: string;
};

type Labels = { search: string; all: string; subsystem: string; kind: string; empty: string; fulltext: string; kinds: Record<string, string> };

const SUBSYSTEMS = ["G", "C", "E", "S", "D", "Q", "M", "P", "V"];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm transition-colors duration-300 ${on ? "bg-fg text-bg" : "text-muted ring-1 ring-line hover:text-fg"}`}
    >
      {children}
    </button>
  );
}

export function LibraryBrowser({ rows, labels, names }: { rows: PaperRow[]; labels: Labels; names: Record<string, string> }) {
  const [q, setQ] = useState("");
  const [sub, setSub] = useState<string | null>(null);
  const [kind, setKind] = useState<string | null>(null);
  const query = useDeferredValue(q.trim().toLowerCase());

  const list = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!sub || r.subsystems.includes(sub)) &&
          (!kind || r.kind === kind) &&
          (!query || `${r.title} ${r.authors.join(" ")} ${r.year}`.toLowerCase().includes(query)),
      ),
    [rows, sub, kind, query],
  );
  const kinds = [...new Set(rows.map((r) => r.kind))];

  return (
    <div className="grid gap-10">
      <div className="grid gap-6">
        <div className="relative max-w-xl">
          <label htmlFor="q" className="sr-only">{labels.search}</label>
          <MagnifyingGlass size={18} weight="light" className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="q"
            name="q"
            type="search"
            autoComplete="off"
            spellCheck={false}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={labels.search}
            className="h-12 w-full rounded-full bg-surface pl-12 pr-5 text-base text-fg ring-1 ring-line outline-none placeholder:text-muted focus:ring-fg/40"
          />
        </div>
        <div className="grid gap-3">
          <span className="text-sm text-muted">{labels.subsystem}</span>
          <div className="flex flex-wrap gap-2">
            <Chip on={!sub} onClick={() => setSub(null)}>{labels.all}</Chip>
            {SUBSYSTEMS.map((s) => (
              <Chip key={s} on={sub === s} onClick={() => setSub(sub === s ? null : s)}>
                <span className="font-mono">{s}</span> {names[s]}
              </Chip>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          <span className="text-sm text-muted">{labels.kind}</span>
          <div className="flex flex-wrap gap-2">
            <Chip on={!kind} onClick={() => setKind(null)}>{labels.all}</Chip>
            {kinds.map((k) => (
              <Chip key={k} on={kind === k} onClick={() => setKind(kind === k ? null : k)}>{labels.kinds[k] ?? k}</Chip>
            ))}
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="rounded-[1.6rem] p-10 text-center text-muted ring-1 ring-line">{labels.empty}</p>
      ) : (
        <ul className="grid">
          {list.map((r) => (
            <li key={r.id}>
              <Link href={r.href} className="group grid gap-2 border-t border-line py-7 md:grid-cols-12 md:items-baseline md:gap-8">
                <span className="font-mono text-sm text-muted md:col-span-1">{r.year}</span>
                <span className="grid gap-1 md:col-span-7">
                  <span className="text-lg font-medium tracking-[-0.02em] text-fg transition-colors duration-300 group-hover:text-accent md:text-xl">{r.title}</span>
                  <span className="text-sm text-muted">{r.authors.join(", ")}</span>
                </span>
                <span className="flex flex-wrap items-center gap-2 text-xs text-muted md:col-span-4 md:justify-end">
                  {r.open && <span className="rounded-full bg-accent-soft px-2.5 py-1 text-accent">{labels.fulltext}</span>}
                  <span className="rounded-full px-2.5 py-1 ring-1 ring-line">{labels.kinds[r.kind] ?? r.kind}</span>
                  <span className="font-mono">{r.subsystems.join(" ")}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
