#!/usr/bin/env bash
# Banco de pruebas multilenguaje. N = lado de la malla (por defecto 2000 → 4 millones de puntos).
set -euo pipefail
cd "$(dirname "$0")"
N="${1:-2000}"
( cd go && go build -o ../.bin-go main.go )
( cd rust && cargo build --release -q && cp target/release/bench ../.bin-rust )
clang++ -std=c++20 -O3 -march=native -o .bin-cpp cpp/main.cpp
echo "lenguaje ms_1hilo ms_paralelo suma"
./.bin-cpp "$N"; ./.bin-rust "$N"; ./.bin-go "$N"
uv --directory ../physics run python ../benchmarks/python/bench.py "$N"
