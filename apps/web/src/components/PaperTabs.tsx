"use client";

import { useState } from "react";

export type Tab = { lang: string; label: string; original: boolean; abstract: string | null; text: string | null; note?: string };

/** Pestañas de idioma de un paper. El contenido llega ya renderizado (HTML + MathML) desde el servidor. */
export function PaperTabs({ tabs, initial, labels }: { tabs: Tab[]; initial: string; labels: { abstract: string; fulltext: string; noAbstract: string; noFulltext: string; original: string } }) {
  const [lang, setLang] = useState(tabs.some((t) => t.lang === initial) ? initial : tabs[0]?.lang);
  const tab = tabs.find((t) => t.lang === lang) ?? tabs[0];
  if (!tab) return null;
  return (
    <div className="grid min-w-0 gap-10">
      <div
        role="tablist"
        aria-label="Idioma"
        className="flex flex-wrap gap-2"
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          const i = tabs.findIndex((t) => t.lang === lang);
          const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
          setLang(next.lang);
          (e.currentTarget.querySelector(`[data-lang="${next.lang}"]`) as HTMLButtonElement | null)?.focus();
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.lang}
            role="tab"
            type="button"
            data-lang={t.lang}
            tabIndex={t.lang === lang ? 0 : -1}
            aria-selected={t.lang === lang}
            onClick={() => setLang(t.lang)}
            className={`rounded-md px-3.5 py-1.5 text-sm transition-colors duration-300 ${t.lang === lang ? "bg-[var(--ink)] text-[var(--bg)]" : "text-muted border border-line hover:text-fg"}`}
          >
            {t.label}
            {t.original && <span className="ml-2 font-mono text-[11px] opacity-70">{labels.original}</span>}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="grid min-w-0 gap-12">
        {tab.note && <p className="text-sm text-muted">{tab.note}</p>}
        <section className="grid gap-4">
          <h2 className="text-sm text-muted">{labels.abstract}</h2>
          {tab.abstract ? (
            <div className="prose-paper text-lg text-fg" dangerouslySetInnerHTML={{ __html: tab.abstract }} />
          ) : (
            <p className="text-muted">{labels.noAbstract}</p>
          )}
        </section>
        {tab.text && (
          <section className="grid gap-4 border-t border-line pt-12">
            <h2 className="text-sm text-muted">{labels.fulltext}</h2>
            <div className="prose-paper" dangerouslySetInnerHTML={{ __html: tab.text }} />
          </section>
        )}
      </div>
    </div>
  );
}
