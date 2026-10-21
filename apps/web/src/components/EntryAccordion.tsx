import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

type Entry = { href: string; title: string; body: string; cta: string; code: string; tone: string };

/**
 * Acordeón horizontal: tres franjas verticales; la enfocada se abre y muestra su contenido.
 * En móvil se apilan abiertas. Solo CSS (hover y focus-within), accesible con teclado.
 */
export function EntryAccordion({ entries }: { entries: Entry[] }) {
  return (
    <div className="acc flex flex-col gap-4 md:h-[440px] md:flex-row">
      {entries.map((e, i) => (
        <Link
          key={e.href}
          href={e.href}
          className="card group relative flex min-w-0 flex-col justify-between overflow-hidden p-7 md:p-9"
        >
          <span className={`tag ${e.tone} w-max`}>{e.code}</span>
          <div className="grid gap-4">
            <h3 className="font-serif text-3xl tracking-[-0.02em] md:text-4xl">{e.title}</h3>
            <p className="acc-body max-w-[44ch] text-[15px] text-muted">
              {e.body}
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-fg">
              {e.cta}
              <ArrowRight size={15} weight="bold" aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
          <span aria-hidden className="pointer-events-none absolute right-6 top-4 font-serif text-7xl leading-none text-line transition-transform duration-700 ease-premium group-hover:-translate-y-1">{i + 1}</span>
        </Link>
      ))}
    </div>
  );
}
