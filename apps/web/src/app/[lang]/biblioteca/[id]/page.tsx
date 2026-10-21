import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PaperTabs, type Tab } from "@/components/PaperTabs";
import { LOCALES, LOCALE_NAMES, getDictionary, hasLocale, type Locale } from "@/lib/i18n";
import { citation, getPaper, getPapers, getVersions, isOpenLicense } from "@/lib/library";
import { renderMarkdown } from "@/lib/markdown";

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.flatMap((lang) => getPapers().map((p) => ({ lang, id: p.id })));

export async function generateMetadata({ params }: PageProps<"/[lang]/biblioteca/[id]">): Promise<Metadata> {
  const { id } = await params;
  const p = getPaper(id);
  return p ? { title: p.title, description: citation(p) } : {};
}

const NAMES: Record<string, string> = { ...LOCALE_NAMES, de: "Deutsch", it: "Italiano", ru: "Русский" };

export default async function PaperPage({ params }: PageProps<"/[lang]/biblioteca/[id]">) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();
  const p = getPaper(id);
  if (!p) notFound();
  const t = getDictionary(lang);
  const base = `/library/${p.id}`;
  const tabs: Tab[] = getVersions(p).map((v) => ({
    lang: v.lang,
    label: NAMES[v.lang] ?? v.lang,
    original: v.original,
    abstract: v.abstract ? renderMarkdown(v.abstract) : null,
    text: v.text ? renderMarkdown(v.text, base) : null,
    note: v.original ? undefined : t.library.translation,
  }));

  const meta: [string, React.ReactNode][] = [
    [t.library.source, <a key="s" href={p.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-fg underline decoration-accent underline-offset-4">{p.arxiv ? `arXiv:${p.arxiv}` : p.doi}<ArrowUpRight size={14} weight="light" aria-hidden /></a>],
    ["DOI", p.doi ? <a key="d" href={`https://doi.org/${p.doi}`} target="_blank" rel="noreferrer" className="break-all text-fg underline decoration-line-strong underline-offset-4">{p.doi}</a> : "-"],
    [t.library.license, <span key="l" className="font-mono">{p.license}</span>],
    [t.library.subsystem, <span key="ss" className="font-mono">{p.subsystems.join(" ")}</span>],
    [t.library.kind, t.library.kinds[p.kind as keyof typeof t.library.kinds] ?? p.kind],
    ["", <span key="v" className={p.verified ? "text-fg" : "text-accent"}>{p.verified ? t.library.verified : t.library.unverified}</span>],
  ];

  return (
    <article className="mx-auto grid max-w-[1400px] gap-16 px-4 pb-24 pt-36 md:px-8 md:pt-44 lg:grid-cols-12">
      <header className="grid content-start gap-8 lg:col-span-4">
        <Link href={`/${lang}/biblioteca/`} className="inline-flex w-max items-center gap-2 text-sm text-muted hover:text-fg">
          <ArrowLeft size={16} weight="light" aria-hidden /> {t.library.back}
        </Link>
        <div className="grid gap-4">
          <span className="font-mono text-sm text-muted">{p.year}</span>
          <h1 className="text-[clamp(1.9rem,3.2vw,2.8rem)] font-medium leading-[1.05] tracking-[-0.035em] text-fg">{p.title}</h1>
          <p className="text-fg-2">{p.authors.join(", ")}</p>
          <p className="text-sm text-muted">{p.venue}</p>
        </div>
        <dl className="grid gap-4 border-t border-line pt-6 text-sm">
          {meta.map(([k, v], i) => (
            <div key={i} className="grid grid-cols-3 gap-4">
              <dt className="text-muted">{k}</dt>
              <dd className="col-span-2 text-fg-2">{v}</dd>
            </div>
          ))}
        </dl>
        {!isOpenLicense(p) && <p className="rounded-[1.4rem] p-5 text-sm leading-relaxed text-muted ring-1 ring-line">{t.library.noFulltext}</p>}
      </header>
      <div className="lg:col-span-8">
        <PaperTabs tabs={tabs} initial={lang as Locale} labels={t.library} />
      </div>
    </article>
  );
}
