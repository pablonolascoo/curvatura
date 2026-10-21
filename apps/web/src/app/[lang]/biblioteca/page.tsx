import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LibraryBrowser } from "@/components/LibraryBrowser";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { alternates } from "@/lib/site";
import { getPapers } from "@/lib/library";

export async function generateMetadata({ params }: PageProps<"/[lang]/biblioteca">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).library.title, alternates: alternates(lang, "biblioteca/") } : {};
}

export default async function Library({ params }: PageProps<"/[lang]/biblioteca">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const names = Object.fromEntries(t.engine.items.map((s) => [s.code, s.name]));
  return (
    <div className="mx-auto grid max-w-6xl gap-14 px-4 pb-24 pt-32 md:px-8 md:pt-40">
      <header className="grid max-w-3xl gap-5">
        <h1 className="font-serif text-[clamp(2.6rem,6vw,4.8rem)] leading-[1.02] tracking-[-0.03em]">{t.library.title}</h1>
        <p className="max-w-[60ch] text-lg text-muted">{t.library.body}</p>
        <p className="font-mono text-sm text-muted">{getPapers().length} {t.library.count}</p>
      </header>
      <LibraryBrowser lang={lang} labels={t.library} names={names} />
    </div>
  );
}
