"use client";

import { useMemo, useState } from "react";
import { ArrowsOutSimple, Cpu, Flask, Plugs, Wrench } from "@phosphor-icons/react";
import { Boceto } from "./Boceto";
import { Prototipo3D, type Pieza3D } from "./Prototipo3D";

export type PiezaVista = Pieza3D & {
  nivel: string;
  funcion: string;
  obstaculos: { n: number; titulo: string }[];
  material: null | { nombre: string; designacion: string; composicion: { elemento: string; porcentaje_masa: number | string }[]; por_que: string;
    propiedades: { nombre: string; valor: string | number; unidad?: string; fuente?: string }[] };
  electronica: { elemento: string; especificacion?: string; por_que: string }[];
  cableado: { tramo: string; tipo: string; por_que: string }[];
  cifras: { nombre: string; valor: string | number; unidad?: string; fuente?: string }[];
  boceto: string;
  siguiente: string;
};
type Nivel = { id: string; nombre: string; descripcion: string };
export type ProtoLabels = {
  explode: string; parts: string; pick: string; status: Record<string, string>; function: string; material: string; designation: string;
  composition: string; why: string; properties: string; electronics: string; cabling: string; figures: string; source: string; next: string;
  sketch: string; obstacles: string; view3d: string; generated: string;
};

/** Porcentaje representativo: «5.5-6.75» → punto medio, «≤ 0.40» → 0,40, «resto» → lo que falta hasta 100. */
function porcentajes(comp: { elemento: string; porcentaje_masa: number | string }[]): number[] {
  const v = comp.map((c) => {
    const t = String(c.porcentaje_masa).replace(/,/g, ".");
    const nums = [...t.matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
    if (!nums.length) return NaN; // «resto»
    return nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0];
  });
  const resto = Math.max(0, 100 - v.filter(Number.isFinite).reduce((a, b) => a + b, 0));
  const huecos = v.filter((x) => !Number.isFinite(x)).length;
  return v.map((x) => (Number.isFinite(x) ? x : huecos ? resto / huecos : 0));
}

const TONO: Record<string, string> = { calculado: "tag-green", boceto: "tag-yellow", abierto: "tag-red" };

function Fuente({ f }: { f?: string }) {
  if (!f) return null;
  const url = /(https?:\/\/\S+)/.exec(f)?.[1];
  const texto = f.replace(/\s*·?\s*https?:\/\/\S+/, "");
  return url ? <a href={url} target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-4 hover:text-fg">{texto || url}</a> : <span>{texto}</span>;
}

