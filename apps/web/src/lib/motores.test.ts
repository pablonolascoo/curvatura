import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import type { Paso } from "./agente";
import { _lectorCli } from "./motores";

const leer = (cli: string, lineas: unknown[]) => {
  const pasos: Paso[] = [];
  const l = _lectorCli(cli, pasos, () => {});
  for (const j of lineas) l.linea(j as Record<string, unknown>);
  return { pasos, ...l.estado() };
};

test("Claude Code sin sesión: error de inicio de sesión (salida real)", () => {
  const lineas = readFileSync(new URL("./__fixtures__/claude-sin-sesion.jsonl", import.meta.url), "utf8").trim().split("\n").map((l) => JSON.parse(l));
  const r = leer("claude", lineas);
  expect(r.error).toContain("Not logged in");
});

test("Claude Code: texto en directo, herramienta con resultado y sesión", () => {
  const r = leer("claude", [
    { type: "system", subtype: "init", session_id: "s1" },
    { type: "stream_event", event: { type: "content_block_delta", delta: { type: "thinking_delta", thinking: "Busco…" } } },
    { type: "stream_event", event: { type: "content_block_delta", delta: { type: "text_delta", text: "Miro la " } } },
    { type: "stream_event", event: { type: "content_block_delta", delta: { type: "text_delta", text: "biblioteca." } } },
    { type: "assistant", message: { content: [{ type: "text", text: "Miro la biblioteca." }, { type: "tool_use", id: "t1", name: "Grep", input: { pattern: "casimir" } }] } },
    { type: "user", message: { content: [{ type: "tool_result", tool_use_id: "t1", content: "3 coincidencias" }] } },
    { type: "stream_event", event: { type: "content_block_delta", delta: { type: "text_delta", text: "Veredicto: viva." } } },
    { type: "result", subtype: "success", is_error: false, result: "Veredicto: viva.", session_id: "s1" },
  ]);
  expect(r.sesion).toBe("s1");
  expect(r.error).toBeNull();
  expect(r.pasos.map((p) => p.tipo)).toEqual(["pensando", "texto", "herramienta", "texto"]);
  expect(r.pasos[1]).toEqual({ tipo: "texto", texto: "Miro la biblioteca." });
  expect(r.pasos[2]).toMatchObject({ nombre: "Grep", resultado: "3 coincidencias" });
});

test("Codex: hilo, orden con salida y mensaje final", () => {
  const r = leer("codex", [
    { type: "thread.started", thread_id: "th-9" },
    { type: "item.started", item: { id: "c1", type: "command_execution", command: "rg -i casimir biblioteca/fragmentos.jsonl" } },
    { type: "item.completed", item: { id: "c1", type: "command_execution", command: "rg -i casimir", aggregated_output: "12 líneas", exit_code: 0 } },
    { type: "item.completed", item: { id: "m1", type: "agent_message", text: "Hay 12 fragmentos." } },
    { type: "turn.completed", usage: {} },
  ]);
  expect(r.sesion).toBe("th-9");
  expect(r.pasos[0]).toMatchObject({ tipo: "herramienta", nombre: "shell", resultado: "12 líneas" });
  expect(r.pasos[1]).toEqual({ tipo: "texto", texto: "Hay 12 fragmentos." });
});

test("Cursor: deltas sin duplicar el mensaje final y llamada a herramienta", () => {
  const r = leer("cursor", [
    { type: "system", subtype: "init", session_id: "cu-1" },
    { type: "assistant", message: { content: [{ type: "text", text: "Hola, " }] } },
    { type: "assistant", message: { content: [{ type: "text", text: "mundo." }] } },
    { type: "tool_call", subtype: "started", call_id: "k1", tool_call: { readToolCall: { args: { path: "nota.txt" } } } },
    { type: "tool_call", subtype: "completed", call_id: "k1", tool_call: { readToolCall: { args: { path: "nota.txt" }, result: { success: { content: "hola" } } } } },
    { type: "result", subtype: "success", is_error: false, result: "Hola, mundo.", session_id: "cu-1" },
  ]);
  expect(r.sesion).toBe("cu-1");
  expect(r.pasos[0]).toEqual({ tipo: "texto", texto: "Hola, mundo." });
  expect(r.pasos[1]).toMatchObject({ nombre: "read", resultado: "hola" });
});
