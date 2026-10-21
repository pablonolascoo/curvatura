"""Ficha de análisis de cada paper, escrita por IA a partir del texto completo: library/papers/<id>/analisis.yaml

Qué aporta, supuestos, resultados con cifras, ecuaciones clave, limitaciones, obstáculos del proyecto que
ataca (docs/obstaculos.md, 1–14), relación con otros papers e ideas abiertas. Es texto propio (no copia
del paper), así que se publica con la biblioteca, marcado como generado por IA. Se vectoriza como tipo «ficha».

  curvatura-ia fichas contexto <id>          texto compacto del paper para quien escribe la ficha
  curvatura-ia fichas generar [--relevancia alta] [--max N] [ids…]   con el modelo configurado
  curvatura-ia fichas validar [ids…]         comprueba el formato de las fichas escritas
  curvatura-ia fichas pobres [--relevancia alta]   fichas sin texto completo que ya pueden rehacerse
"""

from __future__ import annotations

import json
import re
import sys
import time

from .rutas import ANALISIS, PAPERS

PLANTILLA = """generado: "IA · {fecha} · puede contener errores; verificar con el paper"
aportacion: "Una o dos frases: qué demuestra, propone o mide."
tipo: solucion  # solucion | teorema | cota | simulacion | experimento | revision | propuesta | critica
supuestos:
  - "…"
resultados:
  - "… (con cifras y unidades si las hay)"
ecuaciones_clave:
  - n: 12            # número de ecuación en el análisis
    latex: '…'
    significado: "…"
limitaciones:
  - "…"
obstaculos: [1, 3]   # docs/obstaculos.md: 1 NEC · 2 aceleración · 3 energía negativa/QEI · 4 horizontes · 5 inestabilidad semiclásica · 6 masa subluminal · 7 materia/EoS · 8 tensiones/estabilidad · 9 Casimir · 10 partículas/frenado · 11 gravedad modificada · 12 relatividad numérica · 13 verificación de condiciones · 14 análogos de laboratorio
relacion:
  - paper: alcubierre-1994   # id de la biblioteca si aparece en las referencias
    como: "extiende | critica | corrige | aplica | compara"
ideas_abiertas:
  - "Qué queda por hacer o qué variante podría probarse."
"""
CLAVES = ["generado", "aportacion", "tipo", "supuestos", "resultados", "ecuaciones_clave", "limitaciones", "obstaculos", "relacion", "ideas_abiertas"]


