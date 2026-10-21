"""Convierte la fuente LaTeX de un paper (papers/<id>/source/) a Markdown con matemáticas.

Conserva: título, autores, resumen, secciones, todas las ecuaciones (numeradas con \\tag),
citas numeradas con su lista de referencias, notas al pie, listas, tablas sencillas y figuras
(PDF/EPS convertidos a PNG en macOS con qlmanage/sips; en otros sistemas se enlazan sin convertir).

Solo se ejecuta sobre papers con licencia abierta (lo comprueba extract.py antes de descargar).

Uso:
  python3 -I library/tools/latex2md.py <id> [<id> ...]
  python3 -I library/tools/latex2md.py --all          # todos los que tengan source/ y no text.en.md
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "papers"
MATH_ENVS = ["equation", "align", "gather", "multline", "eqnarray", "flalign", "alignat", "displaymath", "math"]


def strip_comments(s: str) -> str:
    return re.sub(r"(?<!\\)%.*", "", s)


def read_tex(path: Path, base: Path, depth: int = 0) -> str:
    """Lee un .tex resolviendo \\input y \\include (sin salir de source/)."""
    if depth > 8 or not path.exists():
        return ""
    s = strip_comments(path.read_text(errors="replace"))

    def inc(m: re.Match) -> str:
        name = m.group(2).strip()
        cand = (base / name).resolve()
        if base.resolve() not in cand.parents and cand != base.resolve():
            return ""  # ruta fuera de source/: se ignora
        if not cand.suffix:
            cand = cand.with_suffix(".tex")
        return read_tex(cand, base, depth + 1)

    return re.sub(r"\\(input|include)\{([^}]+)\}", inc, s)


def braced(s: str, i: int) -> tuple[str, int]:
    """Devuelve el contenido del grupo {…} que empieza en s[i] y el índice tras él."""
    if i >= len(s) or s[i] != "{":
        return "", i
    depth, j = 0, i
    while j < len(s):
        c = s[j]
        if c == "\\":
            j += 2
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return s[i + 1 : j], j + 1
        j += 1
    return s[i + 1 :], len(s)


def command_args(s: str, name: str) -> list[str]:
    out, i = [], 0
    pat = re.compile(r"\\" + name + r"\*?\s*(\[[^\]]*\])?\s*\{")
    while (m := pat.search(s, i)) :
        body, i = braced(s, m.end() - 1)
        out.append(body)
    return out


def replace_cmd(s: str, name: str, fn) -> str:
    """Sustituye \\name{arg} (con opcional [..]) aplicando fn(arg), respetando llaves anidadas."""
    pat = re.compile(r"\\" + name + r"\*?\s*(?:\[[^\]]*\])?\s*\{")
    out, i = [], 0
    while (m := pat.search(s, i)):
        out.append(s[i : m.start()])
        body, i = braced(s, m.end() - 1)
        out.append(fn(body))
    out.append(s[i:])
    return "".join(out)


def fix_math(s: str) -> str:
    """Macros de paquetes que Temml no conoce, reescritas en LaTeX estándar."""
    out, i = [], 0
    pat = re.compile(r"\\tensor\*?\s*(\[[^\]]*\])?\s*\{")
    while (m := pat.search(s, i)):
        out.append(s[i : m.start()])
        base, j = braced(s, m.end() - 1)
        while j < len(s) and s[j] == " ":
            j += 1
        idx, j = braced(s, j) if j < len(s) and s[j] == "{" else ("", j)
        pre = m.group(1)[1:-1] if m.group(1) else ""
        pre_tex = ""
        if pre:  # [^a_b] → {}^{a}_{b}
            pre_tex = "{}" + re.sub(r"([\^_])\s*(\\[A-Za-z]+|\{[^}]*\}|.)", lambda k: k.group(1) + ("{" + k.group(2).strip("{}") + "}"), pre)
        out.append(f"{pre_tex}{{{base}}}{idx}")
        i = j
    out.append(s[i:])
    s = "".join(out)
    s = re.sub(r"\\(bm|boldsymbol)\{", r"\\mathbf{", s)
    s = s.replace("\\slashed", "\\not")
    return s


def macros(pre: str) -> dict[str, tuple[int, str]]:
    """\\newcommand, \\renewcommand y \\def sencillos del preámbulo."""
    defs: dict[str, tuple[int, str]] = {}
    for m in re.finditer(r"\\(?:re)?newcommand\*?\s*\{?\\([A-Za-z]+)\}?\s*(?:\[(\d)\])?\s*(?:\[[^\]]*\])?\s*\{", pre):
        body, _ = braced(pre, m.end() - 1)
        defs[m.group(1)] = (int(m.group(2) or 0), body)
    for m in re.finditer(r"\\def\\([A-Za-z]+)\s*\{", pre):
        body, _ = braced(pre, m.end() - 1)
        defs.setdefault(m.group(1), (0, body))
    for m in re.finditer(r"\\DeclareMathOperator\*?\s*\{\\([A-Za-z]+)\}\s*\{", pre):
        body, _ = braced(pre, m.end() - 1)
        defs[m.group(1)] = (0, r"\operatorname{" + body + "}")
    return defs


def expand(s: str, defs: dict[str, tuple[int, str]]) -> str:
    for _ in range(4):
        changed = False
        for name, (n, body) in defs.items():
            pat = re.compile(r"\\" + name + r"(?![A-Za-z])")
            if not pat.search(s):
                continue
            changed = True
            if n == 0:
                s = pat.sub(lambda _m: body.replace("\\", "\\\\").replace("\\\\", "\\"), s)
                continue
            out, i = [], 0
            while (m := pat.search(s, i)):
                out.append(s[i : m.start()])
                j, args = m.end(), []
                for _ in range(n):
                    while j < len(s) and s[j] == " ":
                        j += 1
                    if j < len(s) and s[j] == "{":
                        a, j = braced(s, j)
                    else:
                        a, j = (s[j] if j < len(s) else ""), j + 1
                    args.append(a)
                r = body
                for k, a in enumerate(args, 1):
                    r = r.replace(f"#{k}", a)
                out.append(r)
                i = j
            out.append(s[i:])
            s = "".join(out)
        if not changed:
            break
    return s


def bibliography(src: Path) -> dict[str, str]:
    """Clave → texto de referencia, desde .bbl (preferido) o .bib."""
    refs: dict[str, str] = {}
    for bbl in src.rglob("*.bbl"):
        t = strip_comments(bbl.read_text(errors="replace"))
        for m in re.finditer(r"\\bibitem(?:\[[^\]]*\])?\{([^}]+)\}([\s\S]*?)(?=\\bibitem|\\end\{thebibliography\})", t):
            txt = re.sub(r"\\newblock|\\(?:em|it|bf)\b", " ", m.group(2))
            refs[m.group(1).strip()] = clean_text(txt)
    if refs:
        return refs
    for bib in src.rglob("*.bib"):
        t = bib.read_text(errors="replace")
        for m in re.finditer(r"@(\w+)\s*\{\s*([^,\s]+)\s*,", t):
            if m.group(1).lower() in ("comment", "string", "preamble"):
                continue
            # Campos con llaves anidadas: se recorre a mano hasta cerrar la entrada.
            body, _ = braced(t, t.index("{", m.start()))
            fields: dict[str, str] = {}
            for fm in re.finditer(r"(\w+)\s*=\s*", body):
                j = fm.end()
                if j < len(body) and body[j] == "{":
                    val, _ = braced(body, j)
                elif j < len(body) and body[j] == '"':
                    k = body.find('"', j + 1)
                    val = body[j + 1 : k if k > 0 else len(body)]
                else:
                    val = re.match(r"[^,\n]*", body[j:]).group(0)
                fields.setdefault(fm.group(1).lower(), val)
            parts = [fields.get(k, "") for k in ("author", "title", "journal", "volume", "pages", "year")]
            refs[m.group(2)] = clean_text(", ".join(x for x in parts if x.strip()))
    return refs


def clean_text(s: str) -> str:
    s = re.sub(r"\\(?:textit|emph|textsl)\{([^{}]*)\}", r"*\1*", s)
    s = re.sub(r"\\textbf\{([^{}]*)\}", r"**\1**", s)
    s = re.sub(r"\\(?:url|path)\{([^{}]*)\}", r"\1", s)
    s = re.sub(r"\\href\{([^{}]*)\}\{([^{}]*)\}", r"[\2](\1)", s)
    s = re.sub(r"\\[a-zA-Z]+\*?(?:\[[^\]]*\])?\{([^{}]*)\}", r"\1", s)
    s = re.sub(r"\\[a-zA-Z]+\*?", " ", s)
    s = s.replace("~", " ").replace("{", "").replace("}", "").replace("``", "“").replace("''", "”")
    return re.sub(r"\s+", " ", s).strip()


def convert_figure(src: Path, rel: str, out_dir: Path) -> str | None:
    cands = [src / rel] + [src / (rel + ext) for ext in (".png", ".jpg", ".jpeg", ".pdf", ".eps")]
    f = next((c for c in cands if c.exists() and c.is_file()), None)
    if f is None:
        return None
    out_dir.mkdir(exist_ok=True)
    stem = re.sub(r"[^A-Za-z0-9_.-]", "_", f.stem)
    if f.suffix.lower() in (".png", ".jpg", ".jpeg"):
        dst = out_dir / f"{stem}{f.suffix.lower()}"
        shutil.copyfile(f, dst)
        if shutil.which("sips"):
            subprocess.run(["sips", "-Z", "1600", str(dst)], capture_output=True)
        return dst.name
    dst = out_dir / f"{stem}.png"
    if shutil.which("qlmanage"):
        tmp = out_dir / ".ql"
        tmp.mkdir(exist_ok=True)
        subprocess.run(["qlmanage", "-t", "-s", "1600", "-o", str(tmp), str(f)], capture_output=True)
        made = next(tmp.glob(f.name + ".png"), None)
        if made:
            shutil.move(str(made), dst)
        shutil.rmtree(tmp, ignore_errors=True)
        if dst.exists():
            return dst.name
    return None


def convert(pid: str) -> str:
    d = ROOT / pid
    src = d / "source"
    mains = [p for p in src.rglob("*.tex") if "\\documentclass" in p.read_text(errors="replace")]
    if not mains:
        raise RuntimeError("sin .tex principal")
    main = max(mains, key=lambda p: p.stat().st_size)
    tex = read_tex(main, main.parent)
    pre, _, body = tex.partition("\\begin{document}")
    body = body.split("\\end{document}")[0]
    defs = macros(pre)
    meta_text = (d / "meta.yaml").read_text()
    title = (command_args(pre + body, "title") or [""])[0]
    title = clean_text(title) or re.search(r'^title:\s*"?(.*?)"?$', meta_text, re.M).group(1)
    authors = re.findall(r'^  - "(.*)"$', meta_text, re.M)
    arxiv = (re.search(r'^arxiv:\s*"?([^"\n]+)"?', meta_text, re.M) or [None, ""])[1]
    venue = (re.search(r'^venue:\s*"?(.*?)"?$', meta_text, re.M) or [None, ""])[1]
    lic = (re.search(r"^license:\s*(\S+)", meta_text, re.M) or [None, ""])[1]

    refs = bibliography(src)
    order: dict[str, int] = {}
    labels: dict[str, str] = {}

    s = fix_math(expand(body, defs))
    # Resumen
    abstract = ""
    m = re.search(r"\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}", s)
    if m:
        abstract, s = m.group(1), s.replace(m.group(0), "")
    s = re.sub(r"\\(maketitle|tableofcontents|newpage|clearpage|noindent|centering|small|footnotesize|bigskip|medskip|smallskip|vspace\*?\{[^}]*\}|hspace\*?\{[^}]*\})", "", s)
    s = re.sub(r"\\(title|author|affiliation|address|email|date|keywords|pacs|thanks)\s*(\[[^\]]*\])?\s*\{", lambda m_: "\\DROP{", s)
    s = replace_cmd(s, "DROP", lambda _a: "")

    # Ecuaciones numeradas
    eqn = [0]

    def math_env(m: re.Match) -> str:
        env, star, inner = m.group(1), m.group(2), m.group(3)
        tag = ""
        if not star and env not in ("displaymath", "math"):
            eqn[0] += 1
            tag = f" \\tag{{{eqn[0]}}}"
        for lab in re.findall(r"\\label\{([^}]+)\}", inner):
            labels[lab] = str(eqn[0])
        inner = re.sub(r"\\label\{[^}]+\}|\\nonumber|\\notag", "", inner).strip()
        if env in ("align", "eqnarray", "flalign", "alignat"):
            inner = re.sub(r"^\{\d+\}", "", inner) if env == "alignat" else inner
            inner = inner.replace("&=&", "&=")
            inner = f"\\begin{{aligned}}{inner}\\end{{aligned}}"
        elif env in ("gather", "multline"):
            inner = f"\\begin{{gathered}}{inner}\\end{{gathered}}"
        inner = re.sub(r"\\begin\{split\}([\s\S]*?)\\end\{split\}", r"\\begin{aligned}\1\\end{aligned}", inner)
        return f"\n\n$${inner}{tag}$$\n\n"

    s = re.sub(r"\\begin\{(" + "|".join(MATH_ENVS) + r")(\*?)\}([\s\S]*?)\\end\{\1\2\}", math_env, s)
    s = re.sub(r"\\\[([\s\S]*?)\\\]", lambda m_: f"\n\n$${m_.group(1).strip()}$$\n\n", s)
    s = re.sub(r"\\\(([\s\S]*?)\\\)", r"$\1$", s)
    s = re.sub(r"\$\$([^$]+?)\$\$", lambda m_: f"$${m_.group(1)}$$", s)

    # Secciones
    sec = [0, 0]

    def heading(level: int):
        def f(m_: re.Match) -> str:
            txt, _ = braced(m_.string, m_.end() - 1)
            return f"\n\n{'#' * level} {clean_text(txt)}\n\n"
        return f

    for name, level in (("section", 2), ("subsection", 3), ("subsubsection", 4), ("paragraph", 5)):
        s = replace_cmd(s, name, lambda a, level=level: f"\n\n{'#' * level} {clean_text(a)}\n\n")
    for lab in re.findall(r"\\label\{([^}]+)\}", s):
        labels.setdefault(lab, "")
    s = re.sub(r"\\label\{[^}]+\}", "", s)

    # Figuras
    figs = [0]

    def figure(m: re.Match) -> str:
        inner = m.group(1)
        figs[0] += 1
        caps = command_args(inner, "caption")
        cap = clean_text(caps[0]) if caps else ""
        for lab in re.findall(r"\\label\{([^}]+)\}", inner):
            labels[lab] = str(figs[0])
        imgs = re.findall(r"\\includegraphics\*?(?:\[[^\]]*\])?\{([^}]+)\}", inner)
        md = []
        for rel in imgs:
            name = convert_figure(src, rel.strip(), d / "figures")
            if name:
                md.append(f"![Figura {figs[0]}](figures/{name})")
        return "\n\n" + "\n".join(md) + f"\n\n**Figura {figs[0]}.** {cap}\n\n"

    s = re.sub(r"\\begin\{figure\*?\}([\s\S]*?)\\end\{figure\*?\}", figure, s)

    # Tablas sencillas
    def table(m: re.Match) -> str:
        inner = m.group(1)
        caps = command_args(inner, "caption")
        tab = re.search(r"\\begin\{tabular\}\{[^}]*\}([\s\S]*?)\\end\{tabular\}", inner)
        rows = []
        if tab:
            for row in re.split(r"\\\\", tab.group(1)):
                row = re.sub(r"\\(hline|toprule|midrule|bottomrule|cline\{[^}]*\})", "", row).strip()
                if row:
                    rows.append([c.strip() for c in row.split("&")])
        if not rows:
            return ""
        w = max(len(r) for r in rows)
        rows = [r + [""] * (w - len(r)) for r in rows]
        md = ["| " + " | ".join(rows[0]) + " |", "|" + "---|" * w] + ["| " + " | ".join(r) + " |" for r in rows[1:]]
        cap = f"\n\n**Tabla.** {clean_text(caps[0])}" if caps else ""
        return "\n\n" + "\n".join(md) + cap + "\n\n"

    s = re.sub(r"\\begin\{table\*?\}([\s\S]*?)\\end\{table\*?\}", table, s)

    # Citas, referencias cruzadas y notas
    def cite(a: str) -> str:
        nums = []
        for k in a.split(","):
            k = k.strip()
            if k and k not in order:
                order[k] = len(order) + 1
            if k:
                nums.append(str(order[k]))
        return f"[{', '.join(nums)}]"

    for c in ("cite", "citep", "citet", "onlinecite", "citealp"):
        s = replace_cmd(s, c, cite)
    s = replace_cmd(s, "eqref", lambda a: f"({labels.get(a.strip(), '?')})")
    s = replace_cmd(s, "ref", lambda a: labels.get(a.strip(), "?"))
    notes: list[str] = []

    def footnote(a: str) -> str:
        notes.append(a)
        return f"[^{len(notes)}]"

    s = replace_cmd(s, "footnote", footnote)

    # Listas
    s = re.sub(r"\\begin\{(itemize|enumerate|description)\}(\[[^\]]*\])?", "\n", s)
    s = re.sub(r"\\end\{(itemize|enumerate|description)\}", "\n", s)
    s = re.sub(r"\\item\s*(\[[^\]]*\])?", lambda m_: "\n- " + (f"**{m_.group(1)[1:-1]}** " if m_.group(1) else ""), s)

    # Texto
    def text_only(chunk: str) -> str:
        chunk = re.sub(r"\\(?:textit|emph|textsl)\{([^{}]*)\}", r"*\1*", chunk)
        chunk = re.sub(r"\\textbf\{([^{}]*)\}", r"**\1**", chunk)
        chunk = re.sub(r"\\texttt\{([^{}]*)\}", r"`\1`", chunk)
        chunk = re.sub(r"\\href\{([^{}]*)\}\{([^{}]*)\}", r"[\2](\1)", chunk)
        chunk = re.sub(r"\\url\{([^{}]*)\}", r"<\1>", chunk)
        chunk = re.sub(r"\\begin\{(acknowledgments?|acknowledgements?)\}", "\n\n## Acknowledgements\n\n", chunk)
        chunk = re.sub(r"\\(begin|end)\{[a-zA-Z*]+\}(\{[^}]*\})?(\[[^\]]*\])?", "", chunk)
        chunk = re.sub(r"\\(appendix|bibliographystyle\{[^}]*\}|bibliography\{[^}]*\})", "", chunk)
        chunk = re.sub(r"\\[a-zA-Z]+\*?(?:\[[^\]]*\])?\{([^{}]*)\}", r"\1", chunk)
        chunk = re.sub(r"\\(?:[a-zA-Z]+)\*?", "", chunk)
        chunk = chunk.replace("~", " ").replace("``", "“").replace("''", "”").replace("\\%", "%").replace("\\&", "&").replace("\\_", "_")
        chunk = chunk.replace("{", "").replace("}", "")
        return chunk

    parts = re.split(r"(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$|!\[[^\]]*\]\([^)]*\))", s)
    s = "".join(p if p.startswith("$") or p.startswith("![") else text_only(p) for p in parts)
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n[ \t]+", "\n", s)
    s = re.sub(r"^#{1,6}\s*$", "", s, flags=re.M)  # encabezados vacíos (\\paragraph{})
    s = re.sub(r"\n{3,}", "\n\n", s).strip()

    head = [f"# {title}", "", ", ".join(authors), "",
            f"> Fuente original: https://arxiv.org/abs/{arxiv}" if arxiv else "> Fuente original: ver ficha",
            f"> Publicación: {venue}", f"> Licencia: {lic}. © Los autores.",
            "> Conversión automática desde la fuente LaTeX (library/tools/latex2md.py). Revisar antes de citar.", ""]
    out = "\n".join(head)
    if abstract:
        parts = re.split(r"(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)", expand(abstract, defs))
        out += "\n## Abstract\n\n" + re.sub(r"\s+", " ", "".join(p if p.startswith("$") else text_only(p) for p in parts)).strip() + "\n"
    out += "\n" + s + "\n"
    if notes:
        out += "\n" + "\n".join(f"[^{i}]: {clean_text(n)}" for i, n in enumerate(notes, 1)) + "\n"
    if order:
        out += "\n## References\n\n" + "\n".join(f"{n}. {refs.get(k, k)}" for k, n in sorted(order.items(), key=lambda kv: kv[1])) + "\n"
    (d / "text.en.md").write_text(out)
    meta = re.sub(r"^fulltext:.*$", "fulltext: auto", meta_text, flags=re.M)
    (d / "meta.yaml").write_text(meta)
    return f"{eqn[0]} ecuaciones, {figs[0]} figuras, {len(order)} citas"


def main() -> int:
    ids = sys.argv[1:]
    if ids == ["--all"]:
        ids = [p.name for p in ROOT.iterdir() if (p / "source").exists() and not (p / "text.en.md").exists()]
    errors = 0
    for pid in sorted(ids):
        try:
            print(f"ok {pid:<28} {convert(pid)}")
        except Exception as exc:  # cada paper falla por separado y se informa
            print(f"!  {pid:<28} {exc}")
            errors += 1
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
