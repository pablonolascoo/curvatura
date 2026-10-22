import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Flags } from "@/components/Flags";
import { LibraryBrowser } from "@/components/LibraryBrowser";
import { Marquee } from "@/components/Marquee";
import { PageHero } from "@/components/PageHero";
import { Patentes } from "@/components/Patentes";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { topJournals } from "@/lib/journals";
import { getPapers, getTitles, isOpenLicense } from "@/lib/library";
import { resumenPatentes } from "@/lib/patentes";
import { alternates } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/biblioteca">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).library.title, alternates: alternates(lang, "biblioteca/") } : {};
}

export default async function Library({ params }: PageProps<"/[lang]/biblioteca">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const names = Object.fromEntries(t.engine.items.map((s) => [s.code, s.name]));
  const papers = getPapers();
  const core = papers.filter((p) => p.relevance === "alta").length;
  const open = papers.filter(isOpenLicense).length;
  const translated = papers.filter((p) => getTitles(p.id)).length;
  const byCountry = new Map<string, number>();
  for (const p of papers) for (const c of p.countries ?? []) byCountry.set(c, (byCountry.get(c) ?? 0) + 1);
  const top = [...byCountry.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const fmt = new Intl.NumberFormat(lang);
  const pats = resumenPatentes();
  let regionName: Intl.DisplayNames | null = null;
  try { regionName = new Intl.DisplayNames([lang], { type: "region" }); } catch { regionName = null; }

  // Bento 4 × 2: países 2×2 + núcleo 2×1 + texto completo 1×1 + traducidos 1×1 = 8 celdas.
  return (
    <>
      <PageHero
        title={t.library.title}
        body={t.library.body}
        visual={
          <div className="grid h-full content-center gap-5 p-8">
            <Flags codes={top.map(([c]) => c)} lang={lang} max={10} size={44} />
            <p className="font-mono text-[clamp(3rem,6vw,4.5rem)] leading-none tracking-[-0.05em] text-fg tabular-nums">{fmt.format(papers.length)}</p>
            <p className="text-sm text-muted">{t.library.count} · {byCountry.size} {t.library.countries}</p>
          </div>
        }
      >
        <nav aria-label={t.library.title} className="flex flex-wrap gap-2">
          <a href="#papers" className="rounded-md border border-line bg-surface px-3.5 py-1.5 text-sm text-fg transition-colors hover:border-line-strong">{t.library.count} · {fmt.format(papers.length)}</a>
          <a href="#patentes" className="rounded-md border border-line bg-surface px-3.5 py-1.5 text-sm text-fg transition-colors hover:border-line-strong">{t.patents.title} · {fmt.format(pats.total)}</a>
        </nav>
      </PageHero>
      <Marquee items={topJournals(papers.map((p) => String(p.venue ?? "")), 14)} label={t.marquee} />
      <section className="px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-6xl grid-flow-dense grid-cols-2 gap-4 md:grid-cols-4">
          <div className="reveal card col-span-2 row-span-2 grid content-start gap-4 p-7">
            <h2 className="font-serif text-2xl tracking-[-0.02em]">{t.library.byCountry}</h2>
            <ul className="grid gap-2.5">
              {top.map(([c, n]) => (
                <li key={c} className="flex items-center gap-3 text-sm">
                  <Flags codes={[c]} lang={lang} size={20} />
                  <span className="flex-1 text-fg-2">{regionName?.of(c) ?? c}</span>
                  <span className="font-mono tabular-nums text-muted">{fmt.format(n)}</span>
                </li>
              ))}
            </ul>
          </div>
          <a href="?core=1" className="reveal card card-hover col-span-2 grid content-between gap-6 bg-blue-bg/40 p-7" style={{ ["--i" as string]: 1 }}>
            <span className="tag tag-blue w-max">{t.library.core}</span>
            <span className="font-mono text-5xl tracking-[-0.04em] text-fg tabular-nums">{fmt.format(core)}</span>
          </a>
          <a href="?o=1" className="reveal card card-hover grid content-between gap-6 p-7" style={{ ["--i" as string]: 2 }}>
            <span className="tag tag-green w-max">{t.library.fulltext}</span>
            <span className="font-mono text-4xl tracking-[-0.04em] text-fg tabular-nums">{fmt.format(open)}</span>
          </a>
          <div className="reveal card grid content-between gap-6 p-7" style={{ ["--i" as string]: 3 }}>
            <span className="tag tag-yellow w-max">{t.library.translated}</span>
            <span className="font-mono text-4xl tracking-[-0.04em] text-fg tabular-nums">{fmt.format(translated)}</span>
          </div>
        </div>
      </section>
      <section id="papers" className="scroll-mt-20 border-t border-line px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <LibraryBrowser lang={lang} labels={t.library} names={names} />
        </div>
      </section>
      {pats.total > 0 && (
        <section id="patentes" className="scroll-mt-20 border-t border-line bg-bg-2 px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-10">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div className="grid max-w-3xl gap-3">
                <h2 className="font-serif text-3xl leading-tight tracking-[-0.02em] text-fg md:text-4xl">{t.patents.title}</h2>
                <p className="text-lg leading-relaxed text-fg-2">{t.patents.body}</p>
                <p className="text-xs text-muted">{t.patents.note}</p>
              </div>
              <div className="grid gap-3 justify-items-end">
                <Flags codes={pats.oficinas.map((o) => o.bandera)} lang={lang} max={8} size={28} />
                <p className="font-mono text-5xl leading-none tracking-[-0.04em] text-fg tabular-nums">{fmt.format(pats.total)}</p>
                <p className="text-sm text-muted">{t.patents.count} · {pats.oficinas.length} {t.patents.officesWord}{pats.ultima ? ` · ${t.patents.latest} ${pats.ultima}` : ""}</p>
              </div>
            </div>
            <Patentes lang={lang} labels={t.patents} />
          </div>
        </section>
      )}
    </>
  );
}
