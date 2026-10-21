import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/PageHero";
import { formatDate, getDictionary, hasLocale } from "@/lib/i18n";
import { getNotes } from "@/lib/notes";
import { alternates } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/notas">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).notes.title, alternates: alternates(lang, "notas/") } : {};
}

export default async function Notes({ params }: PageProps<"/[lang]/notas">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const notes = getNotes(lang);
  return (
    <>
      <PageHero title={t.notes.title} body={t.notes.body} />
      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          {notes.length === 0 ? (
            <p className="card p-10 text-muted">{t.notes.empty}</p>
          ) : (
            <ul className="border-t border-line">
              {notes.map((n, i) => (
                <li key={n.slug} className="reveal" style={{ ["--i" as string]: i }}>
                  <Link href={`/${lang}/notas/${n.slug}/`} className="group grid gap-4 border-b border-line py-12 md:grid-cols-12 md:gap-8">
                    <time dateTime={n.date} className="font-mono text-sm text-muted md:col-span-3">{formatDate(n.date, lang)}</time>
                    <span className="grid gap-3 md:col-span-8">
                      <span className="font-serif text-3xl tracking-[-0.02em] text-fg md:text-4xl">{n.title}</span>
                      <span className="max-w-[60ch] text-muted">{n.summary}</span>
                    </span>
                    <ArrowUpRight size={22} weight="bold" aria-hidden className="hidden text-muted transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-fg md:col-span-1 md:block md:justify-self-end" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