def contexto(pid: str, palabras: int = 7000) -> str:
    f = ANALISIS / f"{pid}.json"
    if not f.exists():
        return f"(sin análisis de {pid})"
    a = json.loads(f.read_text())
    out = [f"ID: {pid}", f"Título: {a.get('title')}", f"Autores: {', '.join((a.get('authors') or [])[:12])}",
           f"Año: {a.get('year')} · Revista: {a.get('venue')} · Licencia: {a.get('license')} · Fuente del texto: {a.get('source')}"]
    for idioma, r in (a.get("abstracts") or {}).items():
        if idioma in ("en", a.get("language")):
            out.append(f"\nResumen ({idioma}): {r}")
    restante = palabras
    secciones = a.get("sections") or []
    por_seccion = max(150, palabras // max(1, len(secciones)))
    for s in secciones:
        if restante <= 0:
            break
        trozo = " ".join((s.get("text") or "").split()[:min(por_seccion, restante)])
        restante -= len(trozo.split())
        out.append(f"\n## {s.get('title')}\n{trozo}")
    eqs = a.get("equations") or []
    if eqs:
        tope = 120
        sel = eqs if len(eqs) <= tope else [eqs[round(i * (len(eqs) - 1) / (tope - 1))] for i in range(tope)]
        out.append(f"\n## Ecuaciones ({len(eqs)} en total; se muestran {len(sel)} repartidas por el texto)")
        for e in sel:
            out.append(f"[{e['n']}] ({(e.get('section') or '')[:40]}) {' '.join(e['latex'].split())[:220]}")
    figs = a.get("figures") or []
    if figs:
        out.append("\n## Figuras")
        out += [f"Figura {g['n']}: {g.get('caption', '')[:300]}" for g in figs[:20]]
    ids = {p.name for p in PAPERS.iterdir()}
    refs = [r["text"] for r in a.get("references") or []]
    out.append(f"\n## Referencias ({len(refs)}); ids de la biblioteca que pueden corresponder se deducen por autor y año")
    out += [f"- {r[:200]}" for r in refs[:60]]
    out.append(f"\n(La biblioteca tiene {len(ids)} papers; usa ids con formato apellido-año si coinciden.)")
    return "\n".join(out)


def validar(pid: str) -> list[str]:
    import yaml

    f = PAPERS / pid / "analisis.yaml"
    if not f.exists():
        return ["no existe"]
    try:
        d = yaml.safe_load(f.read_text())
    except Exception as exc:
        return [f"YAML inválido: {exc}"]
    errores = [f"falta «{k}»" for k in CLAVES if k not in (d or {})]
    if d and not isinstance(d.get("obstaculos"), list):
        errores.append("obstaculos debe ser una lista de números")
    elif d and any(not isinstance(o, int) or not 1 <= o <= 14 for o in d["obstaculos"]):
        errores.append("obstaculos fuera de 1–14")
    return errores


def generar(pid: str) -> str:
    from .agente import MODELO_SUB, proveedor

    prov = proveedor()
    sistema = ("Eres un físico teórico que escribe fichas de análisis rigurosas y concisas en español. Solo afirmas lo que "
               "está en el texto. Respondes únicamente con YAML válido según la plantilla, sin ``` ni comentarios.")
    pedido = (f"Plantilla:\n{PLANTILLA.format(fecha=time.strftime('%Y-%m-%d'))}\n\nPaper:\n{contexto(pid)}\n\n"
              "Escribe la ficha. Entre 2 y 6 elementos por lista. Ecuaciones clave: 2–5 del listado, copiando el LaTeX.")
    bloques, _ = prov.llamar(MODELO_SUB, sistema, [{"role": "user", "content": pedido}], [], max_tokens=4000)
    texto = "".join(b.get("text", "") for b in bloques if b["type"] == "text").strip().removeprefix("```yaml").removesuffix("```")
    (PAPERS / pid / "analisis.yaml").write_text(texto.strip() + "\n")
    return "ok" if not validar(pid) else "inválida"


def main() -> int:
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 1
    orden, resto = args[0], args[1:]
    ids = [a for a in resto if not a.startswith("--") and not a.isdigit() and a not in ("alta", "media", "baja")]
    if orden == "contexto":
        print(contexto(ids[0]))
        return 0
    if not ids:
        rel = resto[resto.index("--relevancia") + 1] if "--relevancia" in resto else None
        ids = sorted(p.parent.name for p in PAPERS.glob("*/meta.yaml")
                     if not rel or f"relevance: {rel}" in p.read_text())
    if orden == "pobres":  # fichas hechas sin texto completo que ya podrían rehacerse con él
        for p in ids:
            f = PAPERS / p / "analisis.yaml"
            a = ANALISIS / f"{p}.json"
            if f.exists() and a.exists() and re.search(r"solo con el (t[ií]tulo|resumen)", f.read_text(), re.I):
                if json.loads(a.read_text()).get("sections"):
                    print(p)
        return 0
    if orden == "validar":
        hechas = [p for p in ids if (PAPERS / p / "analisis.yaml").exists()]
        malas = {p: e for p in hechas if (e := validar(p))}
        print(f"{len(hechas)} fichas · {len(malas)} con problemas")
        for p, e in malas.items():
            print(f"  {p}: {'; '.join(e)}")
        return 1 if malas else 0
    if orden == "generar":
        maximo = int(resto[resto.index("--max") + 1]) if "--max" in resto else 10**9
        pend = [p for p in ids if not (PAPERS / p / "analisis.yaml").exists()][:maximo]
        for i, p in enumerate(pend, 1):
            try:
                print(f"{i}/{len(pend)} {p}: {generar(p)}", flush=True)
            except Exception as exc:
                print(f"{i}/{len(pend)} {p}: error {exc}", flush=True)
        return 0
    print(__doc__)
    return 1


if __name__ == "__main__":
    sys.exit(main())
