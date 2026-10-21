import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Formula } from "@/components/Formula";
import { LiveEquation } from "@/components/LiveEquation";
import { PageHero } from "@/components/PageHero";
import { PinnedSplit } from "@/components/motion";
import { equationView, getEquations } from "@/lib/equations";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { paperHref } from "@/lib/library";
import { alternates } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/ecuaciones">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).nav.equations, alternates: alternates(lang, "ecuaciones/") } : {};
}

export default async function Equations({ params }: PageProps<"/[lang]/ecuaciones">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const all = getEquations().map((e) => equationView(e, lang));
  const groups = t.engine.items.map((s) => ({ ...s, eqs: all.filter((e) => e.subsystem === s.code) })).filter((g) => g.eqs.length);
  const labels = { result: t.equations.result, source: t.equations.source, inputs: t.equations.inputs };
  const [first, ...rest] = t.equations.title.split(" ");
  return (
    <>
      <PageHero
        title={
          <>
            {first}{" "}
            <span translate="no" className="mx-1 inline-flex h-[1.1em] items-center rounded-full border border-line bg-surface px-4 align-middle text-[0.4em] text-fg">
              <Formula expr="G_mu_nu = 8*pi*T_mu_nu" display="inline" />
            </span>{" "}
            {rest.join(" ")}
          </>
        }
        body={t.equations.body}
      >
        <div className="flex flex-wrap gap-2">
          {["tag-blue", "tag-red", "tag-yellow", "tag-green"].map((c, i) => (
            <span key={c} className={`tag ${c}`}>{t.equations.groups[i]}</span>
          ))}
        </div>
      </PageHero>
      {groups.map((g, i) => (
        <section key={g.code} className={`px-4 py-20 md:px-8 md:py-28 ${i % 2 ? "bg-bg-2" : ""} border-b border-line`}>
          <PinnedSplit
            className="mx-auto max-w-6xl"
            left={
              <div className="grid gap-3">
                <span className="font-mono text-6xl leading-none tracking-[-0.05em] text-fg">{g.code}</span>
                <h2 className="font-serif text-3xl tracking-[-0.02em]">{g.name}</h2>
                <p className="max-w-[36ch] text-muted">{g.question}</p>
              </div>
            }
            right={
              <div className="grid gap-4">
                {g.eqs.map((e) => (
                  <div key={e.id} className="reveal">
                    <LiveEquation eq={e} lang={lang} labels={labels} paperHref={paperHref(lang, e.paper)} />
                  </div>
                ))}
              </div>
            }
          />
        </section>
      ))}
    </>
  );
}
