import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MiniField } from "@/components/MiniField";
import { PageHero } from "@/components/PageHero";
import { CoreLab } from "@/components/lab/CoreLab";
import { FormulaLab } from "@/components/lab/FormulaLab";
import { InvestigadorIA } from "@/components/lab/InvestigadorIA";
import { PythonLab } from "@/components/lab/PythonLab";
import { Tablero } from "@/components/lab/Tablero";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { getEcuacionesAgente, getInvestigacion, type Investigacion } from "@/lib/investigacion";
import { getObstacles, type Obstacle } from "@/lib/obstacles";
import { alternates } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/laboratorio">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).lab.title, description: getDictionary(lang).lab.body, alternates: alternates(lang, "laboratorio/") } : {};
}

/** Estado de la investigación en texto plano para las instrucciones del investigador IA. */
function estadoTexto(inv: Investigacion, obs: Obstacle[]): string {
  return [
    `${inv.camino.titulo}: ${inv.camino.texto}`,
    ...inv.camino.piezas.map((p) => `- ${p.nombre} [${p.estado}]: ${p.cifra}${p.siguiente ? ` Siguiente: ${p.siguiente}` : ""}`),
    "Leyes:",
    ...inv.leyes.map((l, i) => `${i + 1}. ${l.titulo}: ${l.texto}`),
    `Descartadas: ${inv.descartadas.join("; ")}.`,
    `Objeciones abiertas: ${inv.objeciones.join(" ")}`,
    "Obstáculos (id · estado · título):",
    ...obs.map((o) => `- ${o.id} · ${o.status} · ${o.title}`),
  ].join("\n");
}

export default async function Lab({ params }: PageProps<"/[lang]/laboratorio">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const inv = getInvestigacion(lang);
  const obs = getObstacles(lang);
  const { ecuaciones, constantes } = getEcuacionesAgente(lang);
  const ctx = { lang, estado: estadoTexto(inv, obs), ecuaciones, constantes };
  const nav = [
    { id: "investigador", title: t.lab.nav.ai },
    { id: "tablero", title: t.lab.nav.board },
    { id: "herramientas", title: t.lab.nav.tools },
  ];
  const tools = [
    { id: "nucleo", title: t.lab.core, node: <CoreLab lang={lang} labels={{ ...t.lab, velocity: t.metric.velocity, radius: t.metric.radius, wall: t.metric.wall }} /> },
    { id: "python", title: t.lab.python, node: <PythonLab labels={t.lab} /> },
    { id: "formulas", title: t.lab.formula, node: <FormulaLab lang={lang} labels={t.lab} /> },
  ];
  return (
    <>
      <PageHero title={t.lab.title} body={t.lab.body} visual={<MiniField label={t.hero.canvas} className="absolute inset-0 h-full w-full" />}>
        <nav aria-label={t.lab.title} className="flex flex-wrap gap-2">
          {nav.map((c) => (
            <a key={c.id} href={`#${c.id}`} className="rounded-md border border-line bg-surface px-3.5 py-1.5 text-sm text-fg transition-colors hover:border-line-strong">{c.title}</a>
          ))}
        </nav>
      </PageHero>
      <section id="investigador" className="scroll-mt-20 border-b border-line px-4 py-16 md:px-8 md:py-24">
        <div className="reveal mx-auto max-w-5xl">
          <InvestigadorIA ctx={ctx} labels={t.lab.ai} />
        </div>
      </section>
      <section id="tablero" className="scroll-mt-20 border-b border-line bg-bg-2 px-4 py-20 md:px-8 md:py-28">
        <div className="reveal mx-auto max-w-6xl">
          <Tablero inv={inv} obstaculos={obs} labels={t.lab.board} />
        </div>
      </section>
      <div id="herramientas" className="scroll-mt-20 px-4 pt-20 md:px-8 md:pt-28">
        <h2 className="mx-auto max-w-6xl font-serif text-3xl tracking-[-0.02em] text-fg md:text-4xl">{t.lab.toolsTitle}</h2>
        <nav aria-label={t.lab.toolsTitle} className="mx-auto mt-4 flex max-w-6xl flex-wrap gap-2">
          {tools.map((c) => <a key={c.id} href={`#${c.id}`} className="rounded-md border border-line bg-surface px-3 py-1 text-sm text-fg-2 transition-colors hover:border-line-strong hover:text-fg">{c.title}</a>)}
        </nav>
      </div>
      {tools.map((c, i) => (
        <section key={c.id} id={c.id} className={`scroll-mt-20 border-b border-line px-4 py-20 md:px-8 md:py-28 ${i % 2 ? "bg-bg-2" : ""}`}>
          <div className="reveal mx-auto max-w-6xl">{c.node}</div>
        </section>
      ))}
    </>
  );
}
