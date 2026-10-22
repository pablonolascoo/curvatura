/** Patente tal como la publica sync-library (public/library/patentes.json). */
export type Patente = {
  n: string; t: string; te: string | null; tf: string | null; y: string; yp: string | null; i: string[]; h: string | null;
  o: string; pp: string[]; e: string | null; cpc: string[]; k: string[]; ca: number; cp: number; r: number; u: string; ue: string; ab: string | null;
};

/** WO (OMPI) y EP (Oficina Europea) no son países: bandera de la ONU y de la UE. */
export const banderaOficina = (c: string) => ({ WO: "un", EP: "eu", EA: "eu" } as Record<string, string>)[c] ?? c.toLowerCase();

export function nombreOficina(c: string, lang: string, oficinas: Record<string, string>): string {
  if (oficinas[c]) return oficinas[c];
  try { return new Intl.DisplayNames([lang], { type: "region" }).of(c) ?? c; } catch { return c; }
}

/** Estado legal de Google Patents («Active», «Expired - Fee Related»…) a una clave traducible. */
export function claveEstado(e: string | null): "activa" | "caducada" | "abandonada" | "tramite" | "retirada" | null {
  if (!e) return null;
  const s = e.toLowerCase();
  if (s.startsWith("active")) return "activa";
  if (s.startsWith("expired") || s.startsWith("ceased")) return "caducada";
  if (s.startsWith("abandon")) return "abandonada";
  if (s.startsWith("pending")) return "tramite";
  if (s.startsWith("withdrawn") || s.startsWith("revoked")) return "retirada";
  return null;
}

export const tituloPatente = (p: Patente, lang: string) => (lang === "es" ? p.te : lang === "fr" ? p.tf : null) ?? p.t;
