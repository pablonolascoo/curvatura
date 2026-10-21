"""Genera el icono de la app (1024×1024): perfil de la expansión θ de Alcubierre.
Azul la expansión, rojo la contracción, sobre fondo hueso. Sin dependencias salvo numpy.
Uso: uv --directory physics run python ../scripts/make-icon.py ../apps/desktop/icons/source.png
"""
import struct
import sys
import zlib

import numpy as np

N, SS = 1024, 3
H = W = N * SS
y, x = np.mgrid[0:H, 0:W].astype(np.float32)
img = np.empty((H, W, 3), np.float32)
img[:] = (251, 251, 250)

# Tarjeta redondeada (radio 22 %) en tinta muy clara para que el icono tenga forma en el dock.
r = 0.225 * W
cx = np.clip(x, r, W - r); cy = np.clip(y, r, H - r)
inside = (x - cx) ** 2 + (y - cy) ** 2 <= r * r

# Perfil θ(x) = -x/|x| f'(|x|): lóbulo azul detrás (izquierda), rojo delante (derecha).
def theta(u):
    R, s = 0.55, 7.0
    sech2 = lambda z: 1 / np.cosh(z) ** 2
    rr = np.abs(u)
    fp = s * (sech2(s * (rr + R)) - sech2(s * (rr - R))) / (2 * np.tanh(s * R))
    return -np.sign(u) * fp * -1

ts = np.linspace(-1, 1, 6000)
th = -theta(ts)
th /= np.abs(th).max()
px = (0.5 + 0.40 * ts) * W
py = (0.5 - 0.30 * th) * H
for (X, Y, v) in zip(px[::2], py[::2], th[::2]):
    pass

def stroke(xs, ys, color, width):
    mask = np.zeros((H, W), bool)
    rad = width * SS
    for X, Y in zip(xs, ys):
        x0, x1 = int(max(0, X - rad)), int(min(W, X + rad + 1))
        y0, y1 = int(max(0, Y - rad)), int(min(H, Y + rad + 1))
        sub = (x[y0:y1, x0:x1] - X) ** 2 + (y[y0:y1, x0:x1] - Y) ** 2 <= rad * rad
        mask[y0:y1, x0:x1] |= sub
    img[mask & inside] = color

# Eje en tinta fina y curva en dos colores.
stroke(np.linspace(0.1 * W, 0.9 * W, 1500), np.full(1500, 0.5 * H), (220, 220, 218), 3)
neg = th < 0
stroke(px[~neg][::3], py[~neg][::3], (31, 108, 159), 14)
stroke(px[neg][::3], py[neg][::3], (159, 47, 45), 14)
img[~inside] = (255, 255, 255)
alpha = np.where(inside, 255, 0).astype(np.float32)

out = np.dstack([img, alpha]).reshape(N, SS, N, SS, 4).mean(axis=(1, 3)).astype(np.uint8)
raw = b"".join(b"\x00" + out[i].tobytes() for i in range(N))
def chunk(t, d):
    return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", N, N, 8, 6, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
open(sys.argv[1], "wb").write(png)
print("icono:", sys.argv[1])
