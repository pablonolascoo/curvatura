import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RedirigirBiblioteca } from "@/components/RedirigirBiblioteca";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { alternates } from "@/lib/site";

/** La búsqueda vive ahora en la biblioteca (buscador con IA). Esta dirección se conserva para no romper enlaces. */
export async function generateMetadata({ params }: PageProps<"/[lang]/buscar">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).library.aiSearch, alternates: alternates(lang, "biblioteca/"), robots: { index: false } } : {};
}

export default async function Search({ params }: PageProps<"/[lang]/buscar">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <RedirigirBiblioteca lang={lang} texto={getDictionary(lang).library.aiSearch} />;
}
