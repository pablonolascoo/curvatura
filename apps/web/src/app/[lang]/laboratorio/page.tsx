import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  return (
    <div className="mx-auto grid max-w-6xl gap-14 px-4 pb-24 pt-32 md:px-8 md:pt-40">
      <header className="grid max-w-3xl gap-5">
        <h1 className="font-serif text-[clamp(2.6rem,6vw,4.8rem)] leading-[1.02] tracking-[-0.03em]">{t.lab.title}</h1>
        <p className="max-w-[60ch] text-lg text-muted">{t.lab.body}</p>
      </header>
      <CoreLab lang={lang} labels={{ ...t.lab, velocity: t.metric.velocity, radius: t.metric.radius, wall: t.metric.wall }} />
      <PythonLab labels={t.lab} />
      <FormulaLab lang={lang} labels={t.lab} />
    </div>
  );
}
