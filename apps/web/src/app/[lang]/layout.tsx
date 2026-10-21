import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Newsreader } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RevealObserver } from "@/components/RevealObserver";
import { ExternalLinks } from "@/components/ExternalLinks";
import { LOCALES, getDictionary, hasLocale } from "@/lib/i18n";
import { APP_VERSION } from "@/lib/version";
import { AUTHOR, SITE, alternates } from "@/lib/site";
import "../globals.css";

const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", style: ["normal", "italic"], display: "swap" });

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    metadataBase: new URL(SITE),
    title: { default: t.meta.title, template: `%s · ${t.meta.title}` },
    description: t.meta.description,
    applicationName: "Curvatura",
    authors: [AUTHOR],
    creator: AUTHOR.name,
    keywords: ["warp drive", "Alcubierre", "motor de curvatura", "general relativity", "energy conditions", "Natário", "Fuchs", "analogue gravity"],
    alternates: alternates(lang),
    openGraph: { title: t.meta.title, description: t.meta.description, locale: lang, type: "website", siteName: "Curvatura", images: [{ url: "/og.png", width: 1200, height: 630, alt: t.meta.title }] },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description, images: ["/og.png"] },
    robots: { index: true, follow: true },
    other: { "app-version": APP_VERSION },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#191919" },
    { media: "(prefers-color-scheme: light)", color: "#fbfbfa" },
  ],
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <html lang={lang} className={`${GeistSans.variable} ${GeistMono.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-[100dvh]">
        <a href="#contenido" className="skip-link">{t.nav.skip}</a>
        <div className="ambient" aria-hidden />
        <Nav lang={lang} t={t.nav} />
        <main id="contenido" tabIndex={-1} className="w-full max-w-full overflow-x-clip">{children}</main>
        <Footer lang={lang} t={t.footer} nav={t.nav} />
        <RevealObserver />
        <ExternalLinks />
      </body>
    </html>
  );
}
