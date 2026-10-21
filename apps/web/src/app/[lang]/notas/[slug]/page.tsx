import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { LOCALES, formatDate, getDictionary, hasLocale } from "@/lib/i18n";
import { renderMarkdown } from "@/lib/markdown";
import { getNote, getNoteSlugs } from "@/lib/notes";

export const dynamicParams = false;
export const generateStaticParams = () =>
  LOCALES.flatMap((lang) => getNoteSlugs().filter((slug) => getNote(slug, lang)).map((slug) => ({ lang, slug })));

export async function generateMetadata({ params }: PageProps<"/[lang]/notas/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const n = hasLocale(lang) ? getNote(slug, lang) : null;
  return n ? { title: n.title, description: n.summary } : {};
}

export default async function NotePage({ params }: PageProps<"/[lang]/notas/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const n = getNote(slug, lang);
  if (!n) notFound();
  const t = getDictionary(lang);
  return (
    <article className="mx-auto grid max-w-[820px] gap-10 px-4 pb-24 pt-36 md:px-8 md:pt-44">
      <Link href={`/${lang}/notas/`} className="inline-flex w-max items-center gap-2 text-sm text-muted hover:text-fg">
        <ArrowLeft size={16} weight="light" aria-hidden /> {t.notes.back}
      </Link>
      <header className="grid gap-5">
        <time dateTime={n.date} className="font-mono text-sm text-muted">{formatDate(n.date, lang)}</time>
        <h1 className="text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[1] tracking-[-0.04em]">{n.title}</h1>
        <p className="text-lg text-muted">{n.summary}</p>
      </header>
      <div className="prose-paper" dangerouslySetInnerHTML={{ __html: renderMarkdown(n.body) }} />
    </article>
  );
}
