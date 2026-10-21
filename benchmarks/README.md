# Banco de pruebas: ¿qué lenguaje para el cálculo pesado?

Mismo núcleo en todos: densidad de energía euleriana de Alcubierre sobre una malla N×N del plano z = 0
(sech² estable, una raíz, una división), suma de control para que el compilador no elimine el trabajo.
Mejor de 5 repeticiones. Ejecutar: `bash benchmarks/run.sh`.

## Resultados (Apple M4, 10 núcleos, octubre de 2026)

Malla 4000 × 4000 = 16 millones de puntos. Milisegundos, mejor de 5.

| Lenguaje | 1 hilo | Todos los núcleos | Notas |
|---|---|---|---|
| C++20 (clang -O3 -march=native) | 100,7 | 24,6 | Referencia. |
| Rust (rayon, target-cpu=native) | 142,1 | 30,6 | 1,2× C++. Mismo código compila a WebAssembly. |
| Go 1.27 (goroutines) | 240,2 | 55,1 | 2,2× C++. Recolector de basura, sin SIMD explícito. |
| Python + NumPy (vectorizado) | ≈180 | – | Un hilo; limitado por memoria. |

Malla 2000 × 2000: C++ 24,8 / 5,8 ms · Rust 35,9 / 7,3 ms · Go 60,4 / 14,5 ms · NumPy 44,8 ms.

## Decisión

| Capa | Lenguaje | Por qué |
|---|---|---|
| Cálculo intensivo (campos, geodésicas, integrales) | **Rust** | A 1,2× de C++ con seguridad de memoria, y es el único que se compila a la vez a nativo (Windows, macOS, Linux) y a WebAssembly para la web. Un solo código para las cuatro salidas. |
| Puente con relatividad numérica existente (Einstein Toolkit, GRChombo) | **C++** | Esos códigos son C++: se enlazan directamente. |
| Álgebra simbólica, prototipos, análisis | **Python** (SymPy, NumPy, SciPy) | El ecosistema científico. En la app, Python nativo instalado por `uv`; en la web, Pyodide. |
| Go | No se adopta | 2× más lento que C++ en este núcleo, sin equivalente maduro a NumPy/SciPy y sin buena salida a WebAssembly para cálculo. |

Siguiente salto de rendimiento: cómputo en GPU con `wgpu` desde el mismo núcleo Rust (WebGPU en la web, Metal, Vulkan y DirectX en las apps).
