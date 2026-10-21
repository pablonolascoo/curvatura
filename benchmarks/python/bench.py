import sys, time
import numpy as np

V, R, SIGMA, HALF = 0.5, 1.0, 4.0, 2.5

def sech2(u):
    e = np.exp(-2 * np.abs(u))
    return 4 * e / (1 + e) ** 2

def field(n):
    g = np.linspace(-HALF, HALF, n)
    X, Y = np.meshgrid(g, g)
    r2 = X * X + Y * Y
    r = np.sqrt(r2)
    fp = SIGMA * (sech2(SIGMA * (r + R)) - sech2(SIGMA * (r - R))) / (2 * np.tanh(SIGMA * R))
    with np.errstate(invalid="ignore", divide="ignore"):
        out = np.where(r2 > 0, -V * V * (Y * Y / r2) * fp * fp / (32 * np.pi), 0.0)
    return out.sum()

n = int(sys.argv[1])
best, s = float("inf"), 0
for _ in range(5):
    t = time.perf_counter(); s = field(n); best = min(best, time.perf_counter() - t)
print(f"numpy {best*1e3:.3f} - {s:.6e}")
