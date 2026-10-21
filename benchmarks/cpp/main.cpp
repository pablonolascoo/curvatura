#include <chrono>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <numbers>
#include <thread>
#include <vector>

constexpr double V = 0.5, R = 1.0, SIGMA = 4.0, HALF = 2.5;
static inline double sech2(double u) { double e = std::exp(-2 * std::abs(u)); return 4 * e / ((1 + e) * (1 + e)); }
static inline double rho(double x, double y) {
  double r2 = x * x + y * y;
  if (r2 == 0) return 0;
  double r = std::sqrt(r2);
  double fp = SIGMA * (sech2(SIGMA * (r + R)) - sech2(SIGMA * (r - R))) / (2 * std::tanh(SIGMA * R));
  return -V * V * (y * y / r2) * fp * fp / (32 * std::numbers::pi);
}
static double rows(int n, int j0, int j1) {
  double s = 0, step = 2 * HALF / (n - 1);
  for (int j = j0; j < j1; ++j) { double y = -HALF + step * j; for (int i = 0; i < n; ++i) s += rho(-HALF + step * i, y); }
  return s;
}
int main(int, char** argv) {
  int n = std::atoi(argv[1]);
  double b1 = 1e30, bp = 1e30, s = 0;
  unsigned w = std::thread::hardware_concurrency();
  for (int k = 0; k < 5; ++k) {
    auto t = std::chrono::steady_clock::now();
    s = rows(n, 0, n);
    b1 = std::min(b1, std::chrono::duration<double>(std::chrono::steady_clock::now() - t).count());
    t = std::chrono::steady_clock::now();
    std::vector<double> parts(w);
    std::vector<std::thread> th;
    for (unsigned p = 0; p < w; ++p) th.emplace_back([&, p] { parts[p] = rows(n, p * n / w, (p + 1) * n / w); });
    for (auto& x : th) x.join();
    bp = std::min(bp, std::chrono::duration<double>(std::chrono::steady_clock::now() - t).count());
  }
  std::printf("cpp %.3f %.3f %.6e\n", b1 * 1e3, bp * 1e3, s);
}
