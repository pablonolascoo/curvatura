"""Agente investigador de Curvatura: RAG multimodal + laboratorio de fórmulas + técnicas de pensamiento.

  preguntar()  un agente con herramientas que puede abrir SUBAGENTES (herramienta `investigar`)
               para indagar en paralelo subpreguntas; cada subagente puede volver a hacerlo
               (profundidad máxima configurable). Así el sistema se llama a sí mismo para buscar
               más, extraer más datos y razonar mejor.
  lluvia()     lluvia de ideas multiagente:
                 1. documentalista: estado del arte con citas
                 2. ideadores en paralelo, cada uno con una técnica (TRIZ, inversión, analogía,
                    provocación, primeros principios, bisociación…)
                 3. abogado del diablo: contra teoremas de imposibilidad y la literatura
                 4. formulista: comprueba en el laboratorio cada fórmula propuesta
                 5. síntesis ordenada por promesa, con lo que habría que calcular o medir

Proveedores:
  Anthropic (ANTHROPIC_API_KEY). Modelos: CURVATURA_MODELO (claude-opus-5-5), CURVATURA_MODELO_SUB (claude-sonnet-5-5).
  Cualquier API compatible con OpenAI, incluidos modelos locales gratis (Ollama, LM Studio):
    CURVATURA_LLM_URL=http://localhost:11434/v1  CURVATURA_LLM_MODELO=qwen3:32b
Sin clave: usa el servidor MCP (`curvatura-ia mcp`) desde Claude Code o Claude Desktop.
"""

from __future__ import annotations

import json
import os
import threading
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from typing import Callable

from .herramientas import REGISTRO, ejecutar, imagen_b64

SISTEMA = """Eres el investigador de Curvatura, un programa abierto para llevar el motor de curvatura de la relatividad general a la ingeniería. Tienes acceso a TODA la base: miles de papers completos (texto, ecuaciones LaTeX, figuras, referencias), patentes, la documentación del proyecto y un laboratorio de fórmulas con demostración rigurosa.

Reglas:
1. Busca antes de afirmar. Lanza varias consultas (español e inglés, sinónimos, autores) y abre secciones, ecuaciones y figuras de los papers clave. Si te falta algo, sigue buscando o abre un subagente con `investigar`.
2. Cita TODO lo que venga de la base con su atribución: [Autores (año)](url). Nunca inventes papers, autores, números ni ecuaciones. Si la base no lo tiene, dilo.
3. Toda cifra sale de una cita o de un cálculo del laboratorio (lab_*). Comprueba dimensiones, signos e igualdades antes de darlas por buenas.
4. Distingue siempre: establecido (con cita) · plausible (argumento) · especulativo (idea nueva). Las ideas nuevas son bienvenidas: márcalas como tales y di qué cálculo o experimento las mataría.
5. Piensa también fuera de la caja: usa `tecnicas_pensamiento` y `aplicar_tecnica` (TRIZ, inversión, analogía, provocación…) cuando el camino obvio está bloqueado, y contrasta cada idea con los teoremas de imposibilidad.
6. Responde en el idioma de la pregunta, claro y directo. Termina con «Fuentes» (lista de citas usadas) y, si procede, «Siguientes pasos» (cálculos o lecturas concretas)."""

MODELO = os.environ.get("CURVATURA_MODELO", "claude-opus-5-5")
MODELO_SUB = os.environ.get("CURVATURA_MODELO_SUB", "claude-sonnet-5-5")
Evento = Callable[[str, dict], None]


def _nada(tipo: str, datos: dict) -> None:
    pass


# ---------------------------------------------------------------- proveedores


class Anthropic:
    def __init__(self):
        import anthropic

        self.c = anthropic.Anthropic()

    def llamar(self, modelo, sistema, mensajes, herramientas, max_tokens=8000):
        r = self.c.messages.create(model=modelo, max_tokens=max_tokens, system=sistema, messages=mensajes, tools=herramientas)
        bloques = [b.model_dump(exclude_none=True) for b in r.content]
        return bloques, r.stop_reason


