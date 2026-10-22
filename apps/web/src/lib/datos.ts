"use client";

/**
 * Caché de datos del cliente: cada JSON se pide una sola vez y se comparte entre componentes.
 * Permite precargar lo que hará falta antes de que el usuario llegue (al pasar el ratón por un
 * enlace, cuando el navegador está ocioso o cuando un bloque se acerca a la pantalla), para que
 * nada «cargue» al entrar en pantalla.
 */

const cache = new Map<string, Promise<unknown>>();

export function getJSON<T>(url: string, prioridad: RequestPriority = "auto"): Promise<T> {
  let p = cache.get(url) as Promise<T> | undefined;
  if (!p) {
    p = fetch(url, { priority: prioridad }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))));
    p.catch(() => cache.delete(url)); // un fallo no queda en caché: se puede reintentar
    cache.set(url, p);
  }
  return p;
}

/** Precarga sin bloquear (prioridad baja). Ignora errores: quien lo use de verdad los verá. */
export function precargar(url: string) {
  getJSON(url, "low").catch(() => {});
}

/** ¿Conviene precargar? No con «ahorro de datos» ni en conexiones lentas. */
export function puedePrecargar(): boolean {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !(c?.saveData || /(^|-)2g$/.test(c?.effectiveType ?? ""));
}

/** Ejecuta cuando el navegador está ocioso (con respaldo para Safari). */
export function cuandoOcioso(fn: () => void, timeout = 2000): () => void {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(fn, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(fn, 300);
  return () => window.clearTimeout(id);
}

export const shardDe = (id: string) => `/library/p/${/^[a-z0-9]/.test(id) ? id[0] : "_"}.json`;
export const INDICE_BIBLIOTECA = "/library/index.json";
