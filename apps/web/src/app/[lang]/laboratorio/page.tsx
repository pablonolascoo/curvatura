import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MiniField } from "@/components/MiniField";
import { PageHero } from "@/components/PageHero";
import { CoreLab } from "@/components/lab/CoreLab";
import { FormulaLab } from "@/components/lab/FormulaLab";
import { PythonLab } from "@/components/lab/PythonLab";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { alternates } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/laboratorio">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).lab.title, alternates: alternates(lang, "laboratorio/") } : {};
}

export default async function Lab({ params }: PageProps<"/[lang]/laboratorio">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const chapters = [
    { id: "nucleo", title: t.lab.core, node: <CoreLab lang={lang} labels={{ ...t.lab, velocity: t.metric.velocity, radius: t.metric.radius, wall: t.metric.wall }} /> },
    { id: "python", title: t.lab.python, node: <PythonLab labels={t.lab} /> },
    { id: "formulas", title: t.lab.formula, node: <FormulaLab lang={lang} labels={t.lab} /> },
  ];
  return (
    <>
      <PageHero
        title={t.lab.title}
        body={t.lab.body}
        visual={<MiniField label={t.hero.canvas} className="absolute inset-0 h-full w-full" />}
      >
        <nav aria-label={t.lab.title} className="flex flex-wrap gap-2">
          {chapters.map((c) => (
            <a key={c.id} href={`#${c.id}`} className="rounded-md border border-line bg-surface px-3.5 py-1.5 text-sm text-fg transition-colors hover:border-line-strong">{c.title}</a>
          ))}
        </nav>
      </PageHero>
      {chapters.map((c, i) => (
        <section key={c.id} id={c.id} className={`scroll-mt-20 border-b border-line px-4 py-20 md:px-8 md:py-28 ${i % 2 ? "bg-bg-2" : ""}`}>
          <div className="reveal mx-auto max-w-6xl">{c.node}</div>
        </section>
      ))}
    </>
  );
}
