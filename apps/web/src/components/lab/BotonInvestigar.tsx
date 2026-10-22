"use client";

import { Sparkle } from "@phosphor-icons/react";

/** Manda una pregunta al investigador IA de la página (que hace scroll y la lanza). */
export function BotonInvestigar({ pregunta, label }: { pregunta: string; label: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("curvatura:investigar", { detail: pregunta }))}
      className="group inline-flex w-max items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-fg-2 transition-[border-color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-line-strong hover:text-fg active:scale-[0.98]">
      <Sparkle size={12} weight="fill" className="text-[var(--blue)] transition-transform duration-300 group-hover:rotate-12" aria-hidden />
      {label}
    </button>
  );
}
