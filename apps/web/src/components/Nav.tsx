"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GithubLogo, List, X } from "@phosphor-icons/react";
import type { Dictionary, Locale } from "@/lib/i18n";

const REPO = "https://github.com/pablonolascoo/curvatura";
const LANGS: Locale[] = ["es", "en", "fr"];

export function Nav({ lang, t }: { lang: Locale; t: Dictionary["nav"] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const base = `/${lang}`;
  const links = [
    { href: `${base}/#motor`, label: t.engine },
    { href: `${base}/ecuaciones/`, label: t.equations },
    { href: `${base}/laboratorio/`, label: t.lab },
    { href: `${base}/biblioteca/`, label: t.library },
    { href: `${base}/buscar/`, label: t.search },
    { href: `${base}/notas/`, label: t.notes },
  ];
  const swap = (l: Locale) => pathname.replace(/^\/(es|en|fr)(?=\/|$)/, `/${l}`);
  const active = (href: string) => !href.includes("#") && pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-[var(--glass)] pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <nav aria-label={t.label} className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4 md:px-8">
        <Link href={`${base}/`} translate="no" className="font-serif text-[1.2rem] tracking-[-0.02em] text-fg">
          Curvatura
        </Link>
        <ul className="hidden items-center gap-6 text-sm lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={active(l.href) ? "page" : undefined} className={`transition-colors duration-200 hover:text-fg ${active(l.href) ? "text-fg" : "text-muted"}`}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-1 lg:flex">
          <ul aria-label={t.language} className="flex items-center font-mono text-xs uppercase">
            {LANGS.map((l) => (
              <li key={l}>
                <Link href={swap(l)} hrefLang={l} aria-current={l === lang ? "true" : undefined} className={`rounded px-2 py-1.5 transition-colors ${l === lang ? "text-fg" : "text-muted hover:text-fg"}`}>
                  {l}
                </Link>
              </li>
            ))}
          </ul>
          <a href={REPO} target="_blank" rel="noreferrer" aria-label="GitHub" className="ml-2 flex size-9 items-center justify-center rounded-md text-fg transition-colors hover:bg-gray-bg">
            <GithubLogo size={18} weight="bold" />
          </a>
        </div>
        <button type="button" aria-expanded={open} aria-controls="menu" aria-label={open ? t.close : t.menu} onClick={() => setOpen((o) => !o)} className="flex size-10 items-center justify-center rounded-md text-fg lg:hidden">
          {open ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
        </button>
      </nav>

      <div id="menu" hidden={!open} className="fixed inset-x-0 bottom-0 top-[calc(3.5rem+env(safe-area-inset-top))] overflow-y-auto overscroll-contain border-t border-line bg-bg px-4 pb-10 pt-6 lg:hidden">
        <ul className="grid">
          {links.map((l, i) => (
            <li key={l.href} className="reveal is-in border-b border-line" style={{ ["--i" as string]: i }}>
              <Link href={l.href} onClick={() => setOpen(false)} className="block py-4 font-serif text-2xl tracking-[-0.02em] text-fg">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex items-center gap-2 font-mono text-sm uppercase">
          {LANGS.map((l) => (
            <Link key={l} href={swap(l)} hrefLang={l} className={`rounded-md border px-3 py-1.5 ${l === lang ? "border-line-strong text-fg" : "border-line text-muted"}`}>
              {l}
            </Link>
          ))}
          <a href={REPO} target="_blank" rel="noreferrer" aria-label="GitHub" className="ml-auto flex size-10 items-center justify-center rounded-md border border-line">
            <GithubLogo size={18} weight="bold" />
          </a>
        </div>
      </div>
    </header>
  );
}
