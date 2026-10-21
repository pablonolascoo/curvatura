import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ButtonLink";
import { EnginePan } from "@/components/EnginePan";
import { Formula } from "@/components/Formula";
import { MetricLab } from "@/components/MetricLab";
import { ScrubText } from "@/components/ScrubText";
import { WarpField } from "@/components/WarpField";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { getPapers, isOpenLicense, paperHref } from "@/lib/library";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const papers = getPapers();
  const open = papers.filter(isOpenLicense).sort((a, b) => b.year - a.year).slice(0, 4);

  return (
    <>
      {/* Atención */}
      <section className="relative isolate min-h-[100dvh] overflow-hidden">
        <WarpField label={t.hero.canvas} offset={[1.5, 1.2]} className="absolute inset-0 -z-10 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_80%,var(--bg)_0%,transparent_55%)]" />
        <div className="mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col justify-end px-4 pb-16 pt-24 md:px-8 md:pb-24">
          <h1 className="reveal max-w-6xl text-[clamp(2.9rem,7.2vw,7rem)] font-medium leading-[0.94] tracking-[-0.05em] text-fg">
            {t.hero.title}
          </h1>
          <p className="reveal mt-6 max-w-[44ch] text-lg leading-relaxed text-fg-2 md:text-xl" style={{ ["--i" as string]: 1 }}>
            {t.hero.sub}
          </p>
          <div className="reveal mt-10 flex flex-wrap gap-3" style={{ ["--i" as string]: 2 }}>
            <ButtonLink href="#motor">{t.hero.primary}</ButtonLink>
            <ButtonLink href={`/${lang}/biblioteca/`} variant="ghost">
              {t.library.cta}
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Interés: manifiesto */}
      <section className="px-4 py-32 md:px-8 md:py-48">
        <div className="mx-auto max-w-[1100px]">
          <ScrubText text={t.manifesto} />
        </div>
      </section>

      {/* Métrica interactiva */}
      <section id="metrica" className="scroll-mt-24 px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-[1400px] gap-12">
          <div className="grid max-w-3xl gap-5">
            <span className="reveal w-max rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
              {t.metric.eyebrow}
            </span>
            <h2 className="reveal text-[clamp(2.2rem,4.6vw,4.2rem)] font-medium leading-[1] tracking-[-0.04em]">{t.metric.title}</h2>
            <p className="reveal max-w-[58ch] text-lg text-muted">{t.metric.body}</p>
          </div>
          <div className="reveal">
            <MetricLab labels={{ ...t.metric, canvas: t.hero.canvas }} />
          </div>
        </div>
      </section>

      {/* Deseo: arquitectura del motor */}
      <section id="motor" className="scroll-mt-24 pt-24 md:pt-40">
        <div className="mx-auto grid max-w-[1400px] gap-5 px-4 pb-12 md:px-8 md:pb-0">
          <h2 className="reveal text-[clamp(2.2rem,4.6vw,4.2rem)] font-medium leading-[1] tracking-[-0.04em]">{t.engine.title}</h2>
          <p className="reveal max-w-[58ch] text-lg text-muted">{t.engine.body}</p>
        </div>
        <EnginePan>
          {t.engine.items.map((s) => (
            <article key={s.code} className="rounded-[2rem] bg-fg/[0.03] p-1.5 ring-1 ring-line md:w-[min(440px,78vw)] md:shrink-0">
              <div className="flex h-full min-h-[420px] flex-col gap-6 rounded-[calc(2rem-0.375rem)] bg-surface p-7 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] md:min-h-[520px] md:p-9">
                <div className="flex items-start justify-between gap-6">
                  <span className="font-mono text-[5.5rem] leading-[0.8] tracking-[-0.06em] text-accent">{s.code}</span>
                  <span className="rounded-full px-3 py-1 text-xs text-muted ring-1 ring-line">{s.state}</span>
                </div>
                <div className="grid gap-3">
                  <h3 className="text-2xl font-medium tracking-[-0.03em] text-fg">{s.name}</h3>
                  <p className="text-[15px] leading-relaxed text-muted">{s.question}</p>
                </div>
                <div className="mt-auto overflow-x-auto border-t border-line pt-6 text-fg-2">
                  <Formula expr={s.eq} />
                </div>
              </div>
            </article>
          ))}
        </EnginePan>
      </section>

      {/* Historia: bento */}
      <section className="px-4 py-32 md:px-8 md:py-48">
        <div className="mx-auto grid max-w-[1400px] gap-12">
          <h2 className="reveal text-[clamp(2.2rem,4.6vw,4.2rem)] font-medium leading-[1] tracking-[-0.04em]">{t.history.title}</h2>
          <div className="grid grid-flow-dense grid-cols-1 gap-4 md:grid-cols-6">
            {t.history.items.map((h, i) => {
              const layout = [
                "md:col-span-4 md:row-span-2 min-h-[420px] bg-[radial-gradient(ellipse_at_75%_20%,var(--accent-soft),transparent_60%)]",
                "md:col-span-2",
                "md:col-span-2",
                "md:col-span-3",
                "md:col-span-3 bg-accent-soft",
              ][i];
              return (
                <Link
                  key={h.year}
                  href={paperHref(lang, h.paper)}
                  className={`reveal group flex flex-col justify-between gap-10 rounded-[2rem] p-7 ring-1 ring-line transition-[transform,box-shadow] duration-700 ease-premium hover:-translate-y-1 hover:shadow-[var(--shadow)] md:p-9 ${layout}`}
                  style={{ ["--i" as string]: i }}
                >
                  <span className={`font-mono tracking-[-0.04em] text-fg ${i === 0 ? "text-[clamp(4rem,9vw,8.5rem)] leading-[0.85]" : "text-5xl"}`}>{h.year}</span>
                  <div className="grid gap-2">
                    <h3 className="flex items-center gap-2 text-xl font-medium tracking-[-0.02em] text-fg">
                      {h.title}
                      <ArrowUpRight size={16} weight="light" className="transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                    </h3>
                    <p className="max-w-[46ch] text-[15px] leading-relaxed text-muted">{h.text}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hoja de ruta */}
      <section id="ruta" className="scroll-mt-24 border-t border-line px-4 py-32 md:px-8 md:py-48">
        <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="grid gap-5 lg:sticky lg:top-32">
              <h2 className="text-[clamp(2.2rem,4.6vw,4.2rem)] font-medium leading-[1] tracking-[-0.04em]">{t.roadmap.title}</h2>
              <p className="max-w-[40ch] text-lg text-muted">{t.roadmap.body}</p>
            </div>
          </div>
          <ol className="grid gap-4 lg:col-span-7">
            {t.roadmap.phases.map((p, i) => {
              const state = i === 0 ? t.roadmap.current : i === 1 ? t.roadmap.next : t.roadmap.later;
              return (
                <li key={p.name} className={`reveal grid gap-3 rounded-[1.6rem] p-7 md:p-8 ${i === 0 ? "bg-surface ring-1 ring-line-strong" : "ring-1 ring-line"}`}>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className={`text-2xl font-medium tracking-[-0.03em] ${i < 2 ? "text-fg" : "text-fg-2"}`}>{p.name}</h3>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs ${i === 0 ? "bg-accent text-bg" : "text-muted ring-1 ring-line"}`}>{state}</span>
                  </div>
                  <p className="max-w-[56ch] text-[15px] leading-relaxed text-muted">{p.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Biblioteca */}
      <section className="px-4 py-32 md:px-8 md:py-40">
        <div className="mx-auto grid max-w-[1400px] gap-12">
          <div className="grid max-w-3xl gap-5">
            <h2 className="reveal text-[clamp(2.2rem,4.6vw,4.2rem)] font-medium leading-[1] tracking-[-0.04em]">{t.library.title}</h2>
            <p className="reveal max-w-[52ch] text-lg text-muted">{t.library.body}</p>
          </div>
          <ul className="grid">
            {open.map((p, i) => (
              <li key={p.id} className="reveal" style={{ ["--i" as string]: i }}>
                <Link href={paperHref(lang, p.id)} className="group grid gap-2 border-t border-line py-8 md:grid-cols-12 md:items-baseline md:gap-8">
                  <span className="font-mono text-sm text-muted md:col-span-2">{p.year}</span>
                  <span className="text-xl font-medium tracking-[-0.02em] text-fg transition-colors duration-300 group-hover:text-accent md:col-span-7 md:text-2xl">{p.title}</span>
                  <span className="text-sm text-muted md:col-span-3 md:text-right">
                    {p.authors.length > 2 ? `${p.authors[0].split(" ").at(-1)} et al.` : p.authors.map((a) => a.split(" ").at(-1)).join(", ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="reveal flex items-center gap-6">
            <ButtonLink href={`/${lang}/biblioteca/`}>{t.library.cta}</ButtonLink>
            <span className="font-mono text-sm text-muted">
              {papers.length} {t.library.count}
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
