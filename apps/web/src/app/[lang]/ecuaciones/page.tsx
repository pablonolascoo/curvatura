import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveEquation } from "@/components/LiveEquation";
import { equationView, getEquations } from "@/lib/equations";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { paperHref } from "@/lib/library";

export async function generateMetadata({ params }: PageProps<"/[lang]/ecuaciones">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).nav.equations } : {};
}

export default async function Equations({ params }: PageProps<"/[lang]/ecuaciones">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const all = getEquations().map((e) => equationView(e, lang));
  const groups = t.engine.items.map((s) => ({ ...s, eqs: all.filter((e) => e.subsystem === s.code) })).filter((g) => g.eqs.length);
  const labels = { result: t.equations.result, source: t.equations.source, inputs: t.equations.inputs };
  return (
    <div className="mx-auto grid max-w-6xl gap-16 px-4 pb-24 pt-32 md:px-8 md:pt-40">
      <header className="grid max-w-3xl gap-5">
        <h1 className="font-serif text-[clamp(2.6rem,6vw,4.8rem)] leading-[1.02] tracking-[-0.03em]">{t.equations.title}</h1>
        <p className="max-w-[62ch] text-lg text-muted">{t.equations.body}</p>
        <div className="flex flex-wrap gap-2">
          {["tag-blue", "tag-red", "tag-yellow", "tag-green"].map((c, i) => (
            <span key={c} className={`tag ${c}`}>{t.equations.groups[i]}</span>
          ))}
        </div>
      </header>
      {groups.map((g) => (
        <section key={g.code} className="grid gap-6">
          <h2 className="flex items-baseline gap-4 border-b border-line pb-3 font-serif text-2xl tracking-[-0.02em]">
            <span className="font-mono text-base text-muted">{g.code}</span>
            {g.name}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {g.eqs.map((e) => (
              <LiveEquation key={e.id} eq={e} lang={lang} labels={labels} paperHref={paperHref(lang, e.paper)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
