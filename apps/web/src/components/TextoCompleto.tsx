"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buscarTexto, type Fragmento } from "@/lib/buscadorTexto";

const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

function fragmento(text: string, terms: string[]): React.ReactNode {
  const t = fold(text);
  const at = Math.max(0, Math.min(...terms.map((w) => t.indexOf(w)).filter((i) => i >= 0), text.length) - 70);
  const cut = text.slice(at, at + 260).replace(/\s+/g, " ");
  if (!terms.length) return cut;
  const re = new RegExp(`(${terms.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of fold(cut).matchAll(re)) {
    out.push(cut.slice(last, m.index));
    out.push(<mark key={m.index} className="rounded-sm bg-yellow-bg text-fg">{cut.slice(m.index, m.index! + m[0].length)}</mark>);
    last = m.index! + m[0].length;
  }
  out.push(cut.slice(last));
  return <>{at > 0 && "…"}{out}…</>;
}

/** Fragmentos del texto completo (papers, ecuaciones, docs y notas) que contienen la búsqueda. */
export function TextoCompleto({ q, lang, labels, onPapers }: { q: string; lang: string; labels: { fulltextHits: string; fulltextLoading: string }; onPapers?: (ids: string[]) => void }) {
  const [res, setRes] = useState<Fragmento[] | null>(null);
  useEffect(() => {
    let vivo = true;
    setRes(null);
    buscarTexto(q).then((r) => {
      if (!vivo) return;
      setRes(r.slice(0, 6));
      onPapers?.([...new Set(r.map((x) => x.p).filter((p): p is string => !!p))]);
    }).catch((e: unknown) => {
      console.error("Búsqueda en texto completo:", e);
      if (vivo) setRes([]);
    });
    return () => { vivo = false; };
  }, [q, onPapers]);
  return (
    <section className="grid gap-3" aria-label={labels.fulltextHits} aria-busy={res === null}>
      <h3 className="text-xs uppercase tracking-[0.05em] text-muted">{labels.fulltextHits}</h3>
      {res === null ? (
        <ul className="grid gap-2 md:grid-cols-2" aria-label={labels.fulltextLoading}>
          {Array.from({ length: 4 }, (_, i) => <li key={i} className="h-24 animate-pulse rounded-xl bg-gray-bg" />)}
        </ul>
      ) : res.length > 0 ? (
        <ul className="grid gap-2 md:grid-cols-2">
          {res.map((r) => (
            <li key={r.id}>
              <Link href={r.p ? `/${lang}/biblioteca/ver/?id=${encodeURIComponent(r.p)}` : `https://github.com/pablonolascoo/curvatura/blob/main/${r.u ?? ""}`}
                className="card card-hover grid gap-1.5 p-4">
                <span className="font-mono text-xs text-muted">{r.y ?? ""} · {r.s}</span>
                <span className="text-[15px] text-fg">{r.t}</span>
                <span className="text-sm leading-relaxed text-muted">{fragmento(r.x, r.terms ?? [])}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