class CompatibleOpenAI:
    """Traduce el formato interno (el de Anthropic) a chat.completions con funciones."""

    def __init__(self):
        from openai import OpenAI

        self.c = OpenAI(base_url=os.environ["CURVATURA_LLM_URL"], api_key=os.environ.get("CURVATURA_LLM_KEY", "local"))
        self.modelo = os.environ.get("CURVATURA_LLM_MODELO", "qwen3:32b")

    def llamar(self, modelo, sistema, mensajes, herramientas, max_tokens=8000):
        msgs = [{"role": "system", "content": sistema}]
        for m in mensajes:
            if isinstance(m["content"], str):
                msgs.append({"role": m["role"], "content": m["content"]})
                continue
            texto = "".join(b.get("text", "") for b in m["content"] if b["type"] == "text")
            llamadas = [b for b in m["content"] if b["type"] == "tool_use"]
            resultados = [b for b in m["content"] if b["type"] == "tool_result"]
            if m["role"] == "assistant":
                msgs.append({"role": "assistant", "content": texto or None, "tool_calls": [
                    {"id": b["id"], "type": "function", "function": {"name": b["name"], "arguments": json.dumps(b["input"])}} for b in llamadas] or None})
            for b in resultados:
                cont = b["content"] if isinstance(b["content"], str) else "".join(x.get("text", "") for x in b["content"] if x["type"] == "text")
                msgs.append({"role": "tool", "tool_call_id": b["tool_use_id"], "content": cont})
            if m["role"] == "user" and texto:
                msgs.append({"role": "user", "content": texto})
        tools = [{"type": "function", "function": {"name": h["name"], "description": h["description"], "parameters": h["input_schema"]}} for h in herramientas]
        r = self.c.chat.completions.create(model=self.modelo, messages=msgs, tools=tools, max_tokens=max_tokens)
        ch = r.choices[0].message
        bloques = [{"type": "text", "text": ch.content}] if ch.content else []
        for tc in ch.tool_calls or []:
            try:
                args = json.loads(tc.function.arguments or "{}")
            except json.JSONDecodeError:
                args = {}
            bloques.append({"type": "tool_use", "id": tc.id, "name": tc.function.name, "input": args})
        return bloques, "tool_use" if ch.tool_calls else "end_turn"


def proveedor():
    if os.environ.get("CURVATURA_LLM_URL"):
        return CompatibleOpenAI()
    if os.environ.get("ANTHROPIC_API_KEY"):
        return Anthropic()
    raise RuntimeError("Falta un modelo: define ANTHROPIC_API_KEY, o CURVATURA_LLM_URL para un modelo local "
                       "(Ollama/LM Studio), o usa `curvatura-ia mcp` desde Claude Code.")


# ---------------------------------------------------------------- agente


@dataclass
class Agente:
    profundidad_max: int = 2
    max_pasos: int = 24
    on: Evento = _nada
    prov: object = None
    _gasto: dict = field(default_factory=lambda: {"llamadas": 0, "subagentes": 0})
    _cerrojo: threading.Lock = field(default_factory=threading.Lock)

    def __post_init__(self):
        self.prov = self.prov or proveedor()

    def _herramientas(self, profundidad: int) -> list[dict]:
        hs = [{"name": h.nombre, "description": h.descripcion, "input_schema": h.esquema()} for h in REGISTRO.values()]
        if profundidad < self.profundidad_max:
            hs.append({"name": "investigar", "description": (
                "Abre un SUBAGENTE investigador con las mismas herramientas para una subpregunta concreta. "
                "Úsalo para indagar en paralelo varias líneas (llama a varios a la vez), para profundizar en un paper "
                "o para comprobar una idea. Devuelve un informe con citas."),
                "input_schema": {"type": "object", "properties": {
                    "pregunta": {"type": "string"}, "enfoque": {"type": "string", "description": "qué buscar o cómo pensarlo"}},
                    "required": ["pregunta"]}})
        return hs

    def correr(self, pregunta: str, sistema: str = SISTEMA, profundidad: int = 0, etiqueta: str = "principal",
               historial: list | None = None) -> str:
        modelo = MODELO if profundidad == 0 else MODELO_SUB
        mensajes = list(historial or []) + [{"role": "user", "content": pregunta}]
        herramientas = self._herramientas(profundidad)
        for paso in range(self.max_pasos):
            with self._cerrojo:
                self._gasto["llamadas"] += 1
            bloques, parada = self.prov.llamar(modelo, sistema, mensajes, herramientas)
            mensajes.append({"role": "assistant", "content": bloques})
            for b in bloques:
                if b["type"] == "text" and b.get("text", "").strip():
                    self.on("pensamiento" if parada == "tool_use" else "texto", {"agente": etiqueta, "texto": b["text"]})
            llamadas = [b for b in bloques if b["type"] == "tool_use"]
            if parada != "tool_use" or not llamadas:
                if historial is not None:
                    historial[:] = mensajes
                return "\n".join(b.get("text", "") for b in bloques if b["type"] == "text").strip()
            resultados = [None] * len(llamadas)

            def hacer(i_b):
                i, b = i_b
                self.on("herramienta", {"agente": etiqueta, "nombre": b["name"], "args": b["input"]})
                if b["name"] == "investigar":
                    with self._cerrojo:
                        self._gasto["subagentes"] += 1
                    sub = f"{etiqueta}›{b['input'].get('pregunta', '')[:40]}"
                    self.on("subagente", {"agente": sub, "pregunta": b["input"].get("pregunta")})
                    texto = self.correr(b["input"]["pregunta"] + (f"\n\nEnfoque: {b['input']['enfoque']}" if b["input"].get("enfoque") else ""),
                                        SISTEMA + "\n\nEres un subagente: entrega un informe denso y con citas, sin saludos.",
                                        profundidad + 1, sub)
                    resultados[i] = {"type": "tool_result", "tool_use_id": b["id"], "content": texto or "(sin resultado)"}
                    return
                texto, imgs = ejecutar(b["name"], b["input"])
                cont = [{"type": "text", "text": texto}] + [imagen_b64(r) for r in imgs if isinstance(self.prov, Anthropic)]
                self.on("resultado", {"agente": etiqueta, "nombre": b["name"], "resumen": texto[:300], "imagenes": imgs})
                resultados[i] = {"type": "tool_result", "tool_use_id": b["id"], "content": cont}

            with ThreadPoolExecutor(max_workers=6) as ex:
                list(ex.map(hacer, enumerate(llamadas)))
            mensajes.append({"role": "user", "content": resultados})
        return "(se alcanzó el máximo de pasos; pide que continúe)"


