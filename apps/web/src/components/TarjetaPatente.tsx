import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Flags } from "./Flags";
import { banderaOficina, claveEstado, nombreOficina, tituloPatente, type Patente } from "@/lib/patentesComun";

export type PatLabels = {
  inventors: string; holder: string; priority: string; published: string; citedBy: string; abstract: string; google: string; espacenet: string;
  origTitle: string; statuses: Record<string, string>; offices: Record<string, string>;
};

const TONO: Record<string, string> = { activa: "tag-green", tramite: "tag-yellow", caducada: "tag-gray", abandonada: "tag-gray", retirada: "tag-red" };

/** Ficha de una patente: oficina y país de prioridad, fechas, inventores, titular, estado, CPC, resumen y enlaces. */
export function TarjetaPatente({ p, lang, labels, resumen = true }: { p: Patente; lang: string; labels: PatLabels; resumen?: boolean }) {
  const titulo = tituloPatente(p, lang);
  const estado = claveEstado(p.e);
  const prioridad = p.pp.filter((c) => c !== p.o);
  const fecha = (d: string | null) => (d ? new Date(`${d}T00:00:00Z`).toLocaleDateString(lang, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }) : "");
  return (
    <article className="card grid content-start gap-3 p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
        <span className="flex items-center gap-2">
          <Flags codes={[banderaOficina(p.o)]} lang={lang} size={18} />
          <span className="text-fg-2">{nombreOficina(p.o, lang, labels.offices)}</span>
        </span>
        <span className="font-mono">{p.n}</span>
        {estado && <span className={`tag ${TONO[estado]} normal-case tracking-normal`}>{labels.statuses[estado]}</span>}
        <span className="ml-auto font-mono tabular-nums">{fecha(p.y)}</span>
      </div>
      <h3 className="text-[15px] leading-snug text-fg">{titulo}</h3>
      {titulo !== p.t && <p className="-mt-2 text-xs text-muted"><span className="sr-only">{labels.origTitle}: </span>{p.t}</p>}
      <dl className="grid gap-1 text-sm">
        {p.i.length > 0 && (
          <div className="flex gap-2"><dt className="shrink-0 text-muted">{labels.inventors}</dt><dd className="text-fg-2">{p.i.join(", ")}</dd></div>
        )}
        {p.h && p.h !== "Individual" && (
          <div className="flex gap-2"><dt className="shrink-0 text-muted">{labels.holder}</dt><dd className="text-fg-2">{p.h}</dd></div>
        )}
        {(p.yp || prioridad.length > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            <dt className="text-muted">{labels.priority}</dt>
            <dd className="flex items-center gap-2 text-fg-2">
              {prioridad.length > 0 && <Flags codes={prioridad.map(banderaOficina)} lang={lang} size={16} />}
              <span className="font-mono text-xs tabular-nums">{fecha(p.yp)}</span>
            </dd>
          </div>
        )}
      </dl>
      {(p.cpc.length > 0 || p.cp > 0) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {p.cpc.slice(0, 4).map((c) => <span key={c} className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted">{c}</span>)}
          {p.cp > 0 && <span className="text-xs text-muted">· {labels.citedBy.replace("{n}", String(p.cp))}</span>}
        </div>
      )}
      {resumen && p.ab && (
        <details className="group text-sm">
          <summary className="cursor-pointer list-none text-muted hover:text-fg">{labels.abstract} <span className="inline-block transition-transform duration-300 group-open:rotate-90">›</span></summary>
          <p className="mt-2 leading-relaxed text-fg-2" lang={p.o === "CN" || p.o === "JP" || p.o === "KR" ? undefined : "en"}>{p.ab}</p>
        </details>
      )}
      <div className="mt-1 flex flex-wrap gap-4 text-sm">
        <a href={p.u} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-fg underline decoration-line-strong underline-offset-4 hover:decoration-[var(--fg)]">{labels.google}<ArrowUpRight size={12} weight="bold" aria-hidden /></a>
        <a href={p.ue} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-fg-2 underline decoration-line-strong underline-offset-4 hover:text-fg">{labels.espacenet}<ArrowUpRight size={12} weight="bold" aria-hidden /></a>
      </div>
    </article>
  );
}
