import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccountPanel } from "@/components/AccountPanel";
import { PageHero } from "@/components/PageHero";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { alternates } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/cuenta">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).account.title, alternates: alternates(lang, "cuenta/"), robots: { index: false } } : {};
}

export default async function Account({ params }: PageProps<"/[lang]/cuenta">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <>
      <PageHero title={t.account.title} body={t.account.body} />
      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-5xl"><AccountPanel lang={lang} l={t.account} /></div>
      </section>
    </>
  );
}
