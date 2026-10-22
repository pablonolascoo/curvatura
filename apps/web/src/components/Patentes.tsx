"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { cuandoOcioso, getJSON } from "@/lib/datos";
import { claveEstado, nombreOficina, type Patente } from "@/lib/patentesComun";
import { TarjetaPatente, type PatLabels } from "./TarjetaPatente";

export type PatentesLabels = PatLabels & {
  search: string; office: string; all: string; status: string; sort: string; recent: string; cited: string; relevant: string;
  more: string; empty: string; loading: string; error: string; count: string;
};

const URL_PATENTES = "/library/patentes.json";
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Listado de patentes con búsqueda, filtro por oficina y estado, y orden. Se carga al acercarse a la pantalla. */
export function Patentes({ lang, labels }: { lang: string; labels: PatentesLabels }) {
  const [datos, setDatos] = useState<Patente[] | null>(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState("");
  const [oficina, setOficina] = useState("");
  const [estado, setEstado] = useState("");
  const [orden, setOrden] = useState<"recent" | "cited" | "relevant">("recent");
  const [n, setN] = useState(12);
  const caja = useRef<HTMLDivElement>(null);
  const dq = useDeferredValue(q);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    let hecho = false;
    const cargar = () => {
      if (hecho) return;
      hecho = true;
      io.disconnect();
      getJSON<Patente[]>(URL_PATENTES).then(setDatos).catch((err: unknown) => { console.error("Patentes:", err); setError(true); });
    };
    // Al acercarse a la pantalla o, si no, en cuanto el navegador esté ocioso.
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) cargar(); }, { rootMargin: "100% 0px" });
    io.observe(el);
    const cancelar = cuandoOcioso(cargar, 4000);
    return () => { io.disconnect(); cancelar(); };
  }, []);

  const oficinas = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of datos ?? []) m.set(p.o, (m.get(p.o) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [datos]);

  const lista = useMemo(() => {
    const terms = fold(dq).split(/\s+/).filter(Boolean);
    const out = (datos ?? []).filter((p) => {
      if (oficina && p.o !== oficina) return false;
      if (estado && claveEstado(p.e) !== estado) return false;
      if (!terms.length) return true;
      const h = fold([p.n, p.t, p.te, p.tf, p.h, ...p.i, ...p.cpc, ...p.k, p.ab].filter(Boolean).join(" "));
      return terms.every((t) => h.includes(t));
    });
    if (orden === "cited") out.sort((a, b) => b.cp - a.cp || b.y.localeCompare(a.y));
    else if (orden === "relevant") out.sort((a, b) => b.r - a.r || b.y.localeCompare(a.y));
    return out;
  }, [datos, dq, oficina, estado, orden]);

  useEffect(() => setN(12), [dq, oficina, estado, orden]);
  const select = "rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm text-fg outline-none transition-colors hover:border-line-strong focus-visible:border-line-strong";

  return (
    <div ref={caja} className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-0 flex-1 basis-72 items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 transition-colors focus-within:border-line-strong">
          <MagnifyingGlass size={16} weight="bold" className="text-muted" aria-hidden />
          <span className="sr-only">{labels.search}</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={labels.search} className="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-muted" />
        </label>
        <label className="sr-only" htmlFor="pat-oficina">{labels.office}</label>
        <select id="pat-oficina" className={select} value={oficina} onChange={(e) => setOficina(e.target.value)}>
          <option value="">{labels.office}: {labels.all}</option>
          {oficinas.map(([o, c]) => <option key={o} value={o}>{nombreOficina(o, lang, labels.offices)} ({c})</option>)}
        </select>
        <label className="sr-only" htmlFor="pat-estado">{labels.status}</label>
        <select id="pat-estado" className={select} value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">{labels.status}: {labels.all}</option>
          {Object.entries(labels.statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <label className="sr-only" htmlFor="pat-orden">{labels.sort}</label>
        <select id="pat-orden" className={select} value={orden} onChange={(e) => setOrden(e.target.value as typeof orden)}>
          <option value="recent">{labels.recent}</option>
          <option value="cited">{labels.cited}</option>
          <option value="relevant">{labels.relevant}</option>
        </select>
      </div>

      {error ? (
        <p className="text-sm text-[var(--red)]" role="alert">{labels.error}</p>
      ) : !datos ? (
        <div className="grid gap-3 md:grid-cols-2" aria-busy="true" aria-label={labels.loading}>
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="card h-44 animate-pulse bg-bg-2" />)}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted" aria-live="polite">{lista.length} {labels.count}</p>
          {lista.length === 0 ? (
            <p className="text-muted">{labels.empty}</p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {lista.slice(0, n).map((p) => <li key={p.n}><TarjetaPatente p={p} lang={lang} labels={labels} /></li>)}
            </ul>
          )}
          {lista.length > n && (
            <button type="button" onClick={() => setN((x) => x + 24)} className="justify-self-center rounded-md border border-line px-4 py-2 text-sm text-fg transition-[border-color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-line-strong active:scale-[0.98]">
              {labels.more} ({lista.length - n})
            </button>
          )}
        </>
      )}
    </div>
  );
}
