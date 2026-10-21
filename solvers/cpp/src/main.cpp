// curvatura-field: muestrea θ y ρ_E en el plano z = 0 y lo escribe en CSV.
// Uso: curvatura-field [v] [R] [sigma] [n] > campo.csv
#include <cstdio>
#include <cstdlib>
#include "curvatura/alcubierre.hpp"

int main(int argc, char** argv) {
  using namespace curvatura::alcubierre;
  Params p;
  if (argc > 1) p.v = std::atof(argv[1]);
  if (argc > 2) p.R = std::atof(argv[2]);
  if (argc > 3) p.sigma = std::atof(argv[3]);
  const int n = argc > 4 ? std::atoi(argv[4]) : 128;
  const double L = 2.5 * p.R;
  std::printf("x,y,theta,rho\n");
  for (int i = 0; i < n; ++i)
    for (int j = 0; j < n; ++j) {
      const double x = -L + 2 * L * i / (n - 1), y = -L + 2 * L * j / (n - 1);
      std::printf("%.6g,%.6g,%.9g,%.9g\n", x, y, expansion(x, y, 0, p), energy_density(x, y, 0, p));
    }
  std::fprintf(stderr, "E_total = %.9e (geométricas)\n", total_energy(p));
}
