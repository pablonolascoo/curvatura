"""Imagen para redes (1200×630): titular y perfil real de la expansión θ de Alcubierre.
Uso: uv --directory physics run --with pillow python ../scripts/make-og.py ../apps/web/public/og.png
"""
import math
import sys

from PIL import Image, ImageDraw, ImageFont

W, H, SS = 1200, 630, 2
img = Image.new("RGB", (W * SS, H * SS), (251, 251, 250))
d = ImageDraw.Draw(img)
serif = "/System/Library/Fonts/Supplemental/Georgia.ttf"
sans = "/System/Library/Fonts/Helvetica.ttc"
f = lambda p, s: ImageFont.truetype(p, s * SS)


def theta(u: float) -> float:
    R, s = 0.55, 7.0
    sech2 = lambda z: 1 / math.cosh(z) ** 2  # noqa: E731
    r = abs(u)
    fp = s * (sech2(s * (r + R)) - sech2(s * (r - R))) / (2 * math.tanh(s * R))
    return (1 if u > 0 else -1) * fp


us = [-1 + 2 * i / 800 for i in range(801)]
vs = [theta(u) for u in us]
m = max(abs(v) for v in vs)
x0, x1, yc, amp = 690, 1130, 315, 165
pts = [((x0 + (u + 1) / 2 * (x1 - x0)) * SS, (yc - amp * v / m) * SS) for u, v in zip(us, vs)]
d.line([(x0 * SS, yc * SS), (x1 * SS, yc * SS)], fill=(220, 220, 218), width=2 * SS)
half = len(pts) // 2
d.line(pts[: half + 1], fill=(31, 108, 159), width=7 * SS, joint="curve")
d.line(pts[half:], fill=(159, 47, 45), width=7 * SS, joint="curve")
d.text((80 * SS, 96 * SS), "Curvatura", font=f(serif, 40), fill=(17, 17, 17))
d.text((80 * SS, 228 * SS), "Mover el espacio,", font=f(serif, 64), fill=(17, 17, 17))
d.text((80 * SS, 306 * SS), "no la nave.", font=f(serif, 64), fill=(17, 17, 17))
d.text((80 * SS, 520 * SS), "Biblioteca, ecuaciones y laboratorio abiertos del motor de curvatura", font=f(sans, 24), fill=(107, 106, 103))
img.resize((W, H), Image.LANCZOS).save(sys.argv[1], optimize=True)
print("og:", sys.argv[1])
