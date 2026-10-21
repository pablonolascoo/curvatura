"""Qué hay en este equipo para calcular y qué motor usa cada parte.

  CPU        núcleos (rendimiento y eficiencia en Apple), hilos de numba
  GPU        wgpu (Metal, DirectX 12, Vulkan): laboratorio (barridos) y app nativa
  PyTorch    CUDA (NVIDIA) o MPS (Apple): vectores de texto en bloque
  ONNX       proveedores (CUDA, DirectML en Windows, OpenVINO en Intel, CoreML en Apple)

  curvatura-ia hardware            informe
  curvatura-ia hardware --banco    además, mide cada motor
"""

from __future__ import annotations

import json
import os
import platform
import subprocess
import sys
import time


def _sysctl(k: str) -> str:
    try:
        return subprocess.run(["sysctl", "-n", k], capture_output=True, text=True, timeout=5).stdout.strip()
    except Exception:
        return ""


def cpu() -> dict:
    d = {"modelo": platform.processor() or platform.machine(), "hilos": os.cpu_count(), "so": f"{platform.system()} {platform.release()}"}
    if sys.platform == "darwin":
        d["modelo"] = _sysctl("machdep.cpu.brand_string") or d["modelo"]
        d["nucleos_rendimiento"] = int(_sysctl("hw.perflevel0.physicalcpu") or 0)
        d["nucleos_eficiencia"] = int(_sysctl("hw.perflevel1.physicalcpu") or 0)
        d["memoria_gb"] = round(int(_sysctl("hw.memsize") or 0) / 2**30, 1)
    try:
        import numba

        d["hilos_numba"] = numba.get_num_threads()
    except Exception:
        pass
    return d


def gpu_wgpu() -> dict | None:
    try:
        import wgpu

        a = wgpu.gpu.request_adapter_sync(power_preference="high-performance")
        return {"nombre": a.info["device"], "backend": a.info["backend_type"], "tipo": a.info["adapter_type"]} if a else None
    except Exception:
        return None


def torch_dispositivo() -> str | None:
    try:
        import torch

        if torch.cuda.is_available():
            return f"cuda ({torch.cuda.get_device_name(0)})"
        if torch.backends.mps.is_available():
            return "mps (Apple)"
    except Exception:
        pass
    return None


# NPU y GPU por orden: NVIDIA (CUDA), Windows (DirectML: cualquier GPU o NPU), Snapdragon (QNN), Intel (OpenVINO), AMD (ROCm).
# CoreML (Neural Engine de Apple) queda fuera por defecto: con modelos grandes es mucho más lento que la GPU (medido).
ORDEN_ONNX = ["CUDAExecutionProvider", "DmlExecutionProvider", "QNNExecutionProvider", "OpenVINOExecutionProvider", "ROCMExecutionProvider"]


def proveedores_onnx() -> list[str]:
    """Proveedores acelerados de ONNX Runtime por orden de preferencia (CoreML solo si CURVATURA_COREML=1)."""
    try:
        import onnxruntime as ort

        hay = ort.get_available_providers()
    except Exception:
        return []
    orden = ORDEN_ONNX + (["CoreMLExecutionProvider"] if os.environ.get("CURVATURA_COREML") == "1" else [])
    return [p for p in orden if p in hay]


def informe() -> dict:
    g = gpu_wgpu()
    t = torch_dispositivo()
    onnx = proveedores_onnx()
    return {
        "cpu": cpu(),
        "gpu": g,
        "pytorch": t,
        "onnx": onnx,
        "motores": {
            "vectores_texto": f"PyTorch {t}" if t else (f"ONNX {onnx[0]}" if onnx else f"CPU en paralelo ({os.cpu_count()} hilos)"),
            "laboratorio_barridos": f"GPU {g['nombre']} · {g['backend']}" if g and g["tipo"] != "CPU" else "CPU numba",
            "laboratorio_evaluar": "numba (todos los núcleos, f64)",
            "app_nativa": "Rust: GPU (wgpu) para mapas grandes, rayon en todos los núcleos para el resto",
            "analisis_pdf_latex": f"{os.cpu_count()} procesos en paralelo",
        },
    }


def banco() -> dict:
    import numpy as np

    from curvatura.lab import rapido

    out = {}
    f = "-(v^2*rho^2)/(32*pi*r^2)*(sigma*(sech(sigma*(r+1))^2 - sech(sigma*(r-1))^2)/(2*tanh(sigma)))^2"
    rangos = {"v": (0.1, 2, 16), "rho": (0, 3, 128), "r": (0.1, 4, 512), "sigma": (1, 10, 128)}
    out["barrido_cpu"] = rapido.barrido(f, rangos, "cpu")
    try:
        from curvatura.lab import gpu

        if gpu.disponible():
            gpu.barrido(f, {k: (a, b, 4) for k, (a, b, _) in rangos.items()})
            out["barrido_gpu"] = gpu.barrido(f, rangos)
    except Exception as exc:
        out["barrido_gpu"] = {"error": str(exc)[:200]}
    out["evaluar_numba"] = rapido.banco("exp(-x^2)*tanh(y)*sqrt(x*y+1)/(1+x^4)", 4_000_000)
    try:
        from . import vectorizar as V

        textos = ["passage: warp drive energy conditions in general relativity " * 20] * 64
        V.vec_texto(textos[:8] * 2)
        t = time.perf_counter()
        V.vec_texto(textos)
        out["vectores_texto"] = {"modelo": V.MODELO_TEXTO, "fragmentos_s": round(64 / (time.perf_counter() - t), 1)}
    except Exception as exc:
        out["vectores_texto"] = {"error": str(exc)[:200]}
    return out


def main() -> int:
    d = informe()
    if "--banco" in sys.argv:
        d["banco"] = banco()
    print(json.dumps(d, ensure_ascii=False, indent=2, default=str))
    return 0


if __name__ == "__main__":
    sys.exit(main())
