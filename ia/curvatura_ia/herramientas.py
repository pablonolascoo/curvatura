"""Herramientas de la IA: biblioteca (RAG), figuras, patentes, laboratorio de fórmulas y técnicas de pensamiento.

Una sola definición sirve al agente propio (Anthropic u OpenAI-compatible) y al servidor MCP.
Cada herramienta devuelve JSON (o una imagen) y nunca lanza excepciones: los errores vuelven como texto.
"""

from __future__ import annotations

import base64
import json
import re
import traceback
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

from .rutas import REPO

SKILLS = REPO / ".claude" / "skills"


@dataclass
class Herramienta:
    nombre: str
    descripcion: str
    parametros: dict
    fn: Callable[..., Any]

    def esquema(self) -> dict:
        props = {k: {kk: vv for kk, vv in v.items() if kk != "opcional"} for k, v in self.parametros.items()}
        req = [k for k, v in self.parametros.items() if not v.get("opcional") and "default" not in v]
        return {"type": "object", "properties": props, "required": req}


REGISTRO: dict[str, Herramienta] = {}


def herramienta(_nombre: str, _descripcion: str, /, **parametros):
    def deco(fn):
        REGISTRO[_nombre] = Herramienta(_nombre, _descripcion, parametros, fn)
        return fn
    return deco


S = lambda d, **kw: {"type": "string", "description": d, **kw}  # noqa: E731
N = lambda d, **kw: {"type": "integer", "description": d, **kw}  # noqa: E731


# ---------------------------------------------------------------- biblioteca


@herramienta("buscar", "Búsqueda híbrida (semántica + palabras) en TODA la base: papers completos (texto, ecuaciones, "
             "figuras, tablas, referencias), patentes, docs del proyecto y ecuaciones vivas. Multilingüe: pregunta en "
             "español o inglés. Cada resultado trae `cita` y `url` para atribuir. Lanza varias consultas con "
             "palabras distintas si la primera no basta.",
             q=S("consulta"), k=N("número de resultados", default=10),
             tipos={"type": "array", "items": {"type": "string", "enum": ["ficha", "resumen", "texto", "ecuacion", "figura", "tabla", "referencia", "patente", "doc"]},
                    "description": "filtrar por tipo de fragmento", "opcional": True},
             anio_min=N("año mínimo", opcional=True), anio_max=N("año máximo", opcional=True),
             subsistema=S("subsistema A–I/G/V del proyecto", opcional=True), paper=S("limitar a un paper (id)", opcional=True))
def t_buscar(q, k=10, tipos=None, anio_min=None, anio_max=None, subsistema=None, paper=None):
    from .buscar import buscar
    return buscar(q, k, tipos, paper, anio_min, anio_max, subsistema)


@herramienta("buscar_figuras", "Busca figuras de papers y dibujos de patentes por descripción visual («mapa de calor de la "
             "densidad de energía», «diagrama de una cavidad resonante»). Devuelve paper, número de figura y pie.",
             q=S("descripción de la imagen"), k=N("número de resultados", default=6), paper=S("limitar a un paper", opcional=True))
def t_buscar_figuras(q, k=6, paper=None):
    from .buscar import buscar_imagenes
    return buscar_imagenes(q, k, paper)


@herramienta("ver_paper", "Ficha y mapa de un paper o patente (`patente:US10144532B2`): cita completa, licencia, resúmenes, "
             "secciones, figuras y nº de ecuaciones y referencias.", id=S("id del paper (p. ej. fuchs-2024)"))
def t_ver_paper(id):
    from .buscar import paper
    return paper(id)


@herramienta("leer_seccion", "Texto completo de una sección de un paper (con las ecuaciones marcadas como [Ec. n]).",
             id=S("id del paper"), titulo=S("título o parte del título de la sección"))
def t_leer_seccion(id, titulo):
    from .buscar import seccion
    return seccion(id, titulo)


@herramienta("ecuaciones", "Ecuaciones de un paper en LaTeX con su contexto (texto antes y después). Sin `n`, todas.",
             id=S("id del paper"), n=N("número de ecuación", opcional=True))
def t_ecuaciones(id, n=None):
    from .buscar import ecuaciones
    r = ecuaciones(id, n)
    return r if n is not None or len(r) <= 60 else r[:60] + [{"aviso": f"{len(r) - 60} ecuaciones más: pide una con n"}]


@herramienta("ver_figura", "Muestra una figura de un paper (la imagen) con su pie y atribución, para leer gráficas y diagramas.",
             id=S("id del paper o patente:NÚMERO"), n=N("número de figura"))
