"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { cuandoOcioso, INDICE_BIBLIOTECA, precargar, puedePrecargar } from "@/lib/datos";

/**
 * Deja listo lo que el usuario abrirá después, cuando el equipo está ocioso: el índice de la biblioteca,
 * la lista de fichas con página propia y las secciones principales. En la app de escritorio todo está
 * en disco y se precarga siempre; en la web solo si la conexión lo permite.
 */
export function Precarga({ lang }: { lang: string }) {
  const router = useRouter();
  useEffect(() => {
    const app = !!(window as unknown as { __TAURI__?: unknown }).__TAURI__;
    if (!app && !puedePrecargar()) return;
    return cuandoOcioso(() => {
      for (const r of ["", "biblioteca/", "ecuaciones/", "laboratorio/", "buscar/", "notas/"]) router.prefetch(`/${lang}/${r}`);
      precargar(INDICE_BIBLIOTECA);
      precargar("/library/static-ids.json");
    });
  }, [lang, router]);
  return null;
}
