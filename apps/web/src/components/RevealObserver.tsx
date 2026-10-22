"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Activa `.reveal` ANTES de que el bloque entre en pantalla (margen de una pantalla y media por debajo),
 * así la transición ya ha terminado cuando el usuario llega y nada «aparece» al hacer scroll.
 * Un único observador para toda la página.
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px 150% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
