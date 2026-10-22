"""Limpia los resúmenes (abstract.*.md, resumen.*.md) de restos de las editoriales.

  1. Etiqueta inicial redundante: «Abstract», «A bstract», «Resumen», «Résumé», «Summary», «摘要»…
  2. Fórmulas en mitad de la frase escritas como $$…$$ (Springer, OpenAlex): pasan a $…$ (en línea).
  3. Copia en texto plano que la editorial pone detrás de cada fórmula («$$\\lambda _c$$ λ c …»): se quita
     comparando, carácter a carácter y sin espacios, con la fórmula LaTeX leída como texto.

Uso: python3 -I library/tools/limpiar_resumenes.py [--dry]
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "papers"

ETIQUETA = re.compile(r"^\s*(?:A\s?bstract|ABSTRACT|Abstract|Resumen|RESUMEN|R[ée]sum[ée]|RÉSUMÉ|Summary|SUMMARY|摘要)\s*[:.—-]?\s+")
GRIEGO = {
    "alpha": "α", "beta": "β", "gamma": "γ", "delta": "δ", "epsilon": "ε", "varepsilon": "ε", "zeta": "ζ", "eta": "η",
    "theta": "θ", "vartheta": "θ", "iota": "ι", "kappa": "κ", "lambda": "λ", "mu": "μ", "nu": "ν", "xi": "ξ", "pi": "π",
    "rho": "ρ", "sigma": "σ", "tau": "τ", "upsilon": "υ", "phi": "φ", "varphi": "φ", "chi": "χ", "psi": "ψ", "omega": "ω",
    "Gamma": "Γ", "Delta": "Δ", "Theta": "Θ", "Lambda": "Λ", "Xi": "Ξ", "Pi": "Π", "Sigma": "Σ", "Phi": "Φ", "Psi": "Ψ",
    "Omega": "Ω", "ell": "ℓ", "hbar": "ℏ", "infty": "∞", "partial": "∂", "nabla": "∇", "le": "≤", "leq": "≤", "ge": "≥",
    "geq": "≥", "ne": "≠", "neq": "≠", "approx": "≈", "sim": "∼", "simeq": "≃", "times": "×", "cdot": "·", "pm": "±",
    "to": "→", "rightarrow": "→", "propto": "∝", "in": "∈", "equiv": "≡", "prime": "′",
}


def como_texto(tex: str) -> str:
    """LaTeX → secuencia aproximada de caracteres visibles, sin espacios (para reconocer la copia plana)."""
    s = re.sub(r"\\(?:mathrm|text|mathbf|mathit|mathcal|operatorname|boldsymbol|mathsf|rm|bf|it)\s*", "", tex)
    s = re.sub(r"\\([A-Za-z]+)", lambda m: GRIEGO.get(m.group(1), ""), s)
    s = re.sub(r"[{}\\^_$\s]|\\[,;:! ]", "", s)
    return s


def quitar_copia(resto: str, objetivo: str) -> str:
    """Si `resto` empieza por la copia plana de la fórmula, la quita (tolerando espacios y algún carácter de más)."""
    if len(objetivo) < 1:
        return resto
    i = j = 0
    while i < len(resto) and j < len(objetivo):
        c = resto[i]
        if c.isspace():
            i += 1
            continue
        if c == objetivo[j]:
            i += 1
            j += 1
            continue
        # la copia plana a veces omite símbolos (√) o los escribe distinto: se salta un carácter del objetivo
        if j + 1 < len(objetivo) and c == objetivo[j + 1]:
            j += 1
            continue
        break
    if j >= max(1, int(len(objetivo) * 0.7)):
        return resto[i:]
    return resto


def limpiar(texto: str) -> str:
    return limpiar_desde("", ETIQUETA.sub("", texto, count=1))


def limpiar_desde(hecho: str, resto: str) -> str:
    m = re.search(r"\$\$(.+?)\$\$", resto)
    if not m:
        return hecho + resto
    tex = m.group(1).strip()
    previo = (hecho + resto[:m.start()])
    en_linea = bool(previo) and previo[-1] != "\n"
    hecho += resto[:m.start()] + (f"${tex}$" if en_linea else m.group(0))
    return limpiar_desde(hecho, quitar_copia(resto[m.end():], como_texto(tex)))


def main() -> int:
    dry = "--dry" in sys.argv
    cambiados = 0
    for f in sorted(list(ROOT.glob("*/abstract.*.md")) + list(ROOT.glob("*/resumen.*.md"))):
        t = f.read_text()
        n = limpiar(t)
        if n != t:
            cambiados += 1
            if dry:
                print(f"--- {f.parent.name}/{f.name}\n  antes: {t[:160]!r}\n  ahora: {n[:160]!r}")
            else:
                f.write_text(n)
    print(f"Resúmenes limpiados: {cambiados}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
