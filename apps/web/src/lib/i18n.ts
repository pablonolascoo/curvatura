import es from "@/dictionaries/es.json";
import en from "@/dictionaries/en.json";
import fr from "@/dictionaries/fr.json";

export const LOCALES = ["es", "en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export type Dictionary = typeof es;

const DICTS: Record<Locale, Dictionary> = { es, en, fr };

export const hasLocale = (l: string): l is Locale => (LOCALES as readonly string[]).includes(l);
export const getDictionary = (l: Locale): Dictionary => DICTS[l];
export const LOCALE_NAMES: Record<Locale, string> = { es: "Español", en: "English", fr: "Français" };

/** Fecha ISO (AAAA-MM-DD) en formato largo del idioma, sin desfase horario. */
export const formatDate = (iso: string, l: Locale) =>
  new Intl.DateTimeFormat(l, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
