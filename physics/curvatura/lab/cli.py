"""curvatura-lab: generar y comprobar fórmulas desde la terminal (salida legible o --json).

  igual     "a = b"                      ¿son iguales? (symengine → mpmath → sympy)
  unidades  "E = m*c^2" m=masa c=velocidad E=energia
  cota      "expr" x=0:1 y=-2:2 [--signo "<=0"]     cotas rigurosas (Arb) y signo demostrado
  z3        "a^2+b^2 >= 2*a*b" [--si "a>0"]          demostración exacta (Z3)
  banco     "expr" [--n 1000000]                    velocidad numpy frente a numba
  tensor    alcubierre [--comparar "ρ del paper"]   Einstein, densidad euleriana y contraste
  descubrir datos.csv --y columna                   regresión simbólica (rápida o PySR)
  biblioteca                                        lee y evalúa todas las ecuaciones de library/equations
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def _pares(items: list[str]) -> dict[str, str]:
    return dict(i.split("=", 1) for i in items if "=" in i)


def _rangos(items: list[str]) -> dict[str, tuple[float, float]]:
    out = {}
    for k, v in _pares(items).items():
        a, b = v.split(":")
        out[k] = (float(a), float(b))
    return out


def _salida(d, como_json: bool) -> None:
    if como_json:
        print(json.dumps(d, ensure_ascii=False, default=str, indent=2))
        return
    if isinstance(d, dict):
        for k, v in d.items():
            print(f"{k:>22}: {v}")
    else:
        for r in d:
            print(r)


def biblioteca() -> list[dict]:
    import re

    import numpy as np

    from .expr import leer
    from .rapido import evaluar

    raiz = Path(__file__).resolve().parents[3] / "library" / "equations"
    out = []
    for f in sorted(raiz.glob("*.yaml")):
        m = re.search(r'^expr:\s*"(.*)"\s*$', f.read_text(), re.M)
        if not m:
            continue
        expr = m.group(1).replace('\\"', '"')
        r = {"id": f.stem, "expr": expr}
        try:
            e = leer(expr)
            rhs = e.rhs if hasattr(e, "rhs") else e
            syms = sorted(rhs.free_symbols, key=lambda s: s.name)
            r["simbolos"] = [s.name for s in syms]
            if rhs.atoms(__import__("sympy").core.function.AppliedUndef) or rhs.has(__import__("sympy").Integral):
                r["estado"] = "leída (contiene funciones o integrales: se evalúa en la web)"
            else:
                v = evaluar(rhs, {s.name: np.linspace(0.1, 0.9, 1000) for s in syms})
                r["estado"] = "ok" if np.all(np.isfinite(v)) else "valores no finitos en [0.1, 0.9]"
        except Exception as exc:
            r["estado"] = f"error: {exc}"[:200]
        out.append(r)
    return out


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="curvatura-lab", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--json", action="store_true")
    sub = p.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("igual"); a.add_argument("formula"); a.add_argument("otra", nargs="?"); a.add_argument("--puntos", type=int, default=24)
    a = sub.add_parser("unidades"); a.add_argument("formula"); a.add_argument("dims", nargs="*"); a.add_argument("--geometricas", action="store_true")
    a = sub.add_parser("cota"); a.add_argument("formula"); a.add_argument("dominio", nargs="+"); a.add_argument("--signo"); a.add_argument("--max-cajas", type=int, default=20000)
    a = sub.add_parser("z3"); a.add_argument("objetivo"); a.add_argument("--si", action="append", default=[])
    a = sub.add_parser("banco"); a.add_argument("formula"); a.add_argument("--n", type=int, default=1_000_000)
    a = sub.add_parser("tensor"); a.add_argument("metrica"); a.add_argument("--comparar", help="fórmula de ρ a contrastar (usa x, y, z, t, v, f)")
    a = sub.add_parser("descubrir"); a.add_argument("csv"); a.add_argument("--y", required=True); a.add_argument("--motor", default="rapido")
    sub.add_parser("biblioteca")
    args = p.parse_args(argv)

    if args.cmd == "igual":
        from .igualdad import iguales
        _salida(iguales(args.formula, args.otra, puntos=args.puntos).dict(), args.json)
    elif args.cmd == "unidades":
        from .unidades import comprobar
        _salida(comprobar(args.formula, _pares(args.dims), args.geometricas), args.json)
    elif args.cmd == "cota":
        from .cotas import demostrar_signo, rango
        dom = _rangos(args.dominio)
        _salida(demostrar_signo(args.formula, dom, args.signo, args.max_cajas).dict() if args.signo
                else {"rango": rango(args.formula, dom)}, args.json)
    elif args.cmd == "z3":
        from .prueba import demostrar
        _salida(demostrar(args.objetivo, args.si), args.json)
    elif args.cmd == "banco":
        from .rapido import banco
        _salida(banco(args.formula, args.n), args.json)
    elif args.cmd == "tensor":
        import sympy as sp

        from .tensores import catalogo, densidad_euleriana, einstein
        g, alpha, beta = catalogo(args.metrica)
        r = einstein(g)
        rho = densidad_euleriana(r["einstein"], alpha, beta)
        out = {"metrica": args.metrica, "segundos_einstein": round(r["segundos"], 3), "longitud_rho": len(str(rho))}
        if args.comparar:
            from .igualdad import iguales
            out["comparacion"] = iguales(rho, args.comparar, simbolica=False).dict()
        else:
            out["densidad_euleriana"] = str(rho) if len(str(rho)) < 3000 else str(rho)[:3000] + "…"
        _salida(out, args.json)
    elif args.cmd == "descubrir":
        import numpy as np

        from .descubrir import descubrir
        datos = np.genfromtxt(args.csv, delimiter=",", names=True)
        X = {n: datos[n] for n in datos.dtype.names if n != args.y}
        _salida(descubrir(X, datos[args.y], args.motor), args.json)
    elif args.cmd == "biblioteca":
        _salida(biblioteca(), args.json)
    return 0


if __name__ == "__main__":
    sys.exit(main())
