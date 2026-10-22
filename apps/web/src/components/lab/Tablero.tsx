import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Investigacion } from "@/lib/investigacion";
import { INFORME_URL } from "@/lib/investigacion";
import type { Obstacle } from "@/lib/obstacles";
import { renderTitle } from "@/lib/markdown";
import { BotonInvestigar } from "./BotonInvestigar";

export type TableroLabels = {
  title: string; body: string; path: string; obstacles: string; laws: string; discarded: string; objections: string; experiments: string;
  next: string; report: string; investigate: string; updated: string; askObstacle: string; askPiece: string; askLaw: string;
  status: Record<string, string>; piece: Record<string, string>;
};

const TONO_OBS: Record<string, string> = { bloqueante: "tag-red", abierto: "tag-yellow", parcial: "tag-green" };
const TONO_PIEZA: Record<string, string> = { viva: "tag-green", conflicto: "tag-yellow", lejana: "tag-blue", teorica: "tag-blue" };

function Informe({ id, label }: { id: string; label: string }) {
  return (
    <a href={INFORME_URL(id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted underline decoration-line-strong underline-offset-4 hover:text-fg">
      {label} {id.slice(0, 1).toUpperCase()}<ArrowUpRight size={11} weight="bold" aria-hidden />
    </a>
  );
}

export function Tablero({ inv, obstaculos, labels }: { inv: Investigacion; obstaculos: Obstacle[]; labels: TableroLabels }) {
  return (
    <div className="grid gap-16">
      <header className="grid max-w-3xl gap-3">
        <h2 className="font-serif text-3xl leading-tight tracking-[-0.02em] text-fg md:text-4xl">{labels.title}</h2>
        <p className="text-lg leading-relaxed text-fg-2">{labels.body}</p>
        <p className="text-xs text-muted">{labels.updated} {inv.fecha}</p>
      </header>

      {/* El camino que sobrevive */}
      <section className="grid gap-6" aria-labelledby="camino">
        <div className="grid max-w-3xl gap-2">
          <h3 id="camino" className="text-xs uppercase tracking-[0.05em] text-muted">{labels.path}</h3>
          <p className="font-serif text-2xl leading-snug tracking-[-0.015em] text-fg">{inv.camino.titulo}</p>
          <p className="leading-relaxed text-fg-2">{inv.camino.texto}</p>
        </div>
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {inv.camino.piezas.map((p) => (
            <li key={p.nombre} className="card grid content-start gap-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <span className={`tag ${TONO_PIEZA[p.estado]} normal-case tracking-normal`}>{labels.piece[p.estado]}</span>
                <Informe id={p.informe} label={labels.report} />
              </div>
              <p className="text-[15px] text-fg">{p.nombre}</p>
              <p className="text-sm leading-relaxed text-fg-2">{p.cifra}</p>
              {p.siguiente && <p className="text-xs leading-relaxed text-muted"><span className="text-fg-2">{labels.next}:</span> {p.siguiente}</p>}
              <BotonInvestigar label={labels.investigate} pregunta={`${labels.askPiece} «${p.nombre}». ${p.cifra} ${p.siguiente ? `${labels.next}: ${p.siguiente}` : ""}`} />
            </li>
          ))}
        </ul>
      </section>

      {/* Leyes */}
      <section className="grid gap-5" aria-labelledby="leyes">
        <h3 id="leyes" className="text-xs uppercase tracking-[0.05em] text-muted">{labels.laws}</h3>
        <ol className="grid gap-px overflow-hidden rounded-[12px] border border-line bg-[var(--line)] md:grid-cols-2 xl:grid-cols-5">
          {inv.leyes.map((l, i) => (
            <li key={l.titulo} className="grid content-start gap-2 bg-surface p-5">
              <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-[15px] text-fg">{l.titulo}</p>
              <p className="text-sm leading-relaxed text-fg-2">{l.texto}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <BotonInvestigar label={labels.investigate} pregunta={`${labels.askLaw} «${l.titulo}»: ${l.texto}`} />
                <Informe id={l.informe} label={labels.report} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Obstáculos */}
      <section className="grid gap-5" aria-labelledby="obstaculos">
        <h3 id="obstaculos" className="text-xs uppercase tracking-[0.05em] text-muted">{labels.obstacles}</h3>
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {obstaculos.map((o, i) => (
            <li key={o.id} className="card grid content-start gap-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <span className={`tag ${TONO_OBS[o.status]} normal-case tracking-normal`}>{labels.status[o.status]}</span>
                <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")} · {o.subsystem}</span>
              </div>
              <p className="text-[15px] leading-snug text-fg" dangerouslySetInnerHTML={{ __html: renderTitle(o.title) }} />
              <BotonInvestigar label={labels.investigate} pregunta={`${labels.askObstacle} «${o.title}». ${o.summary}`} />
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        {([[labels.discarded, inv.descartadas, "line-through decoration-line-strong"], [labels.objections, inv.objeciones, ""], [labels.experiments, inv.experimentos, ""]] as const).map(([t, xs, cls]) => (
          <div key={t} className="grid content-start gap-3 border-t border-line pt-5">
            <h3 className="text-xs uppercase tracking-[0.05em] text-muted">{t}</h3>
            <ul className="grid gap-2 text-sm leading-relaxed text-fg-2">
              {xs.map((x) => <li key={x} className={cls}>{x}</li>)}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
