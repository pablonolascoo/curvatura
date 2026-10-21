import { FadeOnLeave } from "./motion";

/**
 * Cabecera «Editorial Split» de las páginas interiores (gpt-taste + minimalist-ui):
 * titular serif a la izquierda (2 líneas como máximo), visual vivo a la derecha con espacio negativo.
 */
export function PageHero({ title, body, visual, children }: { title: React.ReactNode; body: string; visual?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="relative border-b border-line">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-32 md:px-8 md:pb-24 md:pt-40 lg:grid-cols-12 lg:items-end">
        <div className={`grid gap-6 ${visual ? "lg:col-span-7" : "lg:col-span-10"}`}>
          <h1 className="reveal max-w-5xl font-serif text-[clamp(2.8rem,6vw,4.8rem)] leading-[1.02] tracking-[-0.03em]">{title}</h1>
          <p className="reveal max-w-[58ch] text-lg leading-relaxed text-muted" style={{ ["--i" as string]: 1 }}>{body}</p>
          {children && <div className="reveal" style={{ ["--i" as string]: 2 }}>{children}</div>}
        </div>
        {visual && (
          <FadeOnLeave className="lg:col-span-5">
            <div className="reveal card relative aspect-[5/4] overflow-hidden" style={{ ["--i" as string]: 2 }}>{visual}</div>
          </FadeOnLeave>
        )}
      </div>
    </header>
  );
}
