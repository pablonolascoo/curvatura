"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";

/**
 * Boceto de ingeniería dibujado a mano alzada (roughjs) como marcador de lo que aún no tiene plano:
 * trazo de tinta, una forma desplazada en color pastel y cotas. Semilla fija por pieza: siempre igual.
 */
const semilla = (id: string) => [...id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7) % 2 ** 31;

export function Boceto({ id, tipo, color = "ink", texto }: { id: string; tipo: string; color?: string; texto: string }) {
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    el.replaceChildren();
    const css = getComputedStyle(document.documentElement);
    const tinta = css.getPropertyValue("--ink").trim() || "#111";
    const pastel = css.getPropertyValue(color === "ink" ? "--gray-bg" : `--${color}-bg`).trim() || "#f1f1ef";
    const rc = rough.svg(el);
    const o = { seed: semilla(id), stroke: tinta, strokeWidth: 1.1, roughness: 1.4, bowing: 1.2 };
    const fondo = { ...o, stroke: "none", fill: pastel, fillStyle: "solid" as const };
    const add = (n: SVGElement) => el.appendChild(n);
    const cota = (x1: number, y1: number, x2: number, y2: number) => {
      add(rc.line(x1, y1, x2, y2, { ...o, strokeWidth: 0.7, roughness: 0.8 }));
      add(rc.line(x1, y1 - 5, x1, y1 + 5, { ...o, strokeWidth: 0.7 }));
      add(rc.line(x2, y2 - 5, x2, y2 + 5, { ...o, strokeWidth: 0.7 }));
    };
    switch (tipo) {
      case "cascara":
        add(rc.circle(170, 108, 150, fondo));
        add(rc.circle(160, 100, 160, o));
        add(rc.circle(160, 100, 96, o));
        add(rc.line(160, 100, 240, 100, { ...o, strokeWidth: 0.7 }));
        add(rc.arc(160, 100, 128, 128, -0.6, 0.6, false, o));
        cota(160, 194, 240, 194);
        break;
      case "anillo":
        add(rc.ellipse(170, 108, 190, 70, fondo));
        add(rc.ellipse(160, 100, 200, 74, o));
        add(rc.ellipse(160, 100, 150, 46, o));
        cota(60, 160, 260, 160);
        break;
      case "celosia":
        add(rc.rectangle(92, 34, 156, 136, fondo));
        add(rc.rectangle(80, 24, 160, 140, o));
        for (let i = 0; i < 4; i++) add(rc.line(80 + i * 40, 24, 120 + i * 40, 164, o));
        for (let i = 0; i < 4; i++) add(rc.line(120 + i * 40, 24, 80 + i * 40, 164, o));
        cota(80, 182, 240, 182);
        break;
      case "cilindro":
      case "modulo":
        add(rc.rectangle(122, 42, 96, 130, fondo));
        add(rc.ellipse(160, 40, 100, 26, o));
        add(rc.line(110, 40, 110, 160, o));
        add(rc.line(210, 40, 210, 160, o));
        add(rc.ellipse(160, 160, 100, 26, o));
        if (tipo === "modulo") { add(rc.circle(145, 90, 18, o)); add(rc.circle(175, 90, 18, o)); }
        cota(110, 190, 210, 190);
        break;
      case "placa":
        add(rc.polygon([[96, 120], [226, 120], [268, 82], [138, 82]], fondo));
        add(rc.polygon([[80, 112], [210, 112], [252, 74], [122, 74]], o));
        add(rc.line(80, 112, 80, 124, o));
        add(rc.line(210, 112, 210, 124, o));
        add(rc.line(80, 124, 210, 124, o));
        cota(80, 150, 210, 150);
        break;
      case "cable":
        add(rc.curve([[40, 120], [100, 70], [160, 130], [220, 80], [280, 110]], { ...o, strokeWidth: 2 }));
        add(rc.circle(40, 120, 16, { ...o, fill: pastel, fillStyle: "solid" }));
        add(rc.circle(280, 110, 16, { ...o, fill: pastel, fillStyle: "solid" }));
        break;
      default:
        add(rc.polygon([[108, 70], [208, 70], [238, 46], [138, 46]], fondo));
        add(rc.rectangle(90, 70, 110, 90, o));
        add(rc.polygon([[90, 70], [120, 44], [230, 44], [200, 70]], o));
        add(rc.polygon([[200, 70], [230, 44], [230, 134], [200, 160]], o));
        cota(90, 182, 200, 182);
    }
  }, [id, tipo, color]);

  return (
    <figure className="grid gap-2">
      <svg ref={svg} viewBox="0 0 320 210" className="h-auto w-full" role="img" aria-label={texto} />
      <figcaption className="text-xs leading-relaxed text-muted">{texto}</figcaption>
    </figure>
  );
}
