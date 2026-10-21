CXX ?= clang++
CXXFLAGS ?= -std=c++20 -O2 -Wall -Wextra -Iinclude

build/curvatura-field: src/main.cpp include/curvatura/alcubierre.hpp
	@mkdir -p build && $(CXX) $(CXXFLAGS) $< -o $@

test: tests/test_alcubierre.cpp include/curvatura/alcubierre.hpp
	@mkdir -p build && $(CXX) $(CXXFLAGS) $< -o build/test && ./build/test

.PHONY: test
