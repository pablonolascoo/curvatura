---
name: investigar
description: Investigar a fondo cualquier pregunta sobre motores de curvatura, energía negativa, agujeros de gusano, propulsión exótica o la física del proyecto usando el RAG multimodal de Curvatura (papers completos, ecuaciones, figuras, patentes) con subagentes recursivos y citas exactas. Úsala para preguntas de investigación, revisiones del estado del arte, buscar quién calculó qué, recuperar gráficas, o comprobar si una idea ya existe. Requiere el MCP `curvatura` (copia .mcp.json.example a .mcp.json).
---

# Investigar con el RAG de Curvatura

## Herramientas (MCP `curvatura`)

`buscar` (híbrida: semántica + palabras, filtros por tipo/año/subsistema) · `buscar_figuras` (por descripción visual) · `ver_paper` · `leer_seccion` · `ecuaciones` · `ver_figura` (devuelve la imagen) · `referencias` · `estado_base` · `lab_*` (ver skill `formulas`) · `tecnicas_pensamiento` / `aplicar_tecnica`.

## Bucle de investigación (se repite hasta que no aparezca nada nuevo)

1. **Descompón** la pregunta en 3–6 subpreguntas: definiciones, resultados clave, objeciones, alternativas, números.
2. **Abre en paralelo un subagente por subpregunta** (Agent tool, tipo `investigador` en `.claude/agents/`), cada uno con su consulta. Cada subagente puede abrir a su vez otros (máximo dos niveles).
3. **Busca con variedad**: en inglés y en español, sinónimos («warp drive», «warp bubble», «superluminal spacetime»), nombres de autores, nombres de ecuaciones; filtra por `tipos` (`ecuacion`, `figura`, `patente`) y por años para lo más reciente.
4. **Lee la fuente, no el fragmento**: con `ver_paper` y `leer_seccion` abre el contexto; con `ecuaciones` trae el LaTeX exacto; con `ver_figura` mira la gráfica antes de describirla.
5. **Sigue el rastro**: `referencias` del paper clave → busca esas referencias en la base → repite.
6. **Comprueba** cada fórmula o número con el laboratorio (`lab_*`).
7. **Contradicciones**: si dos papers discrepan, dilo, cita ambos y explica la diferencia de supuestos.

## Atribución (obligatoria)

- Cada afirmación tomada de la base lleva su cita: `[Autores (año)](url)`, tal como viene en el campo `cita`/`url`.
- Para figuras: «Figura n de [cita](url)».
- Nunca cites algo que no hayas recuperado en esta sesión. Si no está en la base, dilo y sugiere añadirlo (`library:harvest`).
- Respeta licencias: de papers sin licencia abierta se resume y se cita; no se reproducen párrafos largos.

## Entrega

1. Respuesta directa (3–6 frases).
2. Desarrollo por puntos con citas, separando **establecido / plausible / especulativo**.
3. Tabla de fórmulas y cifras con la comprobación del laboratorio.
4. Fuentes (lista) y siguientes pasos concretos.
