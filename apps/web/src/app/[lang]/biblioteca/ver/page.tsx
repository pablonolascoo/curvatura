import { notFound } from "next/navigation";
import { PaperViewer } from "@/components/PaperViewer";
import { getDictionary, hasLocale } from "@/lib/i18n";

export default async function ViewPaper({ params }: PageProps<"/[lang]/biblioteca/ver">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 md:px-8 md:pt-40">
      <PaperViewer lang={lang} labels={{ ...t.library, loading: t.library.loading }} />
    </div>
  );
}