def t_ver_figura(id, n):
    from .buscar import figura
    from .rutas import DATOS, PATENTES
    if id.startswith("patente:"):
        p = json.loads((PATENTES / f"{id.split(':', 1)[1]}.json").read_text())
        rutas = [str(DATOS / r) for r in p.get("dibujos", [])][n - 1:n]
        info = {"paper": id, "n": n, "pie": f"Dibujo {n}", "rutas": rutas, "cita": p.get("titulo"), "url": p.get("url")}
    else:
        info = figura(id, n)
    imgs = [r for r in info.get("rutas", []) if Path(r).exists()]
    if imgs:
        info["_imagenes"] = imgs[:2]
    return info


@herramienta("referencias", "Bibliografía de un paper, filtrable por texto (autor, título, año). Útil para seguir citas.",
             id=S("id del paper"), contiene=S("texto a buscar en las referencias", opcional=True))
def t_referencias(id, contiene=None):
    from .buscar import referencias
    return referencias(id, contiene)[:80]


@herramienta("estado_base", "Qué hay indexado: perfil y modelo de vectores, fragmentos, imágenes, papers analizados, patentes.")
def t_estado():
    from .buscar import estado
    return estado()


# ---------------------------------------------------------------- laboratorio de fórmulas


@herramienta("lab_igual", "¿Son iguales dos expresiones? symengine → 50 dígitos en puntos aleatorios → SymPy. Devuelve "
             "«demostrada», «numerica», «falsa» (con contraejemplo) o «indeterminada». Sintaxis: a^2, sqrt(), exp(), "
             "tanh(), diff(f(r), r), pi; o LaTeX entre $…$.", a=S("expresión o igualdad «a = b»"), b=S("segunda expresión", opcional=True))
def t_igual(a, b=None):
    from curvatura.lab.igualdad import iguales
    return iguales(a, b).dict()


@herramienta("lab_unidades", "Análisis dimensional. dims: símbolo → dimensión («L», «M L^2 T^-2» o atajos: masa, longitud, "
             "tiempo, velocidad, energia, densidad_energia, presion, fuerza, G, c, hbar, 1). `geometricas` para G=c=1.",
             formula=S("fórmula"), dims={"type": "object", "description": "símbolo → dimensión"},
             geometricas={"type": "boolean", "default": False})
def t_unidades(formula, dims, geometricas=False):
    from curvatura.lab.unidades import comprobar
    return comprobar(formula, dims, geometricas)


@herramienta("lab_cota", "Cotas RIGUROSAS (aritmética de bolas Arb). Sin `signo`: intervalo garantizado de valores en el "
             "dominio. Con `signo` (<0, <=0, >0, >=0): lo demuestra en todo el dominio o da un contraejemplo.",
             formula=S("expresión"), dominio={"type": "object", "description": "símbolo → [min, max]"},
             signo=S("<0, <=0, >0 o >=0", opcional=True))
def t_cota(formula, dominio, signo=None):
    from curvatura.lab.cotas import demostrar_signo, rango
    dom = {k: tuple(v) for k, v in dominio.items()}
    return demostrar_signo(formula, dom, signo).dict() if signo else {"rango": rango(formula, dom)}


@herramienta("lab_z3", "Demostración exacta con Z3 de desigualdades polinómicas o racionales bajo hipótesis; si es falsa, "
             "contraejemplo exacto.", objetivo=S("p. ej. «a^2 + b^2 >= 2*a*b»"),
             hipotesis={"type": "array", "items": {"type": "string"}, "description": "p. ej. [«v > 0», «R > 0»]", "opcional": True})
def t_z3(objetivo, hipotesis=None):
    from curvatura.lab.prueba import demostrar
    return demostrar(objetivo, hipotesis)


@herramienta("lab_evaluar", "Evalúa una fórmula (compilada con numba, cientos de millones de puntos por segundo). "
             "valores: símbolo → número, lista, o {inicio, fin, n} para un barrido. Devuelve resumen y muestra.",
             formula=S("expresión"), valores={"type": "object", "description": "símbolo → valor | lista | {inicio, fin, n}"})
