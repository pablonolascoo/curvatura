import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Newsreader } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RevealObserver } from "@/components/RevealObserver";
import { LOCALES, getDictionary, hasLocale } from "@/lib/i18n";
import { APP_VERSION } from "@/lib/version";
import "../globals.css";

const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", style: ["normal", "italic"], display: "swap" });

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: { default: t.meta.title, template: `%s · ${t.meta.title}` },
    description: t.meta.description,
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}/`])) },
    openGraph: { title: t.meta.title, description: t.meta.description, locale: lang, type: "website" },
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
      </body>
    </html>
  );
}
