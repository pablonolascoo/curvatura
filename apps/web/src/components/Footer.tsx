import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { APP_VERSION } from "@/lib/version";
import { ButtonLink } from "./ButtonLink";

export function Footer({ lang, t, nav }: { lang: Locale; t: Dictionary["footer"]; nav: Dictionary["nav"] }) {
  return (
    <footer className="relative border-t border-line px-4 pb-10 pt-32 md:px-8 md:pt-48">
      <div className="mx-auto grid max-w-[1400px] gap-16">
        <div className="grid gap-8">
          <h2 className="max-w-5xl text-[clamp(2.8rem,7vw,6.5rem)] font-medium leading-[0.95] tracking-[-0.045em] text-fg">{t.title}</h2>
          <p className="max-w-[46ch] text-lg text-muted">{t.body}</p>
          <div>
            <ButtonLink href="https://github.com/pablonolascoo/curvatura" external>
              {t.cta}
            </ButtonLink>
          </div>
        </div>
        <div className="grid gap-8 border-t border-line pt-8 text-sm text-muted md:grid-cols-12">
          <p className="md:col-span-6">{t.license}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 md:col-span-4">
            <li><Link className="hover:text-fg" href={`/${lang}/biblioteca/`}>{nav.library}</Link></li>
            <li><Link className="hover:text-fg" href={`/${lang}/notas/`}>{nav.notes}</Link></li>
            <li><Link className="hover:text-fg" href={`/${lang}/#ruta`}>{nav.roadmap}</Link></li>
          </ul>
          <p className="md:col-span-2 md:text-right" title={APP_VERSION}>{t.credit}</p>
        </div>
      </div>
    </footer>
  );
}