# ---------------------------------------------------------------- lluvia de ideas multiagente

TECNICAS_LLUVIA = [
    ("triz-espaciotiempo", "TRIZ en relatividad general: separa estructura (disoluble) de ley física; separación en espacio, tiempo, escala."),
    ("inversion", "Inversión: ¿qué garantizaría el fracaso? Dale la vuelta."),
    ("analogy", "Analogía entre campos: gravedad análoga, metamateriales, condensados, Casimir, fluidos."),
    ("provocation", "Provocación (PO): una afirmación imposible a propósito y qué se sigue de ella."),
    ("creative-thinking-for-research", "Bisociación y restricciones ocultas: qué supuesto nadie cuestiona."),
    ("primeros-principios-fisica", "Primeros principios: de las ecuaciones de Einstein y los teoremas, hacia arriba."),
]


def lluvia(problema: str, ideadores: int = 5, on: Evento = _nada) -> str:
    ag = Agente(profundidad_max=1, on=on)
    on("fase", {"fase": "estado del arte"})
    contexto = ag.correr(f"Prepara el estado del arte para este problema, con citas exactas, cifras y ecuaciones clave "
                         f"de la base (papers y patentes). Qué se ha intentado, qué falló y por qué.\n\nProblema: {problema}",
                         etiqueta="documentalista", profundidad=1)
    on("fase", {"fase": "ideas"})

    def idear(t):
        nombre, guia = t
        return nombre, ag.correr(
            f"Problema: {problema}\n\nEstado del arte (con citas):\n{contexto[:12000]}\n\n"
            f"Genera 3 ideas NUEVAS con la técnica «{nombre}» ({guia}). Carga su protocolo con aplicar_tecnica y síguelo. "
            "Para cada idea: mecanismo, por qué podría funcionar, fórmula o estimación (compruébala con lab_*), "
            "papers en los que se apoya (con cita) y la prueba que la mataría.", etiqueta=f"ideador:{nombre}", profundidad=1)

    with ThreadPoolExecutor(max_workers=ideadores) as ex:
        ideas = list(ex.map(idear, TECNICAS_LLUVIA[:ideadores]))
    bloque = "\n\n".join(f"### Técnica {n}\n{t}" for n, t in ideas)
    on("fase", {"fase": "abogado del diablo"})
    critica = ag.correr(
        f"Problema: {problema}\n\nIdeas:\n{bloque[:40000]}\n\nHaz de abogado del diablo (carga «the-fool» y "
        "«auditoria-teoremas» con aplicar_tecnica). Para cada idea: ¿viola, evita o deja abierto cada teorema de "
        "imposibilidad (condiciones de energía, desigualdades cuánticas, masa positiva, protección cronológica, "
        "horizontes)? Busca en la base evidencia a favor y en contra. Veredicto: descartada / viva / prometedora.",
        etiqueta="abogado-del-diablo", profundidad=1)
    on("fase", {"fase": "formulas"})
    formulas = ag.correr(
        f"Ideas:\n{bloque[:30000]}\n\nCrítica:\n{critica[:12000]}\n\nComo formulista: extrae cada fórmula o "
        "estimación de las ideas vivas y compruébala con el laboratorio (lab_unidades, lab_igual, lab_cota, "
        "lab_evaluar, lab_tensor). Informe: fórmula, prueba hecha, resultado, y cifras (energía, masa, tamaño).",
        etiqueta="formulista", profundidad=1)
    on("fase", {"fase": "síntesis"})
    return ag.correr(
        f"Problema: {problema}\n\nEstado del arte:\n{contexto[:10000]}\n\nIdeas:\n{bloque[:30000]}\n\nCrítica:\n"
        f"{critica[:15000]}\n\nComprobaciones del laboratorio:\n{formulas[:15000]}\n\n"
        "Escribe la síntesis final: ideas ordenadas por promesa (tabla), por qué podrían funcionar y por qué no, "
        "cálculos hechos, qué falta comprobar y el siguiente paso concreto de cada una. Con todas las citas.",
        etiqueta="síntesis", profundidad=1)
