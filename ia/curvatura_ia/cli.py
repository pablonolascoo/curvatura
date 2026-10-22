"""curvatura-ia: la IA de investigación de Curvatura.

  estado                         qué hay en la base
  hardware [--banco]             CPU, GPU y aceleradores del equipo, y qué motor usa cada parte
  vigilar                        ciclo completo: papers nuevos → corpus → análisis → patentes → vectores
  corpus | analizar | vectorizar | patentes     cada paso por separado (admiten sus propias opciones)
  fichas contexto|generar|validar               ficha de análisis por paper escrita por IA
  buscar "consulta" [--tipo ecuacion] [--k 10]  búsqueda directa, sin modelo de lenguaje
  figuras "descripción"                         búsqueda de figuras
  herramienta [nombre '{"arg": …}']             cualquier herramienta de la IA (sin nombre: la lista)
  preguntar "pregunta"           agente con RAG, laboratorio y subagentes recursivos
  chat                           conversación en la terminal
  lluvia "problema"              lluvia de ideas multiagente (TRIZ, inversión, analogía…)
  web [--puerto 8765]            interfaz web local
  mcp                            servidor MCP para Claude Code / Claude Desktop
  lab …                          laboratorio de fórmulas (igual que curvatura-lab)
"""

from __future__ import annotations

import json
import subprocess
import sys

from .rutas import REPO


def _imprimir_evento(tipo: str, d: dict) -> None:
    gris, fin = "\033[90m", "\033[0m"
    if tipo == "herramienta":
        args = json.dumps(d["args"], ensure_ascii=False)[:120]
        print(f"{gris}  [{d['agente']}] {d['nombre']} {args}{fin}", flush=True)
    elif tipo == "subagente":
        print(f"{gris}  ↳ subagente: {d['pregunta'][:100]}{fin}", flush=True)
    elif tipo == "fase":
        print(f"\n== {d['fase']} ==", flush=True)
    elif tipo == "pensamiento":
        print(f"{gris}  · {d['texto'][:200]}{fin}", flush=True)


def _remota(nombre: str, args: dict):
    """Si la web local está abierta (curvatura-ia web), se usa su modelo ya cargado: cada proceso nuevo
    cargaría ~2,5 GB y varios a la vez agotan la memoria del equipo."""
    import os
    import urllib.request

    puerto = os.environ.get("CURVATURA_PUERTO", "8765")
    try:
        req = urllib.request.Request(f"http://127.0.0.1:{puerto}/api/herramienta", method="POST",
                                     data=json.dumps({"nombre": nombre, "args": args}).encode(),
                                     headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=600) as r:
            d = json.loads(r.read())
        return d["texto"], d.get("imagenes", [])
    except Exception:
        return None


def vigilar() -> int:
    """Un ciclo de vigilancia. Programado (launchd, cron o GitHub Actions) mantiene la base al día."""
    import shutil

    if shutil.which("pgrep"):
        ocupado = subprocess.run(["pgrep", "-f", r"curvatura_ia\.(corpus|analizar|vectorizar|patentes)"], capture_output=True, text=True)
        if ocupado.stdout.strip():
            print("Ya hay un proceso de la IA en marcha; la vigilancia se salta este ciclo.", flush=True)
            return 0
    py = sys.executable
    pasos = [
        ["python3", "-I", "library/tools/harvest.py", "all"],
        ["python3", "-I", "library/tools/enrich.py", "countries"],
        ["python3", "-I", "library/tools/relevance.py"],
        [py, "-m", "curvatura_ia.corpus"],
        [py, "-m", "curvatura_ia.analizar"],
        [py, "-m", "curvatura_ia.fuentes"],
        [py, "-m", "curvatura_ia.fuentes", "paginas"],
        [py, "-m", "curvatura_ia.patentes", "--max", "200"],
        [py, "-m", "curvatura_ia.vectorizar", "--vigilado"],
        ["python3", "-I", "library/rag/build.py"],
    ]
    import os

    if os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("CURVATURA_LLM_URL"):
        pasos.insert(-2, [py, "-m", "curvatura_ia.fuentes", "resumir"])
    for p in pasos:
        print(f"\n▸ {' '.join(p[-3:])}", flush=True)
        r = subprocess.run(p, cwd=REPO)
        if r.returncode != 0:
            print(f"  (terminó con código {r.returncode}; se sigue con el siguiente paso)", flush=True)
    return 0


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    orden, resto = argv[0], argv[1:]
    sys.argv = [f"curvatura-ia {orden}", *resto]
    if orden == "estado":
        from .buscar import estado
        print(json.dumps(estado(), ensure_ascii=False, indent=2))
    elif orden in ("corpus", "analizar", "vectorizar", "patentes", "fichas", "fuentes"):
        import importlib
        return importlib.import_module(f"curvatura_ia.{orden}").main()
    elif orden == "hardware":
        from .hardware import main as hw
        return hw()
    elif orden == "vigilar":
        return vigilar()
    elif orden == "buscar":
        from .buscar import buscar
        k = int(resto[resto.index("--k") + 1]) if "--k" in resto else 8
        tipos = [resto[resto.index("--tipo") + 1]] if "--tipo" in resto else None
        for r in buscar(resto[0], k, tipos):
            print(f"\n[{r.get('tipo')}] {r.get('cita')}\n  {r.get('url')}\n  {(r.get('latex') or r.get('texto') or '')[:400]}")
    elif orden == "herramienta":
        from .herramientas import REGISTRO, ejecutar
        if not resto:
            for h in REGISTRO.values():
                print(f"{h.nombre:<22} {h.descripcion[:110]}")
            return 0
        args = json.loads(resto[1]) if len(resto) > 1 else {}
        texto, imgs = _remota(resto[0], args) or ejecutar(resto[0], args)
        print(texto)
        for r in imgs:
            print(f"[imagen] {r}")
    elif orden == "figuras":
        from .buscar import buscar_imagenes
        for r in buscar_imagenes(resto[0]):
            print(f"\nFigura {r['figura']} · {r['cita']}\n  {r['pie'][:200]}\n  {r['ruta']}")
    elif orden == "preguntar":
        from .agente import Agente
        print("\n" + Agente(on=_imprimir_evento).correr(" ".join(resto)))
    elif orden == "chat":
        from .agente import Agente
        ag, hist = Agente(on=_imprimir_evento), []
        print("Curvatura · escribe tu pregunta (Ctrl+D para salir)")
        while True:
            try:
                q = input("\n› ").strip()
            except EOFError:
                break
            if q:
                print("\n" + ag.correr(q, historial=hist))
    elif orden == "lluvia":
        from .agente import lluvia
        print("\n" + lluvia(" ".join(resto), on=_imprimir_evento))
    elif orden == "web":
        from .web import servir
        servir(int(resto[resto.index("--puerto") + 1]) if "--puerto" in resto else 8765)
    elif orden == "mcp":
        from .mcp_server import main as mcp_main
        mcp_main()
    elif orden == "lab":
        from curvatura.lab.cli import main as lab_main
        return lab_main(resto)
    else:
        print(f"Orden desconocida: {orden}\n{__doc__}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
