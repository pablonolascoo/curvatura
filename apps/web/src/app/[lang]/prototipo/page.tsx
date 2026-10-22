import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { PrototipoVista, type PiezaVista } from "@/components/PrototipoVista";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { getObstacles } from "@/lib/obstacles";
import { getPrototipo, tx } from "@/lib/prototipo";
import { alternates } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/prototipo">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).prototype.title, description: getDictionary(lang).prototype.body, alternates: alternates(lang, "prototipo/") } : {};
}

export default async function Prototipo({ params }: PageProps<"/[lang]/prototipo">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const proto = getPrototipo();
  const obst = getObstacles(lang).map((o) => o.title);
  const piezas: PiezaVista[] = (proto?.piezas ?? []).map((p) => ({
    id: p.id, nivel: p.nivel, nombre: tx(p.nombre, lang), funcion: tx(p.funcion, lang), estado: p.estado,
    tipo: p.geometria.tipo, radio: p.geometria.radio_m, dim: p.geometria.dimensiones_m, pos: p.geometria.posicion_m, color: p.geometria.color,
    obstaculos: (p.obstaculos ?? []).map((n) => ({ n, titulo: obst[n - 1] ?? "" })),
    material: p.material ? { nombre: tx(p.material.nombre, lang), designacion: p.material.designacion ?? "", composicion: p.material.composicion ?? [],
      por_que: tx(p.material.por_que, lang), propiedades: p.material.propiedades ?? [] } : null,
    electronica: (p.electronica ?? []).map((e) => ({ elemento: e.elemento, especificacion: e.especificacion, por_que: tx(e.por_que, lang) })),
    cableado: (p.cableado ?? []).map((c) => ({ tramo: c.tramo, tipo: c.tipo, por_que: tx(c.por_que, lang) })),
    cifras: p.cifras ?? [], boceto: tx(p.boceto, lang), siguiente: tx(p.siguiente_paso, lang),
  }));
  const niveles = (proto?.niveles ?? []).map((n) => ({ id: n.id, nombre: tx(n.nombre, lang), descripcion: tx(n.descripcion, lang) }));
  return (
    <>
      <PageHero title={t.prototype.title} body={t.prototype.body} />
      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <PrototipoVista niveles={niveles} piezas={piezas} labels={t.prototype} generado={t.prototype.generated} />
        </div>
      </section>
    </>
  );
}
