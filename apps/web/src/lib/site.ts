import type { Metadata } from "next";
import { LOCALES } from "./i18n";

export const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://curvatura.consultora-bim.workers.dev").replace(/\/$/, "");
export const AUTHOR = { name: "Pablo Nolasco", url: "https://github.com/pablonolascoo" };

/** Canónica y alternativas hreflang para una ruta relativa al idioma ("" = portada). */
export function alternates(lang: string, path = ""): Metadata["alternates"] {
  return {
    canonical: `/${lang}/${path}`,
    languages: { ...Object.fromEntries(LOCALES.map((l) => [l, `/${l}/${path}`])), "x-default": `/es/${path}` },
  };
}
