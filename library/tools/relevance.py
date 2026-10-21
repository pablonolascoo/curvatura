"""Puntúa la relevancia de cada ficha para el motor de curvatura y la escribe en meta.yaml.

  alta  = trata directamente métricas de curvatura, viaje superlumínico o sus restricciones
  media = física necesaria (condiciones de energía, energía negativa, agujeros de gusano, análogos)
  baja  = coincidencia de palabras sin relación (p. ej. dimensiones extra «warped»)

Uso: python3 -I library/tools/relevance.py [--dry]
"""

from __future__ import annotations

import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "papers"

HIGH = ["曲速", "阿尔库别雷", "超光速旅行", "warp drive", "warp bubble", "warp-drive", "alcubierre", "natario", "natário", "krasnikov", "van den broeck",
        "superluminal travel", "faster-than-light travel", "faster than light travel", "hyperfast", "warp factory",
        "warp metric", "warp field", "warp shell", "physical warp", "warp spacetime"]
MEDIUM = ["虫洞", "负能量密度", "量子 负能量", "奇异物质", "能量条件 广义", "卡西米尔", "类比引力", "声学黑洞", "霍金辐射", "超光速", "广义相对论", "量子不等式", "energy condition", "negative energy", "exotic matter", "quantum inequalit", "quantum energy inequalit",
          "traversable wormhole", "casimir", "analogue gravity", "analog gravity", "acoustic metric",
          "acoustic black hole", "analogue black hole", "closed timelike", "time machine", "superluminal",
          "faster-than-light", "squeezed vacuum", "einstein-maxwell-plasma", "soliton", "stress-energy tensor",
          "hawking radiation", "semiclassical", "wormhole"]
OFFTOPIC = ["randall-sundrum", "warped extra dimension", "warped extra-dimension", "braneworld", "brane world",
            "warped compactification", "warped throat", "warped geometry", "kaluza-klein", "ads/cft", "warped deformed conifold",
            "warped product"]


def level(text: str) -> str:
    t = text.lower()
    high = any(w in t for w in HIGH)
    if any(w in t for w in OFFTOPIC) and not ("warp drive" in t or "alcubierre" in t or "warp bubble" in t):
        return "baja"
    if high:
        return "alta"
    return "media" if any(w in t for w in MEDIUM) else "baja"


def main() -> int:
    dry = "--dry" in sys.argv
    count = Counter()
    for meta in sorted(ROOT.glob("*/meta.yaml")):
        text = meta.read_text()
        title = re.search(r'^title:\s*"?(.*?)"?$', text, re.M)
        ab = meta.parent / "abstract.en.md"
        body = (title.group(1) if title else "") + " " + (ab.read_text() if ab.exists() else "")
        lv = level(body)
        # Quien cita a los papers semilla de motores de curvatura entra al menos como «media».
        if lv == "baja" and re.search(r"^cites_seeds:", text, re.M) and not any(w in body.lower() for w in OFFTOPIC):
            lv = "media"
        # Las fichas curadas a mano (sin campo harvest) son siempre relevantes.
        if "harvest:" not in text and lv == "baja":
            lv = "media"
        # Revisión humana o de IA: `relevance_manual` manda sobre la heurística.
        manual = re.search(r"^relevance_manual:\s*(alta|media|baja)", text, re.M)
        if manual:
            lv = manual.group(1)
        count[lv] += 1
        if dry:
            continue
        if re.search(r"^relevance:", text, re.M):
            text = re.sub(r"^relevance:.*$", f"relevance: {lv}", text, flags=re.M)
        else:
            text = text.rstrip("\n") + f"\nrelevance: {lv}\n"
        meta.write_text(text)
    print(dict(count))
    return 0


if __name__ == "__main__":
    sys.exit(main())
