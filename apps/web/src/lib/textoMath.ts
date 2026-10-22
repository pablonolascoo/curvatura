import temml from "temml";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Texto plano con fórmulas LaTeX en línea ($…$ o $$…$$ dentro de la frase) → HTML seguro con MathML.
 * Sirve en el cliente (visor de papers) y en el servidor. Una fórmula que no compila se deja como código.
 */
export function textoConFormulas(texto: string): string {
  return texto
    .split(/(\$\$[^$]+\$\$|\$[^$\n]+\$)/g)
    .map((parte) => {
      const m = /^\$\$?([^$]+?)\$\$?$/.exec(parte);
      if (!m) return esc(parte);
      try {
        return temml.renderToString(m[1].trim(), { displayMode: false, throwOnError: true });
      } catch {
        return `<code class="math-error">${esc(m[1])}</code>`;
      }
    })
    .join("");
}
