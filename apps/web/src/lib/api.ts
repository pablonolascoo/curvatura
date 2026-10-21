"use client";

/**
 * Cliente de la API de valoraciones. En la web, mismo origen con cookie de sesión.
 * En la app de escritorio solo lectura contra la web publicada (las acciones abren la web).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://curvatura.consultora-bim.workers.dev";

export const enApp = () => typeof window !== "undefined" && !!(window as unknown as { __TAURI__?: unknown }).__TAURI__;
const base = () => (enApp() ? SITE_URL : "");

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(base() + path, { credentials: enApp() ? "omit" : "same-origin", ...init });
  const data = (await r.json().catch(() => ({}))) as T & { error?: string };
  if (!r.ok) throw new ApiError(r.status, data.error ?? `HTTP ${r.status}`);
  return data;
}

export const postJson = <T,>(path: string, body: unknown) =>
  api<T>(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

export const loginUrl = (volver: string) => `${base()}/api/auth/orcid/login?volver=${encodeURIComponent(volver)}`;
