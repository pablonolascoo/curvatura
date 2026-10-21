"use client";

import { useEffect, useRef, useState } from "react";
import { loadCore } from "@/lib/core";

/** Mapa de expansión θ calculado en Rust/WASM: rojo contracción, azul expansión. Sin interacción. */
export function MiniField({ label, className }: { label: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let cancel = false;
    loadCore().then((core) => {
      const c = ref.current;
      if (!c || cancel) return;
      const N = 160;
      const { theta } = core.field(1.2, 1, 5, 2.4, N);
      let peak = 0;
      for (const v of theta) peak = Math.max(peak, Math.abs(v));
      const css = getComputedStyle(document.documentElement);
      const probe = document.createElement("canvas").getContext("2d")!;
      const hex = (n: string) => {
        probe.fillStyle = css.getPropertyValue(n).trim(); // normaliza cualquier formato a #rrggbb
        const h = String(probe.fillStyle);
        return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
      };
      const [bg, red, blue] = [hex("--surface"), hex("--red"), hex("--blue")];
      const img = new ImageData(N, N);
      for (let j = 0; j < N; j++)
        for (let i = 0; i < N; i++) {
          const t = theta[(N - 1 - j) * N + i] / (peak || 1);
          const col = t < 0 ? red : blue;
          const k = Math.min(1, Math.abs(t)) ** 0.75;
          const o = 4 * (j * N + i);
          for (let ch = 0; ch < 3; ch++) img.data[o + ch] = bg[ch] + (col[ch] - bg[ch]) * k;
          img.data[o + 3] = 255;
        }
      c.width = c.height = N;
      c.getContext("2d")!.putImageData(img, 0, 0);
      setOk(true);
    }, (err: unknown) => console.error("[MiniField]", err));
    return () => { cancel = true; };
  }, []);
  return <canvas ref={ref} role="img" aria-label={label} className={`[image-rendering:auto] transition-opacity duration-700 ${ok ? "opacity-100" : "opacity-0"} ${className ?? ""}`} />;
}
