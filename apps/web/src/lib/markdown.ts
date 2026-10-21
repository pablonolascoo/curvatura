import "server-only";
import { Marked } from "marked";
import temml from "temml";

/** Markdown con matemáticas LaTeX ($...$ y $$...$$) renderizadas a MathML con Temml. */
const marked = new Marked({
  gfm: true,
  extensions: [
    {
      name: "mathBlock",
      level: "block",
      start: (src) => src.indexOf("$$"),
      tokenizer(src) {
        const m = /^\$\$([\s\S]+?)\$\$/.exec(src);
        if (m) return { type: "mathBlock", raw: m[0], text: m[1].trim() };
      },
      renderer: (t) => math(t.text, true),
    },
    {
      name: "mathInline",
      level: "inline",
      start: (src) => src.indexOf("$"),
      tokenizer(src) {
        const m = /^\$([^$\n]+?)\$/.exec(src);
        if (m) return { type: "mathInline", raw: m[0], text: m[1] };
      },
      renderer: (t) => math(t.text, false),
    },
  ],
});

function math(tex: string, display: boolean): string {
  try {
    return temml.renderToString(tex, { displayMode: display, throwOnError: true });
  } catch (err) {
    // Un error de LaTeX se muestra marcado en la página; nunca se oculta.
    const msg = err instanceof Error ? err.message : String(err);
    return `<code class="math-error" title="${msg.replace(/"/g, "&quot;")}">${tex.replace(/</g, "&lt;")}</code>`;
  }
}

/** Reescribe rutas relativas de imágenes a la carpeta pública del paper. */
export function renderMarkdown(src: string, assetBase?: string): string {
  const html = marked.parse(src, { async: false }) as string;
  if (!assetBase) return html;
  return html.replace(/<img src="(?!https?:|\/)([^"]+)"/g, `<img loading="lazy" src="${assetBase}/$1"`);
}
