import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LibraryBrowser } from "@/components/LibraryBrowser";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { getPapers, isOpenLicense, paperHref } from "@/lib/library";

export async function generateMetadata({ params }: PageProps<"/[lang]/biblioteca">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).library.title } : {};
}

export default async function Library({ params }: PageProps<"/[lang]/biblioteca">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const papers = getPapers();
  const names = Object.fromEntries(t.engine.items.map((s) => [s.code, s.name]));
  const rows = [...papers].reverse().map((p) => ({
    id: p.id,
    title: p.title,
    authors: p.authors,
    year: p.year,
    venue: p.venue,
    kind: p.kind,
    subsystems: p.subsystems,
    open: isOpenLicense(p),
    href: paperHref(lang, p.id),
  }));
  return (
    <div className="mx-auto grid max-w-[1400px] gap-16 px-4 pb-24 pt-36 md:px-8 md:pt-44">
      <header className="grid max-w-3xl gap-5">
        <h1 className="text-[clamp(2.6rem,6vw,5.5rem)] font-medium leading-[0.95] tracking-[-0.045em]">{t.library.title}</h1>
        <p className="max-w-[56ch] text-lg text-muted">{t.library.body}</p>
        <p className="font-mono text-sm text-muted">{papers.length} {t.library.count}</p>
      </header>
      <LibraryBrowser rows={rows} labels={t.library} names={names} />
    </div>
  );
}
