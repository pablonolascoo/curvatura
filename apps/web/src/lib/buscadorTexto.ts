"use client";

/**
 * Búsqueda en el texto completo de la biblioteca en un Web Worker único y compartido (se crea la
 * primera vez que hace falta). El índice (~10 MB) se construye fuera del hilo de la interfaz.
 */
export type Fragmento = { id: string; k: string; p: string | null; t: string; y: number | null; s: string; l: string; x: string; u: string | null; terms: string[] };

let worker: Worker | null = null;
let n = 0;
const pendientes = new Map<number, (r: Fragmento[]) => void>();

function w(): Worker {
  if (!worker) {
    worker = new Worker(new URL("../workers/buscar.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (e: MessageEvent) => {
      const m = e.data;
      if (m.tipo === "resultados") {
        pendientes.get(m.n)?.(m.res);
        pendientes.delete(m.n);
      }
    };
    worker.postMessage({ tipo: "preparar" });
  }
  return worker;
}

/** Empieza a preparar el índice sin buscar nada (al enfocar el buscador). */
export const prepararTexto = () => void w();

export function buscarTexto(q: string, kind = ""): Promise<Fragmento[]> {
  const id = ++n;
  return new Promise((ok) => {
    pendientes.set(id, ok);
    w().postMessage({ tipo: "buscar", n: id, q, kind });
  });
}
