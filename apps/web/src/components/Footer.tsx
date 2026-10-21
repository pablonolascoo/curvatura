import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { APP_VERSION } from "@/lib/version";
import { ButtonLink } from "./ButtonLink";

export function Footer({ lang, t, nav }: { lang: Locale; t: Dictionary["footer"]; nav: Dictionary["nav"] }) {
  return (
    <footer className="border-t border-line px-4 pb-10 pt-24 md:px-8 md:pt-32">
      <div className="mx-auto grid max-w-6xl gap-16">
        <div className="grid max-w-3xl gap-6">
          <h2 className="font-serif text-[clamp(2.4rem,5vw,4rem)] leading-[1.05] tracking-[-0.03em]">{t.title}</h2>
          <p className="text-lg text-muted">{t.body}</p>
          <div>
            <ButtonLink href="https://github.com/pablonolascoo/curvatura" external>
              {t.cta}
            </ButtonLink>
          </div>
        </div>
        <div className="grid gap-6 border-t border-line pt-8 text-sm text-muted md:grid-cols-12">
          <p className="md:col-span-6">{t.license}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 md:col-span-4">
            <li><Link className="hover:text-fg" href={`/${lang}/biblioteca/`}>{nav.library}</Link></li>
            <li><Link className="hover:text-fg" href={`/${lang}/ecuaciones/`}>{nav.equations}</Link></li>
            <li><Link className="hover:text-fg" href={`/${lang}/laboratorio/`}>{nav.lab}</Link></li>
            <li><Link className="hover:text-fg" href={`/${lang}/notas/`}>{nav.notes}</Link></li>
          </ul>
          <p className="font-mono text-xs md:col-span-2 md:text-right">
            <span translate="no">{APP_VERSION}</span>
            <br />
            {t.credit}
          </p>
        </div>
      </div>
    </footer>
  );
}
