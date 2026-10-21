import Link from "next/link";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import type { Analysis } from "@/lib/library";
import { getPaper, paperHref } from "@/lib/library";
import { renderMarkdown } from "@/lib/markdown";
import type { Locale } from "@/lib/i18n";

export type AnalysisLabels = {
  title: string; ai: string; contribution: string; assumptions: string; results: string; keyEquations: string;
  limitations: string; obstacles: string; related: string; openIdeas: string; relations: Record<string, string>;
};

function Lista({ titulo, items }: { titulo: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="grid content-start gap-3">
      <h3 className="text-xs uppercase tracking-[0.05em] text-muted">{titulo}</h3>
      <ul className="grid gap-2 text-[15px] leading-relaxed text-fg-2">
        {items.map((x, i) => (
          <li key={i} className="border-l border-line pl-3">{x}</li>
        ))}
      </ul>
    </div>
  );
}

/** Ficha de análisis escrita por IA: se marca como tal y enlaza obstáculos y papers relacionados. */
export function PaperAnalysis({ a, lang, labels, obstacles }: { a: Analysis; lang: string; labels: AnalysisLabels; obstacles: string[] }) {
  const relacion = (a.relacion ?? []).map((r) => ({ ...r, p: getPaper(r.paper) })).filter((r) => r.p);
  return (
    <section className="card grid gap-8 border border-line p-6 md:p-8" aria-labelledby="analisis">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="analisis" className="font-serif text-2xl tracking-tight text-fg">{labels.title}</h2>
        <span className="tag tag-yellow inline-flex items-center gap-1.5 normal-case tracking-normal">
          <Sparkle size={12} weight="fill" aria-hidden /> {labels.ai}
        </span>
      </header>
      <p className="font-serif text-xl leading-snug text-fg">{a.aportacion}</p>
      <div className="grid gap-8 md:grid-cols-2">
        <Lista titulo={labels.assumptions} items={a.supuestos} />
        <Lista titulo={labels.results} items={a.resultados} />
        <Lista titulo={labels.limitations} items={a.limitaciones} />
        <Lista titulo={labels.openIdeas} items={a.ideas_abiertas} />
      </div>
      {a.ecuaciones_clave?.length > 0 && (
        <div className="grid gap-3">
          <h3 className="text-xs uppercase tracking-[0.05em] text-muted">{labels.keyEquations}</h3>
          <div className="grid gap-3">
            {a.ecuaciones_clave.map((e) => (
              <div key={e.n} className="grid gap-1 rounded-lg border border-line p-4">
                <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: renderMarkdown(`$$${e.latex}$$`) }} />
                <p className="text-sm text-muted"><span className="font-mono">({e.n})</span> {e.significado}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {(a.obstaculos?.length > 0 || relacion.length > 0) && (
        <div className="grid gap-6 border-t border-line pt-6 md:grid-cols-2">
          {a.obstaculos?.length > 0 && (
            <div className="grid content-start gap-3">
              <h3 className="text-xs uppercase tracking-[0.05em] text-muted">{labels.obstacles}</h3>
              <ul className="grid gap-2 text-sm">
                {a.obstaculos.filter((n) => obstacles[n - 1]).map((n) => (
                  <li key={n}>
                    <Link href={`/${lang}/#obstaculos`} className="text-fg-2 underline decoration-line-strong underline-offset-4 hover:text-fg">
                      <span className="font-mono text-muted">{n}</span> {obstacles[n - 1]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {relacion.length > 0 && (
            <div className="grid content-start gap-3">
              <h3 className="text-xs uppercase tracking-[0.05em] text-muted">{labels.related}</h3>
              <ul className="grid gap-2 text-sm">
                {relacion.map((r) => (
                  <li key={r.paper} className="flex flex-wrap items-baseline gap-2">
                    <span className="tag tag-blue normal-case tracking-normal">{labels.relations[r.como] ?? r.como}</span>
                    <Link href={paperHref(lang as Locale, r.paper)} className="text-fg-2 underline decoration-line-strong underline-offset-4 hover:text-fg">
                      {r.p!.authors[0]?.split(" ").at(-1)} {r.p!.year}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <p className="text-xs text-muted">{a.generado}</p>
    </section>
  );
}
