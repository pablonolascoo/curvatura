import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getDictionary, hasLocale } from "@/lib/i18n";
import { getNotes } from "@/lib/notes";

export async function generateMetadata({ params }: PageProps<"/[lang]/notas">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).notes.title } : {};
}

export default async function Notes({ params }: PageProps<"/[lang]/notas">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const notes = getNotes(lang);
  return (
    <div className="mx-auto grid max-w-5xl gap-16 px-4 pb-24 pt-32 md:px-8 md:pt-40">
      <header className="grid gap-5">
        <h1 className="font-serif text-[clamp(2.6rem,6vw,4.8rem)] leading-[1.02] tracking-[-0.03em]">{t.notes.title}</h1>
        <p className="max-w-[52ch] text-lg text-muted">{t.notes.body}</p>
      </header>
      {notes.length === 0 ? (
        <p className="text-muted">{t.notes.empty}</p>
      ) : (
        <ul className="grid">
          {notes.map((n) => (
            <li key={n.slug}>
              <Link href={`/${lang}/notas/${n.slug}/`} className="group grid gap-3 border-t border-line py-10 md:grid-cols-12 md:gap-8">
                <time dateTime={n.date} className="font-mono text-sm text-muted md:col-span-3">{formatDate(n.date, lang)}</time>
                <span className="grid gap-3 md:col-span-9">
                  <span className="font-serif text-2xl tracking-[-0.02em] text-fg md:text-3xl">{n.title}</span>
                  <span className="max-w-[60ch] text-muted">{n.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