export function PrototipoVista({ niveles, piezas, labels, generado }: { niveles: Nivel[]; piezas: PiezaVista[]; labels: ProtoLabels; generado: string }) {
  const [nivel, setNivel] = useState(niveles[0]?.id ?? "mesa");
  const [sel, setSel] = useState<string | null>(null);
  const [despiece, setDespiece] = useState(0.35);
  const delNivel = useMemo(() => piezas.filter((p) => p.nivel === nivel), [piezas, nivel]);
  const p = delNivel.find((x) => x.id === sel) ?? null;
  const n = niveles.find((x) => x.id === nivel);

  return (
    <div className="grid gap-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="inline-flex rounded-full bg-[var(--line)]/50 p-1 ring-1 ring-[var(--line)]" role="tablist">
          {niveles.map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={nivel === x.id} onClick={() => { setNivel(x.id); setSel(null); }}
              className={`rounded-full px-5 py-2 text-sm transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${nivel === x.id ? "bg-[var(--ink)] text-[var(--bg)]" : "text-muted hover:text-fg"}`}>
              {x.nombre}
            </button>
          ))}
        </div>
        <span className="tag tag-yellow normal-case tracking-normal">{generado}</span>
      </div>
      {n && <p className="max-w-3xl text-lg leading-relaxed text-fg-2">{n.descripcion}</p>}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="grid content-start gap-4 lg:col-span-7">
          <Prototipo3D piezas={delNivel} seleccion={sel} despiece={despiece} onElegir={setSel} etiqueta={labels.view3d} />
          <label className="flex items-center gap-4 text-sm text-muted">
            <ArrowsOutSimple size={16} weight="bold" aria-hidden />
            <span className="shrink-0">{labels.explode}</span>
            <input type="range" min={0} max={1} step={0.01} value={despiece} onChange={(e) => setDespiece(Number(e.target.value))} className="w-full" />
          </label>
          <div className="flex flex-wrap gap-3 text-xs text-muted">
            {Object.entries(labels.status).map(([k, v]) => <span key={k} className={`tag ${TONO[k]} normal-case tracking-normal`}>{v}</span>)}
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="card grid content-start gap-6 p-6 md:p-7 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
            {!p ? (
              <p className="text-muted">{labels.pick}</p>
            ) : (
              <>
                <header className="grid gap-2">
                  <span className={`tag ${TONO[p.estado]} w-max normal-case tracking-normal`}>{labels.status[p.estado]}</span>
                  <h2 className="font-serif text-2xl leading-tight tracking-[-0.02em] text-fg">{p.nombre}</h2>
                  <p className="text-[15px] leading-relaxed text-fg-2">{p.funcion}</p>
                  {p.obstaculos.length > 0 && (
                    <p className="text-xs text-muted">{labels.obstacles}: {p.obstaculos.map((o) => `${o.n} ${o.titulo}`).join(" · ")}</p>
                  )}
                </header>

                {p.material && (
                  <section className="grid gap-3 border-t border-line pt-5">
                    <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.05em] text-muted"><Flask size={14} weight="bold" aria-hidden />{labels.material}</h3>
                    <p className="text-fg">{p.material.nombre}</p>
                    {p.material.designacion && <p className="font-mono text-xs text-muted">{p.material.designacion}</p>}
                    {p.material.composicion.length > 0 && (
                      <div className="grid gap-1.5" aria-label={labels.composition}>
                        <div className="flex h-2 overflow-hidden rounded-full bg-gray-bg">
                          {porcentajes(p.material.composicion).map((v, i) => (v > 0 ? (
                            <span key={p.material!.composicion[i].elemento} title={`${p.material!.composicion[i].elemento} ${p.material!.composicion[i].porcentaje_masa}%`}
                              style={{ width: `${v}%`, background: `hsl(${(i * 61) % 360} 30% ${55 + (i % 3) * 8}%)` }} />
                          ) : null))}
                        </div>
                        <p className="font-mono text-xs text-muted">{p.material.composicion.map((c) => `${c.elemento} ${c.porcentaje_masa}${/\d/.test(String(c.porcentaje_masa)) ? "%" : ""}`).join(" · ")}</p>
                      </div>
                    )}
                    {p.material.por_que && <p className="text-sm leading-relaxed text-fg-2"><span className="text-muted">{labels.why}: </span>{p.material.por_que}</p>}
                    {p.material.propiedades.length > 0 && (
                      <table className="w-full text-sm">
                        <tbody>
                          {p.material.propiedades.map((x) => (
                            <tr key={x.nombre} className="border-t border-line align-top">
                              <td className="py-1.5 pr-3 text-muted">{x.nombre}</td>
                              <td className="py-1.5 pr-3 font-mono text-fg tabular-nums">{x.valor} {x.unidad}</td>
                              <td className="py-1.5 text-xs text-muted"><Fuente f={x.fuente} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </section>
                )}

                {p.cifras.length > 0 && (
                  <section className="grid gap-2 border-t border-line pt-5">
                    <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.05em] text-muted"><Wrench size={14} weight="bold" aria-hidden />{labels.figures}</h3>
                    <ul className="grid gap-2">
                      {p.cifras.map((x) => (
                        <li key={x.nombre} className="grid gap-0.5">
                          <span className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                            <span className="text-fg-2">{x.nombre}</span>
                            <span className="font-mono text-fg tabular-nums">{x.valor} {x.unidad}</span>
                          </span>
                          <span className="text-xs text-muted">{labels.source}: <Fuente f={x.fuente} /></span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {p.electronica.length > 0 && (
                  <section className="grid gap-2 border-t border-line pt-5">
                    <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.05em] text-muted"><Cpu size={14} weight="bold" aria-hidden />{labels.electronics}</h3>
                    <ul className="grid gap-2 text-sm">
                      {p.electronica.map((x) => (
                        <li key={x.elemento}><span className="text-fg">{x.elemento}</span>{x.especificacion && <span className="font-mono text-xs text-muted"> · {x.especificacion}</span>}
                          {x.por_que && <span className="block text-xs text-muted">{x.por_que}</span>}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {p.cableado.length > 0 && (
                  <section className="grid gap-2 border-t border-line pt-5">
                    <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.05em] text-muted"><Plugs size={14} weight="bold" aria-hidden />{labels.cabling}</h3>
                    <ul className="grid gap-2 text-sm">
                      {p.cableado.map((x) => (
                        <li key={x.tramo}><span className="text-fg">{x.tramo}</span><span className="font-mono text-xs text-muted"> · {x.tipo}</span>
                          {x.por_que && <span className="block text-xs text-muted">{x.por_que}</span>}</li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="grid gap-2 border-t border-line pt-5">
                  <h3 className="text-xs uppercase tracking-[0.05em] text-muted">{labels.sketch}</h3>
                  <Boceto id={p.id} tipo={p.tipo} color={p.estado === "abierto" ? "red" : p.color} texto={p.boceto} />
                </section>

                {p.siguiente && (
                  <p className="border-t border-line pt-5 text-sm leading-relaxed text-fg-2"><span className="text-muted">{labels.next}: </span>{p.siguiente}</p>
                )}
              </>
            )}
          </div>
        </aside>
      </div>

      <section className="grid gap-4" aria-label={labels.parts}>
        <h2 className="font-serif text-2xl tracking-[-0.02em] text-fg">{labels.parts}</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {delNivel.map((x) => (
            <li key={x.id}>
              <button type="button" onClick={() => { setSel(x.id); }} aria-pressed={sel === x.id}
                className={`card card-hover grid w-full gap-2 p-5 text-left transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${sel === x.id ? "border-line-strong" : ""}`}>
                <span className={`tag ${TONO[x.estado]} w-max normal-case tracking-normal`}>{labels.status[x.estado]}</span>
                <span className="text-[15px] text-fg">{x.nombre}</span>
                <span className="line-clamp-2 text-sm text-muted">{x.funcion}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
