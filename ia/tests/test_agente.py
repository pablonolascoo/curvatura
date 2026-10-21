"""El agente: herramientas, subagentes recursivos y lluvia de ideas, con un proveedor simulado (sin red)."""

import json

from curvatura_ia import agente as A
from curvatura_ia.herramientas import REGISTRO, ejecutar


class Guion:
    """Proveedor falso: el agente principal pide una herramienta y un subagente; el subagente responde."""

    def __init__(self):
        self.llamadas = []

    def llamar(self, modelo, sistema, mensajes, herramientas, max_tokens=8000):
        self.llamadas.append((modelo, [h["name"] for h in herramientas]))
        ultimo = mensajes[-1]["content"]
        es_sub = "Eres un subagente" in sistema
        if isinstance(ultimo, str) and not es_sub:
            return [{"type": "text", "text": "Busco."},
                    {"type": "tool_use", "id": "t1", "name": "lab_igual", "input": {"a": "sin(x)^2 + cos(x)^2 = 1"}},
                    {"type": "tool_use", "id": "t2", "name": "investigar", "input": {"pregunta": "¿Qué es la NEC?"}}], "tool_use"
        if isinstance(ultimo, str) and es_sub:
            return [{"type": "text", "text": "Informe del subagente."}], "end_turn"
        res = {b["tool_use_id"]: b["content"] for b in ultimo}
        assert "demostrada" in json.dumps(res["t1"])
        assert res["t2"] == "Informe del subagente."
        return [{"type": "text", "text": "Respuesta final [cita](url)."}], "end_turn"


def test_registro_completo():
    for n in ["buscar", "buscar_figuras", "ver_paper", "ecuaciones", "ver_figura", "lab_igual", "lab_cota", "lab_z3",
              "lab_evaluar", "lab_tensor", "lab_descubrir", "lab_unidades", "aplicar_tecnica", "tecnicas_pensamiento"]:
        assert n in REGISTRO
        assert REGISTRO[n].esquema()["type"] == "object"


def test_herramientas_sin_red():
    assert "demostrada" in ejecutar("lab_igual", {"a": "(a+b)^2", "b": "a^2+2*a*b+b^2"})[0]
    assert '"ok": false' in ejecutar("lab_unidades", {"formula": "E = m*c", "dims": {"E": "energia", "m": "masa", "c": "velocidad"}})[0]
    assert "triz-espaciotiempo" in ejecutar("tecnicas_pensamiento", {})[0]
    assert "error" in ejecutar("no_existe", {})[0]


def test_agente_con_subagente():
    eventos = []
    g = Guion()
    ag = A.Agente(prov=g, on=lambda t, d: eventos.append(t))
    r = ag.correr("pregunta")
    assert r.startswith("Respuesta final")
    assert "subagente" in eventos and "herramienta" in eventos
    # el principal ofrece «investigar»; el subagente (profundidad 1 de 2) también puede abrir otros
    assert "investigar" in g.llamadas[0][1]
    assert ag._gasto["subagentes"] == 1
