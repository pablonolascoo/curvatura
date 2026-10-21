import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { LiveEquation } from "@/components/LiveEquation";
import { PaperTabs, type Tab } from "@/components/PaperTabs";
import { equationView, equationsForPaper } from "@/lib/equations";
import { LOCALES, LOCALE_NAMES, getDictionary, hasLocale, type Locale } from "@/lib/i18n";
import { citation, getPaper, getStaticIds, getVersions, isOpenLicense } from "@/lib/library";
import { renderMarkdown } from "@/lib/markdown";

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.flatMap((lang) => [...getStaticIds()].map((id) => ({ lang, id })));

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
  const eqs = equationsForPaper(p.id).map((e) => equationView(e, lang));
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
    [t.library.source, <a key="s" href={p.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-fg underline decoration-line-strong underline-offset-4">{p.arxiv ? `arXiv:${p.arxiv}` : p.doi}<ArrowUpRight size={14} weight="light" aria-hidden /></a>],
    ["DOI", p.doi ? <a key="d" href={`https://doi.org/${p.doi}`} target="_blank" rel="noreferrer" className="break-all text-fg underline decoration-line-strong underline-offset-4">{p.doi}</a> : "-"],
    [t.library.license, <span key="l" className="font-mono">{p.license}</span>],
    [t.library.subsystem, <span key="ss" className="font-mono">{p.subsystems.join(" ")}</span>],
    [t.library.kind, t.library.kinds[p.kind as keyof typeof t.library.kinds] ?? p.kind],
    ["", <span key="v" className={p.verified ? "text-fg" : "text-yellow"}>{p.verified ? t.library.verified : t.library.unverified}</span>],
  ];

  return (
    <article className="mx-auto grid max-w-6xl gap-14 px-4 pb-24 pt-32 md:px-8 md:pt-40 lg:grid-cols-12">
      <header className="grid content-start gap-8 lg:col-span-4">
        <Link href={`/${lang}/biblioteca/`} className="inline-flex w-max items-center gap-2 text-sm text-muted hover:text-fg">
          <ArrowLeft size={16} weight="light" aria-hidden /> {t.library.back}
        </Link>
        <div className="grid gap-4">
          <span className="font-mono text-sm text-muted">{p.year}</span>
          <h1 className="font-serif text-[clamp(1.9rem,3.2vw,2.6rem)] leading-[1.1] tracking-[-0.02em]">{p.title}</h1>
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
        {!isOpenLicense(p) && <p className="card p-5 text-sm leading-relaxed text-muted border border-line">{t.library.noFulltext}</p>}
      </header>
      <div className="grid content-start gap-12 lg:col-span-8">
        {eqs.length > 0 && (
          <section className="grid gap-4">
            <h2 className="text-xs uppercase tracking-[0.05em] text-muted">{t.nav.equations}</h2>
            {eqs.map((e) => (
              <LiveEquation key={e.id} eq={e} lang={lang} labels={{ result: t.equations.result, source: t.equations.source, inputs: t.equations.inputs }} />
            ))}
          </section>
        )}
        <PaperTabs tabs={tabs} initial={lang as Locale} labels={t.library} />
      </div>
    </article>
  );
}
