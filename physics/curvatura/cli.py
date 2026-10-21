"""Línea de comandos: `python -m curvatura.cli alcubierre --v 1 --R 1 --sigma 8`."""

from __future__ import annotations

import argparse

from .metrics import alcubierre as A


def main() -> None:
    p = argparse.ArgumentParser(prog="curvatura")
    sub = p.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("alcubierre", help="Energía total de una burbuja de Alcubierre")
    a.add_argument("--v", type=float, default=1.0, help="velocidad (fracción de c)")
    a.add_argument("--R", type=float, default=1.0, help="radio (unidades de longitud)")
    a.add_argument("--sigma", type=float, default=8.0, help="inverso del grosor de pared")
    args = p.parse_args()
    E = A.total_energy(args.v, args.R, args.sigma)
    thin = A.total_energy_thin_wall(args.v, args.R, args.sigma)
    print(f"E  = {E:.6e}  (geométricas)")
    print(f"E≈ = {thin:.6e}  (pared delgada, -v²R²σ/36)")


if __name__ == "__main__":
    main()
