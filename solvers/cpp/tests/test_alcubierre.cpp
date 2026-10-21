#include <cassert>
#include <cmath>
#include <cstdio>
#include "curvatura/alcubierre.hpp"

using namespace curvatura::alcubierre;

static bool close(double a, double b, double rel) { return std::abs(a - b) <= rel * std::abs(b); }

int main() {
  Params p{0.5, 1.0, 4.0};
  // Valores de referencia del núcleo Python (physics/), mismo punto y parámetros.
  assert(expansion(1.0, 0, 0, p) < 0);
  assert(expansion(-1.0, 0, 0, p) > 0);
  assert(energy_density(0.9, 0.3, 0.1, p) < 0);
  assert(close(shape(0.0, Params{1, 1, 20}), 1.0, 1e-12));
  Params thin{1.0, 10.0, 50.0};
  assert(close(total_energy(thin), -thin.v * thin.v * thin.R * thin.R * thin.sigma / 36.0, 1e-2));
  std::puts("ok: 5 comprobaciones");
}
