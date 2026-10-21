"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GithubLogo } from "@phosphor-icons/react";
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

  const home = `/${lang}/`;
  const links = [
    { href: `${home}#motor`, label: t.engine },
    { href: `${home}#metrica`, label: t.metric },
    { href: `${home}#ruta`, label: t.roadmap },
    { href: `/${lang}/biblioteca/`, label: t.library },
    { href: `/${lang}/notas/`, label: t.notes },
  ];
  const swap = (l: Locale) => pathname.replace(/^\/(es|en|fr)(?=\/|$)/, `/${l}`);

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))] md:pt-6">
      <nav
        aria-label={t.label}
        className="flex h-14 w-full max-w-[1100px] items-center justify-between gap-6 rounded-full border border-line bg-[var(--glass)] pl-6 pr-2 backdrop-blur-xl shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
      >
        <Link href={home} translate="no" className="text-[15px] font-semibold tracking-[-0.02em] text-fg">
          Curvatura
        </Link>
        <ul className="hidden items-center gap-7 text-sm text-muted lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="transition-colors duration-300 hover:text-fg">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-1 lg:flex">
          <ul aria-label={t.language} className="flex items-center font-mono text-xs uppercase">
            {LANGS.map((l) => (
              <li key={l}>
                <Link
                  href={swap(l)}
                  hrefLang={l}
                  aria-current={l === lang ? "true" : undefined}
                  className={`rounded-full px-2.5 py-2 transition-colors ${l === lang ? "text-fg" : "text-muted hover:text-fg"}`}
                >
                  {l}
                </Link>
              </li>
            ))}
          </ul>
          <a href={REPO} target="_blank" rel="noreferrer" aria-label="GitHub" className="flex size-10 items-center justify-center rounded-full text-fg transition-colors hover:bg-fg/5">
            <GithubLogo size={20} weight="light" />
          </a>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="menu"
          aria-label={open ? t.close : t.menu}
          onClick={() => setOpen((o) => !o)}
          className="relative flex size-10 items-center justify-center rounded-full lg:hidden"
        >
          <span className={`absolute h-px w-5 bg-fg transition-transform duration-500 ease-premium ${open ? "rotate-45" : "-translate-y-[4px]"}`} />
          <span className={`absolute h-px w-5 bg-fg transition-transform duration-500 ease-premium ${open ? "-rotate-45" : "translate-y-[4px]"}`} />
        </button>
      </nav>

      <div
        id="menu"
        hidden={!open}
        className="fixed inset-0 -z-10 overflow-y-auto overscroll-contain bg-bg/90 px-6 pt-28 backdrop-blur-3xl lg:hidden"
      >
        <ul className="grid gap-2">
          {links.map((l, i) => (
            <li key={l.href} className="overflow-hidden">
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: `${80 + i * 50}ms` }}
                className={`block py-2 text-4xl tracking-[-0.03em] text-fg transition-[transform,opacity] duration-700 ease-premium ${open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex items-center gap-2 font-mono text-sm uppercase">
          {LANGS.map((l) => (
            <Link key={l} href={swap(l)} hrefLang={l} className={`rounded-full px-3 py-2 ring-1 ${l === lang ? "text-fg ring-fg/40" : "text-muted ring-line"}`}>
              {l}
            </Link>
          ))}
          <a href={REPO} target="_blank" rel="noreferrer" aria-label="GitHub" className="ml-auto flex size-11 items-center justify-center rounded-full ring-1 ring-line">
            <GithubLogo size={20} weight="light" />
          </a>
        </div>
      </div>
    </header>
  );
}
