import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { SearchPanel } from "@/components/SearchPanel";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { alternates } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/buscar">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).search.title, alternates: alternates(lang, "buscar/") } : {};
}

export default async function Search({ params }: PageProps<"/[lang]/buscar">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const kinds = { all: t.library.all, paper: t.library.title, equation: t.nav.equations, doc: "Docs", note: t.nav.notes };
  return (
    <>
      <PageHero title={t.search.title} body={t.search.body} />
      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-5xl">
          <SearchPanel lang={lang} labels={t.search} kinds={kinds} />
        </div>
      </section>
    </>
  );
}