def t_evaluar(formula, valores):
    import numpy as np

    from curvatura.lab.rapido import evaluar
    vals = {}
    for k, v in valores.items():
        vals[k] = np.linspace(v["inicio"], v["fin"], int(v.get("n", 100))) if isinstance(v, dict) else np.asarray(v, float)
    r = np.atleast_1d(evaluar(formula, vals))
    fin = r[np.isfinite(r)]
    return {"n": int(r.size), "min": float(fin.min()) if fin.size else None, "max": float(fin.max()) if fin.size else None,
            "media": float(fin.mean()) if fin.size else None, "muestra": [float(x) for x in r[:: max(1, r.size // 20)][:20]]}


@herramienta("lab_barrido", "Barrido masivo de parámetros (hasta 8 variables y miles de millones de puntos) en la GPU "
             "(Metal, DirectX 12, Vulkan) o en todos los núcleos: mínimo, máximo, media y fracción negativa sin guardar la "
             "rejilla. Para explorar dónde una fórmula cambia de signo o se hace extrema. GPU en f32 (los negativos "
             "diminutos cuentan como cero); para certeza usa lab_cota.",
             formula=S("expresión"), rangos={"type": "object", "description": "símbolo → [inicio, fin, n]"},
             motor=S("auto, gpu o cpu", default="auto"))
def t_barrido(formula, rangos, motor="auto"):
    from curvatura.lab.rapido import barrido
    return barrido(formula, {k: (float(v[0]), float(v[1]), int(v[2])) for k, v in rangos.items()}, motor)


@herramienta("hardware", "CPU, GPU y aceleradores de este equipo y qué motor usa cada parte del sistema.")
def t_hardware():
    from .hardware import informe
    return informe()


@herramienta("lab_tensor", "Tensor de Einstein y densidad de energía euleriana desde una métrica del catálogo (alcubierre, "
             "lentz, schwarzschild) con symengine; opcionalmente contrasta con una fórmula ρ propuesta (x, y, z, t, v, f).",
             metrica=S("nombre"), comparar=S("fórmula de ρ a contrastar", opcional=True))
def t_tensor(metrica, comparar=None):
    from curvatura.lab.igualdad import iguales
    from curvatura.lab.tensores import catalogo, densidad_euleriana, einstein
    g, a, b = catalogo(metrica)
    r = einstein(g)
    rho = densidad_euleriana(r["einstein"], a, b)
    out = {"metrica": metrica, "segundos": round(r["segundos"], 3), "rho": str(rho)[:3000]}
    if comparar:
        out["comparacion"] = iguales(rho, comparar, simbolica=False).dict()
    return out


@herramienta("lab_descubrir", "Descubre fórmulas que expliquen datos (regresión simbólica rápida; PySR si está instalado). "
             "datos: columna → lista de números; y: nombre de la columna objetivo.",
             datos={"type": "object", "description": "columna → lista"}, y=S("columna objetivo"),
             motor=S("rapido o pysr", default="rapido"))
def t_descubrir(datos, y, motor="rapido"):
    import numpy as np

    from curvatura.lab.descubrir import descubrir
    X = {k: np.asarray(v, float) for k, v in datos.items() if k != y}
    return descubrir(X, np.asarray(datos[y], float), motor)


# ---------------------------------------------------------------- pensamiento


def tecnicas() -> dict[str, str]:
    out = {}
    for f in sorted(SKILLS.glob("*/SKILL.md")):
        t = f.read_text()
        m = re.search(r"^description:\s*(.+)$", t, re.M)
        if f.parent.name.startswith("threejs"):
            continue
        out[f.parent.name] = (m.group(1).strip().strip('"') if m else "")[:220]
    return out


@herramienta("tecnicas_pensamiento", "Lista las técnicas de pensamiento disponibles (TRIZ, pensamiento lateral, inversión, "
             "analogía, sombreros, SCAMPER, hipótesis, abogado del diablo, auditoría de teoremas de imposibilidad…).")
def t_tecnicas():
    return tecnicas()


@herramienta("aplicar_tecnica", "Devuelve el protocolo completo de una técnica de pensamiento para aplicarlo paso a paso.",
             nombre=S("nombre de la técnica (de tecnicas_pensamiento)"))
def t_aplicar(nombre):
    f = SKILLS / nombre / "SKILL.md"
    if not f.exists():
        return {"error": f"no existe «{nombre}»", "disponibles": list(tecnicas())}
    texto = f.read_text()
    return {"tecnica": nombre, "protocolo": texto[:24000]}


# ---------------------------------------------------------------- ejecución


def ejecutar(nombre: str, args: dict) -> tuple[str, list[str]]:
    """Ejecuta una herramienta. Devuelve (texto JSON, rutas de imágenes a adjuntar)."""
    h = REGISTRO.get(nombre)
    if h is None:
        return json.dumps({"error": f"herramienta desconocida: {nombre}"}), []
    try:
        r = h.fn(**(args or {}))
    except Exception as exc:
        return json.dumps({"error": f"{type(exc).__name__}: {exc}", "traza": traceback.format_exc()[-600:]}, ensure_ascii=False), []
    imgs = r.pop("_imagenes", []) if isinstance(r, dict) else []
    texto = json.dumps(r, ensure_ascii=False, default=str)
    if len(texto) > 60000:
        texto = texto[:60000] + "… [recortado]"
    return texto, imgs


def imagen_b64(ruta: str) -> dict:
    return {"type": "image", "source": {"type": "base64", "media_type": "image/png",
                                        "data": base64.b64encode(Path(ruta).read_bytes()).decode()}}
