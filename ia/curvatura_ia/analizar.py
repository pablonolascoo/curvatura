"""Análisis estructurado de cada paper: secciones, ecuaciones, figuras y referencias.

Fuentes, por orden de calidad:
  1. LaTeX de arXiv (datos/corpus/<id>/source o library/papers/<id>/source): ecuaciones exactas.
  2. PDF (datos/corpus/<id>/paper.pdf): texto por página e imágenes incrustadas.
  3. Solo ficha: título y resúmenes de la biblioteca.

Salida: datos/analisis/<id>.json y datos/figuras/<id>/*.png

Uso:
  uv run --project ia python -m curvatura_ia.analizar [id ...]   # sin ids: todos los pendientes
  ... --forzar                                                    # rehace aunque exista
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

from .rutas import ANALISIS, CORPUS, FIGURAS, PAPERS, TOOLS

sys.path.insert(0, str(TOOLS))
sys.path.insert(0, str(TOOLS.parent / "rag"))
import latex2md as L  # noqa: E402
from common import read_meta  # noqa: E402

VERSION = 3
MATH_ENVS = r"equation|align|gather|multline|eqnarray|flalign|alignat|displaymath|split"
SECCION = re.compile(r"\\(section|subsection|subsubsection|paragraph)\*?\s*(?:\[[^\]]*\])?\s*\{")
MATH = re.compile(
    r"\\begin\{(" + MATH_ENVS + r")(\*?)\}([\s\S]*?)\\end\{\1\2\}|\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$"
)
FIGURA = re.compile(r"\\begin\{(figure|wrapfigure|SCfigure)\*?\}([\s\S]*?)\\end\{\1\*?\}")
TABLA = re.compile(r"\\begin\{table\*?\}([\s\S]*?)\\end\{table\*?\}")
IMG_EXT = (".png", ".jpg", ".jpeg", ".pdf", ".eps", ".ps")


# ---------------------------------------------------------------- utilidades

_ACENTOS = {"'": "\u0301", "`": "\u0300", "^": "\u0302", '"': "\u0308", "~": "\u0303", "c": "\u0327", "v": "\u030c", "=": "\u0304"}


def acentos(s: str) -> str:
    """\\'a, \\"o, \\~n, \\c{c}, {\\'e}… a caracteres Unicode; «\\ » a espacio."""
    import unicodedata

    def rep(m: re.Match) -> str:
        return unicodedata.normalize("NFC", m.group(2) + _ACENTOS[m.group(1)])
    s = re.sub(r"\{?\\(['`^\"~=]|c |v )\s*\{?([A-Za-z])\}?\}?", lambda m: rep(re.match(r"(.)(.)", m.group(1).strip() + m.group(2))), s)
    s = re.sub(r"\\([cv])(?:\{([A-Za-z])\}|\s+([A-Za-z]))", lambda m: unicodedata.normalize("NFC", (m.group(2) or m.group(3)) + _ACENTOS[m.group(1)]), s)
    s = re.sub(r"\\([io])\b", r"\1", s)
    return re.sub(r"\\ ", " ", s)


def texto_plano(s: str) -> str:
    """LaTeX de prosa a texto legible conservando las matemáticas en línea ($…$)."""
    trozos = re.split(r"(\$[^$]+\$|\\\([\s\S]*?\\\))", s)
    out = []
    for t in trozos:
        if t.startswith("$") or t.startswith("\\("):
            out.append(t if t.startswith("$") else "$" + t[2:-2] + "$")
        else:
            t = re.sub(r"\\(?:cite|citep|citet|citealp)\*?(?:\[[^\]]*\])*\{([^}]*)\}", r"[\1]", t)
            t = re.sub(r"\\(?:eqref|ref|autoref|cref|Cref)\{([^}]*)\}", r"(\1)", t)
            t = re.sub(r"\\label\{[^}]*\}", "", t)
            t = re.sub(r"\\begin\{(itemize|enumerate|description)\}|\\end\{(itemize|enumerate|description)\}", "\n", t)
            t = t.replace("\\item", "\n- ")
            out.append(L.clean_text(acentos(t)))
    return re.sub(r"[ \t]+", " ", " ".join(out)).strip()


def principal(src: Path) -> Path | None:
    mains = [p for p in src.rglob("*.tex") if re.search(r"\\document(class|style)|\\begin\{document\}", p.read_text(errors="replace"))]
    return max(mains, key=lambda p: p.stat().st_size) if mains else None


def a_png(f: Path, destino: Path, ancho: int = 1600) -> Path | None:
    """Imagen o PDF/EPS a PNG (multiplataforma: Pillow + pypdfium2; EPS con Ghostscript si existe)."""
    from PIL import Image

    destino.parent.mkdir(parents=True, exist_ok=True)
    suf = f.suffix.lower()
    try:
        if suf in (".png", ".jpg", ".jpeg"):
            im = Image.open(f)
        elif suf == ".pdf":
            import pypdfium2 as pdfium

            doc = pdfium.PdfDocument(str(f))
            page = doc[0]
            w = page.get_width() or 1
            im = page.render(scale=min(4.0, max(1.0, ancho / w))).to_pil()
            doc.close()
        elif suf in (".eps", ".ps") and shutil.which("gs"):
            tmp = destino.with_suffix(".tmp.png")
            subprocess.run(["gs", "-q", "-dSAFER", "-dBATCH", "-dNOPAUSE", "-dEPSCrop", "-sDEVICE=png16m", "-r200",
                            f"-sOutputFile={tmp}", str(f)], capture_output=True, timeout=60)
            if not tmp.exists():
                return None
            im = Image.open(tmp)
            tmp.unlink()
        else:
            return None
        im = im.convert("RGB")
        im.thumbnail((ancho, ancho))
        im.save(destino, "PNG", optimize=True)
        return destino
    except Exception:
        return None


def buscar_imagen(src: Path, rel: str, graphicspath: list[str]) -> Path | None:
    rel = rel.strip().strip('"').strip("'")
    for base in [src, *[src / g for g in graphicspath]]:
        for c in [base / rel, *[base / (rel + e) for e in IMG_EXT]]:
            if c.is_file() and src.resolve() in c.resolve().parents:
                return c
    return None


# ---------------------------------------------------------------- LaTeX


def desde_latex(pid: str, src: Path) -> dict:
    main = principal(src)
    if main is None:
        raise RuntimeError("sin .tex principal")
    tex = L.read_tex(main, main.parent)
    pre, _, body = tex.partition("\\begin{document}")
    body = body.split("\\end{document}")[0]
    defs = L.macros(pre)
    body = L.fix_math(L.expand(body, defs))
    gpath = re.findall(r"\{([^{}]+)\}", (re.search(r"\\graphicspath\{((?:\{[^}]*\})+)\}", pre) or [None, ""])[1])
    refs = L.bibliography(src)
    if not refs:  # bibliografía escrita a mano dentro del .tex
        for mb in re.finditer(r"\\bibitem(?:\[[^\]]*\])?\{([^}]+)\}([\s\S]*?)(?=\\bibitem|\\end\{thebibliography\})", body):
            refs[mb.group(1).strip()] = L.clean_text(re.sub(r"\\newblock", " ", mb.group(2)))

    resumen = ""
    m = re.search(r"\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}", body)
    if m:
        resumen = texto_plano(m.group(1))
        body = body[: m.start()] + body[m.end():]
    body = re.split(r"\\begin\{thebibliography\}|\\bibliography\{", body)[0]

    # Figuras: se extraen antes para que no ensucien el texto.
    figuras, fig_dir = [], FIGURAS / pid
    def figura(mf: re.Match) -> str:
        cuerpo = mf.group(2)
        cap = L.command_args(cuerpo, "caption")
        lab = re.search(r"\\label\{([^}]+)\}", cuerpo)
        archivos = []
        for rel in L.command_args(cuerpo, "includegraphics"):
            f = buscar_imagen(src, rel, gpath)
            if f is None:
                continue
            dst = fig_dir / f"{len(figuras) + 1:02d}-{len(archivos) + 1}.png"
            if a_png(f, dst):
                archivos.append(dst.name)
        n = len(figuras) + 1
        figuras.append({"n": n, "label": lab.group(1) if lab else None,
                        "caption": texto_plano(cap[0]) if cap else "", "files": archivos})
        return f"\n[Figura {n}]\n"
    body = FIGURA.sub(figura, body)

    tablas = []
    def tabla(mt: re.Match) -> str:
        cap = L.command_args(mt.group(1), "caption")
        tablas.append({"n": len(tablas) + 1, "caption": texto_plano(cap[0]) if cap else "",
                       "latex": re.sub(r"\\caption\{[\s\S]*?\}\s*", "", mt.group(1)).strip()[:6000]})
        return f"\n[Tabla {len(tablas)}]\n"
    body = TABLA.sub(tabla, body)

    # Secciones y ecuaciones.
    cortes = [(0, 0, "Inicio")]
    for ms in SECCION.finditer(body):
        titulo, _ = L.braced(body, ms.end() - 1)
        nivel = {"section": 1, "subsection": 2, "subsubsection": 3, "paragraph": 4}[ms.group(1)]
        cortes.append((ms.start(), nivel, L.clean_text(acentos(titulo))))
    cortes.append((len(body), 0, ""))

    secciones, ecuaciones = [], []
    for (ini, nivel, titulo), (fin, _, _) in zip(cortes, cortes[1:]):
        trozo = body[ini:fin]
        if ini:  # quita «\section{Título}» (la expresión ya consumió la llave de apertura)
            ms = SECCION.match(trozo)
            if ms:
                _, j = L.braced(trozo, ms.end() - 1)
                trozo = trozo[j:]
        partes, pos = [], 0
        for me in MATH.finditer(trozo):
            partes.append(trozo[pos:me.start()])
            latex = (me.group(3) or me.group(4) or me.group(5) or "").strip()
            lab = re.search(r"\\label\{([^}]+)\}", latex)
            latex = re.sub(r"\\label\{[^}]*\}|\\nonumber|\\notag", "", latex).strip()
            if latex:
                n = len(ecuaciones) + 1
                ecuaciones.append({"n": n, "label": lab.group(1) if lab else None, "env": me.group(1) or "display",
                                   "latex": latex, "section": titulo, "before": "", "after": ""})
                partes.append(f" [Ec. {n}] ")
            pos = me.end()
        partes.append(trozo[pos:])
        texto = texto_plano("".join(partes))
        for mc in re.finditer(r"\[Ec\. (\d+)\]", texto):  # contexto desde el texto ya limpio
            e = ecuaciones[int(mc.group(1)) - 1]
            e["before"] = texto[max(0, mc.start() - 400):mc.start()].strip()
            e["after"] = texto[mc.end():mc.end() + 300].strip()
        if texto or titulo:
            secciones.append({"title": titulo, "level": nivel, "text": texto})

    return {"source": "latex", "abstract": resumen, "sections": secciones, "equations": ecuaciones,
            "figures": figuras, "tables": tablas, "references": [{"key": k, "text": acentos(v)} for k, v in refs.items()]}


# ---------------------------------------------------------------- PDF


def desde_pdf(pid: str, pdf: Path) -> dict:
    import pypdfium2 as pdfium
    import pypdfium2.raw as raw

    doc = pdfium.PdfDocument(str(pdf))
    paginas, figuras = [], []
    fig_dir = FIGURAS / pid
    for i, page in enumerate(doc):
        tp = page.get_textpage()
        texto = tp.get_text_range()
        paginas.append(texto)
        for obj in page.get_objects(filter=[raw.FPDF_PAGEOBJ_IMAGE], max_depth=2):
            try:
                w, h = obj.get_size()
                if w < 120 or h < 80:
                    continue
                img = obj.get_bitmap(render=True).to_pil().convert("RGB")
                img.thumbnail((1600, 1600))
                dst = fig_dir / f"p{i + 1:03d}-{len(figuras) + 1:02d}.png"
                dst.parent.mkdir(parents=True, exist_ok=True)
                img.save(dst, "PNG", optimize=True)
                cap = re.search(r"(?:Fig\.|Figure|FIG\.|图)\s*\d+[.:]?\s*([^\n]{10,400})", texto)
                figuras.append({"n": len(figuras) + 1, "label": None, "page": i + 1,
                                "caption": cap.group(0).strip() if cap else "", "files": [dst.name]})
            except Exception:
                continue
    doc.close()
    secciones = [{"title": f"Página {i + 1}", "level": 1, "text": re.sub(r"\s+", " ", t).strip()}
                 for i, t in enumerate(paginas) if t.strip()]
    texto = "\n".join(paginas)
    corte = re.search(r"\n\s*(References|REFERENCES|Bibliography|参考文献)\s*\n", texto)
    refs = []
    if corte:
        refs = [{"key": str(k + 1), "text": r.strip()} for k, r in
                enumerate(re.split(r"\n\s*\[?\d{1,3}[\].]\s+", texto[corte.end():])) if len(r.strip()) > 20][:400]
    return {"source": "pdf", "abstract": "", "sections": secciones, "equations": [], "figures": figuras,
            "tables": [], "references": refs}


# ---------------------------------------------------------------- orquestación


def ficha(pid: str) -> dict:
    d = PAPERS / pid
    meta = read_meta(d / "meta.yaml")
    resumenes = {p.stem.split(".")[1]: p.read_text().strip() for p in d.glob("abstract.*.md")} \
        or {p.stem.split(".")[1]: p.read_text().strip() for p in d.glob("resumen.*.md")}
    return {"id": pid, "title": meta.get("title"), "authors": meta.get("authors") or [], "year": meta.get("year"),
            "venue": meta.get("venue"), "doi": meta.get("doi"), "arxiv": meta.get("arxiv"), "source_url": meta.get("source"),
            "license": meta.get("license"), "countries": meta.get("countries") or [], "subsystems": meta.get("subsystems") or [],
            "kind": meta.get("kind"), "relevance": meta.get("relevance"), "language": meta.get("language") or "en",
            "abstracts": resumenes}


def analizar(pid: str, forzar: bool = False) -> str:
    out = ANALISIS / f"{pid}.json"
    if out.exists() and not forzar:
        try:
            if json.loads(out.read_text()).get("version") == VERSION:
                return "ya"
        except Exception:
            pass
    base = ficha(pid)
    cuerpo = None
    for src in (CORPUS / pid / "source", PAPERS / pid / "source"):
        if src.is_dir():
            try:
                cuerpo = desde_latex(pid, src)
                break
            except Exception as exc:
                base["latex_error"] = str(exc)[:200]
    pdf = CORPUS / pid / "paper.pdf"
    if (cuerpo is None or not cuerpo["sections"]) and pdf.exists():
        try:
            cuerpo = desde_pdf(pid, pdf)
        except Exception as exc:
            base["pdf_error"] = str(exc)[:200]
    if cuerpo is None:
        cuerpo = {"source": "ficha", "abstract": "", "sections": [], "equations": [], "figures": [], "tables": [], "references": []}
    out.write_text(json.dumps({"version": VERSION, **base, **cuerpo}, ensure_ascii=False))
    return cuerpo["source"]


def _uno(pid: str, forzar: bool) -> tuple[str, str]:
    try:
        return pid, analizar(pid, forzar)
    except Exception as exc:
        return pid, f"error {exc}"


def main() -> int:
    forzar = "--forzar" in sys.argv
    ids = [a for a in sys.argv[1:] if not a.startswith("--")] or sorted(p.parent.name for p in PAPERS.glob("*/meta.yaml"))
    cuenta: dict[str, int] = {}
    with ProcessPoolExecutor() as ex:
        futs = [ex.submit(_uno, pid, forzar) for pid in ids]
        for i, f in enumerate(as_completed(futs), 1):
            pid, r = f.result()
            cuenta[r.split()[0]] = cuenta.get(r.split()[0], 0) + 1
            if r.startswith("error"):
                print(f"!  {pid}: {r}", flush=True)
            if i % 200 == 0:
                print(f"   {i}/{len(ids)} {cuenta}", flush=True)
    print(f"Análisis: {cuenta}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
