/// <reference lib="webworker" />
/**
 * Buscador en un hilo aparte: descarga los fragmentos, construye el índice MiniSearch y responde
 * consultas sin tocar el hilo de la interfaz (la página sigue fluida mientras se indexan ~10 MB).
 */
import MiniSearch from "minisearch";

type Chunk = { id: string; k: string; p: string | null; t: string; y: number | null; s: string; l: string; x: string; u: string | null };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

let listo: Promise<MiniSearch<Chunk>> | null = null;

function indice(): Promise<MiniSearch<Chunk>> {
  listo ??= fetch("/search/chunks.json")
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then(async (chunks: Chunk[]) => {
      const ms = new MiniSearch<Chunk>({
        fields: ["t", "s", "x"],
        storeFields: ["id", "k", "p", "t", "y", "s", "l", "x", "u"],
        processTerm: (term) => (term.length > 1 ? fold(term) : null),
        searchOptions: { boost: { t: 3, s: 1.5 }, prefix: true, fuzzy: 0.15 },
      });
      await ms.addAllAsync(chunks, { chunkSize: 500 });
      return ms;
    });
  return listo;
}

self.onmessage = async (e: MessageEvent<{ tipo: "preparar" } | { tipo: "buscar"; n: number; q: string; kind: string }>) => {
  const m = e.data;
  try {
    const ms = await indice();
    if (m.tipo === "preparar") {
      self.postMessage({ tipo: "listo" });
      return;
    }
    const seen = new Set<string>();
    const res = ms
      .search(m.q, { filter: (r) => !m.kind || r.k === m.kind })
      .filter((r) => {
        const key = `${r.p ?? r.id}:${r.s}`; // un fragmento por sección
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 40);
    self.postMessage({ tipo: "resultados", n: m.n, res });
  } catch (err) {
    self.postMessage({ tipo: "error", n: "n" in m ? m.n : null, error: String(err) });
  }
};
