import Link from "next/link";
import { notFound } from "next/navigation";
import { AppleLogo, ArrowUpRight, LinuxLogo, Minus, Plus, WindowsLogo } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ButtonLink";
import { Formula } from "@/components/Formula";
import { LiveEquation } from "@/components/LiveEquation";
import { MetricLab } from "@/components/MetricLab";
import { WarpField } from "@/components/WarpField";
import { equationView, getEquation } from "@/lib/equations";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { getPapers, isOpenLicense, paperHref } from "@/lib/library";
import { getObstacles } from "@/lib/obstacles";

const RELEASES = "https://github.com/pablonolascoo/curvatura/releases/latest";

/** Tono semántico del estado de cada subsistema. */
const TONE: Record<string, string> = { G: "tag-blue", C: "tag-red", E: "tag-yellow", S: "", D: "tag-yellow", Q: "tag-red", M: "", P: "tag-blue", V: "tag-green" };

function SectionHead({ title, body, id }: { title: string; body?: string; id?: string }) {
  return (
    <div className="grid max-w-3xl gap-4">
      <h2 id={id} className="reveal font-serif text-[clamp(2.2rem,4.4vw,3.6rem)] leading-[1.08] tracking-[-0.03em]">
        {title}
      </h2>
      {body && <p className="reveal max-w-[60ch] text-lg text-muted" style={{ ["--i" as string]: 1 }}>{body}</p>}
    </div>
  );
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const papers = getPapers();
  const recent = [...papers].sort((a, b) => b.year - a.year || Number(isOpenLicense(b)) - Number(isOpenLicense(a))).slice(0, 5);
  const featured = ["alcubierre-energy-density", "alcubierre-total-energy"]
    .map((id) => getEquation(id))
    .filter((e) => !!e)
    .map((e) => equationView(e, lang));
  const obstacles = getObstacles(lang);
  const eqLabels = { result: t.equations.result, source: t.equations.source, inputs: t.equations.inputs };

  return (
    <>
      {/* Portada */}
      <section className="relative isolate overflow-hidden border-b border-line">
        <WarpField label={t.hero.canvas} offset={[1.5, 1.0]} className="absolute inset-0 -z-10 h-full w-full" />
        <div className="mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 md:px-8 md:pb-24">
          <h1 className="reveal max-w-4xl font-serif text-[clamp(3rem,7vw,6.2rem)] leading-[1.02] tracking-[-0.035em]">{t.hero.title}</h1>
          <p className="reveal mt-6 max-w-[42ch] text-lg leading-relaxed text-fg-2 md:text-xl" style={{ ["--i" as string]: 1 }}>
            {t.hero.sub}
          </p>
          <div className="reveal mt-10 flex flex-wrap gap-3" style={{ ["--i" as string]: 2 }}>
            <ButtonLink href="#motor">{t.hero.primary}</ButtonLink>
            <ButtonLink href={`/${lang}/biblioteca/`} variant="outline">
              {t.library.cta}
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Manifiesto */}
      <section className="px-4 py-24 md:px-8 md:py-32">
        <p className="reveal mx-auto max-w-4xl font-serif text-[clamp(1.5rem,2.8vw,2.3rem)] leading-[1.35] tracking-[-0.015em] text-fg">{t.manifesto}</p>
      </section>

      {/* Ecuaciones clave */}
      <section className="border-t border-line bg-bg-2 px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12">
          <SectionHead title={t.equations.title} body={t.equations.body} />
          <div className="grid gap-4 lg:grid-cols-2">
            {featured.map((e, i) => (
              <div key={e.id} className="reveal" style={{ ["--i" as string]: i }}>
                <LiveEquation eq={e} lang={lang} labels={eqLabels} paperHref={paperHref(lang, e.paper)} />
              </div>
            ))}
          </div>
          <div className="reveal">
            <ButtonLink href={`/${lang}/ecuaciones/`} variant="outline">{t.equations.all}</ButtonLink>
          </div>
        </div>
      </section>

      {/* Métrica interactiva */}
      <section id="metrica" className="scroll-mt-20 px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12">
          <div className="grid max-w-3xl gap-4">
            <span className="reveal tag tag-yellow w-max">{t.metric.eyebrow}</span>
            <SectionHead title={t.metric.title} body={t.metric.body} />
          </div>
          <div className="reveal">
            <MetricLab labels={{ ...t.metric, canvas: t.hero.canvas, contraction: t.lab.contraction, expansion: t.lab.expansion }} lang={lang} />
          </div>
        </div>
      </section>

      {/* Arquitectura: bento 3 × 4 (G ocupa 2 × 2) */}
      <section id="motor" className="scroll-mt-20 border-t border-line px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12">
          <SectionHead title={t.engine.title} body={t.engine.body} />
          <div className="grid grid-flow-dense grid-cols-1 gap-4 md:grid-cols-3">
            {t.engine.items.map((s, i) => (
              <article key={s.code} className={`reveal card flex flex-col gap-5 p-6 md:p-8 ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`} style={{ ["--i" as string]: i % 4 }}>
                <div className="flex items-start justify-between gap-4">
                  <span className={`font-mono leading-none tracking-[-0.04em] text-fg ${i === 0 ? "text-6xl" : "text-3xl"}`}>{s.code}</span>
                  <span className={`tag ${TONE[s.code]}`}>{s.state}</span>
                </div>
                <div className="grid gap-2">
                  <h3 className={`font-serif tracking-[-0.02em] ${i === 0 ? "text-3xl" : "text-xl"}`}>{s.name}</h3>
                  <p className="text-[15px] text-muted">{s.question}</p>
                </div>
                <div className={`mt-auto overflow-x-auto border-t border-line pt-5 text-fg ${i === 0 ? "text-2xl" : ""}`}>
                  <Formula expr={s.eq} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Obstáculos */}
      {obstacles.length > 0 && (
        <section id="obstaculos" className="scroll-mt-20 border-t border-line bg-bg-2 px-4 py-24 md:px-8 md:py-32">
          <div className="mx-auto grid max-w-6xl gap-12">
            <SectionHead title={t.obstacles.title} body={t.obstacles.body} />
            <ul className="border-t border-line">
              {obstacles.map((o, i) => (
                <li key={o.id} className="reveal border-b border-line" style={{ ["--i" as string]: i % 4 }}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-6 py-6 [&::-webkit-details-marker]:hidden">
                      <span className="w-6 shrink-0 font-mono text-sm text-muted">{o.subsystem}</span>
                      <span className="flex-1 font-serif text-xl tracking-[-0.015em] text-fg md:text-2xl">{o.title}</span>
                      <span className={`tag hidden sm:inline-flex ${o.status === "bloqueante" ? "tag-red" : o.status === "parcial" ? "tag-green" : "tag-yellow"}`}>
                        {t.obstacles.status[o.status as keyof typeof t.obstacles.status] ?? o.status}
                      </span>
                      <Plus size={18} weight="bold" className="shrink-0 group-open:hidden" aria-hidden />
                      <Minus size={18} weight="bold" className="hidden shrink-0 group-open:block" aria-hidden />
                    </summary>
                    <div className="grid gap-8 pb-8 pl-12 md:grid-cols-2">
                      <div className="grid content-start gap-3">
                        <p className="text-fg-2">{o.summary}</p>
                        <h4 className="mt-2 text-xs uppercase tracking-[0.05em] text-muted">{t.obstacles.evidence}</h4>
                        <ul className="grid gap-1 text-sm">
                          {o.evidence.map((p) => (
                            <li key={p.id}><Link href={paperHref(lang, p.id)} className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg">{p.label}</Link></li>
                          ))}
                        </ul>
                      </div>
                      <div className="grid content-start gap-3">
                        <h4 className="text-xs uppercase tracking-[0.05em] text-muted">{t.obstacles.leads}</h4>
                        <ul className="grid gap-3 text-sm">
                          {o.leads.map((l, k) => (
                            <li key={k} className="grid gap-1">
                              <span className="text-fg-2">{l.text}</span>
                              <span className="flex flex-wrap gap-x-3">
                                {l.papers.map((p) => (
                                  <Link key={p.id} href={paperHref(lang, p.id)} className="text-muted underline decoration-line-strong underline-offset-4 hover:text-fg">{p.label}</Link>
                                ))}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Historia: bento 6 × 3 */}
      <section className="border-t border-line px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12">
          <SectionHead title={t.history.title} />
          <div className="grid grid-flow-dense grid-cols-1 gap-4 md:grid-cols-6">
            {t.history.items.map((h, i) => {
              const span = ["md:col-span-4 md:row-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-3", "md:col-span-3"][i];
              return (
                <Link key={h.year} href={paperHref(lang, h.paper)} className={`reveal card group flex flex-col justify-between gap-10 p-6 md:p-8 ${span}`} style={{ ["--i" as string]: i }}>
                  <div className="flex items-start justify-between gap-4">
                    <span className={`font-mono tracking-[-0.04em] text-fg ${i === 0 ? "text-[clamp(3.5rem,8vw,6.5rem)] leading-[0.9]" : "text-4xl"}`}>{h.year}</span>
                    {i === 4 && <span className="tag tag-green">{h.title}</span>}
                    {i === 0 && <span className="tag tag-red">{h.title}</span>}
                  </div>
                  {i === 0 && (
                    <div className="overflow-x-auto text-xl text-fg md:text-2xl">
                      <Formula expr="ds^2 = -dt^2 + (dx - v_s*f(r_s)*dt)^2 + dy^2 + dz^2" />
                    </div>
                  )}
                  <div className="grid gap-2">
                    <h3 className="flex items-center gap-2 font-serif text-xl tracking-[-0.015em]">
                      {h.title}
                      <ArrowUpRight size={15} weight="bold" className="text-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                    </h3>
                    <p className="max-w-[48ch] text-[15px] text-muted">{h.text}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hoja de ruta */}
      <section id="ruta" className="scroll-mt-20 border-t border-line px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionHead title={t.roadmap.title} body={t.roadmap.body} />
            </div>
          </div>
          <ol className="border-t border-line lg:col-span-7">
            {t.roadmap.phases.map((p, i) => (
              <li key={p.name} className="reveal grid gap-2 border-b border-line py-6" style={{ ["--i" as string]: i % 4 }}>
                <div className="flex items-center justify-between gap-4">
                  <h3 className={`font-serif text-2xl tracking-[-0.02em] ${i < 2 ? "text-fg" : "text-fg-2"}`}>{p.name}</h3>
                  <span className={`tag ${i === 0 ? "tag-green" : i === 1 ? "tag-yellow" : ""}`}>{i === 0 ? t.roadmap.current : i === 1 ? t.roadmap.next : t.roadmap.later}</span>
                </div>
                <p className="max-w-[58ch] text-[15px] text-muted">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Biblioteca */}
      <section className="border-t border-line bg-bg-2 px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SectionHead title={t.library.title} body={t.library.body} />
            <p className="reveal font-mono text-[clamp(3rem,7vw,5.5rem)] leading-none tracking-[-0.05em] text-fg tabular-nums">{papers.length}</p>
          </div>
          <ul className="border-t border-line">
            {recent.map((p, i) => (
              <li key={p.id} className="reveal" style={{ ["--i" as string]: i }}>
                <Link href={paperHref(lang, p.id)} className="group grid gap-1 border-b border-line py-5 md:grid-cols-12 md:items-baseline md:gap-8">
                  <span className="font-mono text-sm text-muted md:col-span-1">{p.year}</span>
                  <span className="text-lg text-fg transition-colors group-hover:text-fg-2 md:col-span-8">{p.title}</span>
                  <span className="text-sm text-muted md:col-span-3 md:text-right">
                    {p.authors.length > 2 ? `${p.authors[0].split(" ").at(-1)} et al.` : p.authors.map((a) => a.split(" ").at(-1)).join(", ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="reveal flex flex-wrap gap-3">
            <ButtonLink href={`/${lang}/biblioteca/`}>{t.library.cta}</ButtonLink>
            <ButtonLink href={`/${lang}/buscar/`} variant="outline">{t.nav.search}</ButtonLink>
          </div>
        </div>
      </section>

      {/* Aplicación de escritorio */}
      <section id="descargar" className="scroll-mt-20 border-t border-line px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-end">
          <SectionHead title={t.download.title} body={t.download.body} />
          <div className="reveal grid gap-3">
            {[
              { label: t.download.mac, Icon: AppleLogo },
              { label: t.download.windows, Icon: WindowsLogo },
              { label: t.download.linux, Icon: LinuxLogo },
            ].map(({ label, Icon }) => (
              <a key={label} href={RELEASES} target="_blank" rel="noreferrer" className="card card-hover flex items-center gap-4 px-5 py-4 text-fg">
                <Icon size={22} weight="fill" aria-hidden />
                <span className="flex-1">{label}</span>
                <ArrowUpRight size={16} weight="bold" className="text-muted" aria-hidden />
              </a>
            ))}
            <p className="text-sm text-muted">{t.download.note}</p>
          </div>
        </div>
      </section>
    </>
  );
}
