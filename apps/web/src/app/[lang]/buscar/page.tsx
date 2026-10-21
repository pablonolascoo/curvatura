import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SearchPanel } from "@/components/SearchPanel";
import { getDictionary, hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/buscar">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).search.title } : {};
}

export default async function Search({ params }: PageProps<"/[lang]/buscar">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const kinds = { all: t.library.all, paper: t.library.title, equation: t.nav.equations, doc: "Docs", note: t.nav.notes };
  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-4 pb-24 pt-32 md:px-8 md:pt-40">
      <header className="grid max-w-3xl gap-5">
        <h1 className="font-serif text-[clamp(2.6rem,6vw,4.8rem)] leading-[1.02] tracking-[-0.03em]">{t.search.title}</h1>
        <p className="max-w-[60ch] text-lg text-muted">{t.search.body}</p>
      </header>
      <SearchPanel lang={lang} labels={t.search} kinds={kinds} />
    </div>
  );
}
