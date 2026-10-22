# Registro de investigación

Diario cronológico. Cada entrada: fecha, quién (persona o agente de IA), qué se hizo, herramientas, resultado y enlaces.

## 2026-10-22 · Sesión 1 de ideas (IA)

**Objetivo.** Atacar los obstáculos bloqueantes de [`../obstaculos.md`](../obstaculos.md) con pensamiento lateral, TRIZ, analogías y primeros principios, apoyándose en la base completa (3.429 papers analizados, 48.466 fragmentos vectorizados, 227 patentes) y comprobando cada fórmula en el laboratorio.

**Método.** Cinco agentes de IA en paralelo, uno por frente, con el bucle: idea → apoyo en papers → cálculo → impedimento → corrección → veredicto. Después, una crítica adversaria común y la síntesis en [`soluciones.md`](soluciones.md).

| Frente | Obstáculos | Técnicas | Informe |
|---|---|---|---|
| A · Energía negativa | 1, 3 | TRIZ del espaciotiempo, auditoría de teoremas | [`ideas/a-energia-negativa.md`](ideas/a-energia-negativa.md) |
| B · Masa de la cáscara | 6, 8 | Analogía, primeros principios | [`ideas/b-masa-cascara.md`](ideas/b-masa-cascara.md) |
| C · Aceleración | 2, 12 | Inversión, provocación | [`ideas/c-aceleracion.md`](ideas/c-aceleracion.md) |
| D · Horizontes y vacío | 4, 5, 10 | Primeros principios, seis sombreros | [`ideas/d-horizontes.md`](ideas/d-horizontes.md) |
| E · Fuente material | 7, 9, 11 | Bisociación, SCAMPER | [`ideas/e-fuente-material.md`](ideas/e-fuente-material.md) |

### Resultado de la sesión 1

- **Incidencia:** el primer intento se cortó por un apagado del equipo. Causa probable: cada agente lanzaba procesos que cargaban el modelo de búsqueda (~2,5 GB) a la vez que se vectorizaba. Se rehízo con el servidor MCP compartido (un solo modelo en memoria).
- **Frentes A–E:** cinco informes en [`ideas/`](ideas/), cada uno con al menos tres iteraciones idea → cálculo → impedimento → corrección.
- **Crítica cruzada (F):** [`ideas/f-critica-cruzada.md`](ideas/f-critica-cruzada.md). Confirmó κ = 2σ(1 − 1/v), la cota de energía cinética y la prueba Z3; corrigió la masa mínima de la cáscara (0,095 → ~0,18 M_J) y el factor frente al cohete de fotones (99 → 101); encontró el choque entre «cáscara ligera» y «materia nuclear».
- **Síntesis:** [`soluciones.md`](soluciones.md): un camino que sobrevive (cáscara subluminal de energía positiva montada en movimiento), cinco leyes y la lista de descartes.
- **Siguiente sesión:** los cálculos de la columna «Siguiente cálculo» de `soluciones.md`, empezando por el optimizador de la masa mínima y la TOV anisótropa con materia nuclear.
