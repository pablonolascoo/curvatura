// Curvatura · métrica de Alcubierre en C++20, sin dependencias.
// Unidades geométricas G = c = 1. Misma convención que physics/curvatura/metrics/alcubierre.py.
#pragma once
#include <cmath>
#include <numbers>

namespace curvatura::alcubierre {

struct Params {
  double v = 1.0;      // velocidad de la burbuja (fracción de c)
  double R = 1.0;      // radio
  double sigma = 8.0;  // inverso del grosor de pared
};

// sech² estable: 4e^{-2|u|} / (1 + e^{-2|u|})²
inline double sech2(double u) {
  const double e = std::exp(-2.0 * std::abs(u));
  return 4.0 * e / ((1.0 + e) * (1.0 + e));
}

inline double shape(double r, const Params& p) {
  return (std::tanh(p.sigma * (r + p.R)) - std::tanh(p.sigma * (r - p.R))) / (2.0 * std::tanh(p.sigma * p.R));
}

inline double dshape(double r, const Params& p) {
  return p.sigma * (sech2(p.sigma * (r + p.R)) - sech2(p.sigma * (r - p.R))) / (2.0 * std::tanh(p.sigma * p.R));
}

// θ = v (x - x_s)/r f'(r)
inline double expansion(double x, double y, double z, const Params& p, double xs = 0.0) {
  const double dx = x - xs;
  const double r = std::sqrt(dx * dx + y * y + z * z);
  return r > 0.0 ? p.v * (dx / r) * dshape(r, p) : 0.0;
}

// ρ_E = -(1/32π) v² (ρ²/r²) f'(r)²
inline double energy_density(double x, double y, double z, const Params& p, double xs = 0.0) {
  const double dx = x - xs;
  const double r2 = dx * dx + y * y + z * z;
  if (r2 <= 0.0) return 0.0;
  const double fp = dshape(std::sqrt(r2), p);
  return -p.v * p.v * ((y * y + z * z) / r2) * fp * fp / (32.0 * std::numbers::pi);
}

// E = -(v²/12) ∫ r² f'(r)² dr, Simpson compuesto.
inline double total_energy(const Params& p, int n = 200000) {
  const double a = 0.0, b = p.R + 40.0 / p.sigma;
  if (n % 2) ++n;
  const double h = (b - a) / n;
  auto g = [&](double r) { const double f = dshape(r, p); return r * r * f * f; };
  double s = g(a) + g(b);
  for (int i = 1; i < n; ++i) s += g(a + i * h) * (i % 2 ? 4.0 : 2.0);
  return -p.v * p.v * (s * h / 3.0) / 12.0;
}

}  // namespace curvatura::alcubierre
