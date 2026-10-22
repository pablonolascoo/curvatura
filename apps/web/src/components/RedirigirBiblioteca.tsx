"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Lleva /buscar/?q=… al buscador con IA de la biblioteca, conservando la consulta. */
export function RedirigirBiblioteca({ lang, texto }: { lang: string; texto: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${lang}/biblioteca/${location.search}`);
  }, [lang, router]);
  return (
    <p className="px-4 pb-24 pt-32 text-center text-muted md:px-8">
      <Link href={`/${lang}/biblioteca/`} className="underline decoration-line-strong underline-offset-4">{texto}</Link>
    </p>
  );
}
