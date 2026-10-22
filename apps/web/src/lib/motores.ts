"use client";

/**
 * Motores del investigador IA, por orden de preferencia:
 *   1. CLI de agente en este ordenador (solo app nativa): Claude Code, Codex, Cursor. Usan la sesión de
 *      su propio CLI, trabajan en una carpeta con la biblioteca en texto y calculan con Python.
 *   2. Modelo local: Ollama (nativo o en la web si este ordenador lo tiene abierto) o un modelo en el
 *      propio navegador con WebGPU/WebAssembly (WebLLM). Gratis y sin red.
 *   3. Clave API: Anthropic u OpenAI, directa desde el navegador.
 * Todos devuelven los mismos pasos (texto, razonamiento, herramientas) para la misma interfaz.
 */
import { ejecutarHerramienta, investigarAnthropic, sistema, TOOLS, type Contexto, type Esfuerzo, type Modelo, type Msg, type Paso } from "./agente";
import { canal, esNativo, invocar } from "./nativo";

export type MotorId = "claude-code" | "codex" | "cursor" | "ollama" | "navegador" | "anthropic" | "openai";
export type TipoMotor = "cli" | "local" | "api";
export const MOTORES: { id: MotorId; tipo: TipoMotor; nombre: string; soloNativo?: boolean }[] = [
  { id: "claude-code", tipo: "cli", nombre: "Claude Code", soloNativo: true },
  { id: "codex", tipo: "cli", nombre: "Codex (ChatGPT)", soloNativo: true },
  { id: "cursor", tipo: "cli", nombre: "Cursor", soloNativo: true },
  { id: "ollama", tipo: "local", nombre: "Ollama" },
  { id: "navegador", tipo: "local", nombre: "WebGPU" },
  { id: "anthropic", tipo: "api", nombre: "Anthropic API" },
  { id: "openai", tipo: "api", nombre: "OpenAI API" },
];
const CLI_DE: Partial<Record<MotorId, string>> = { "claude-code": "claude", codex: "codex", cursor: "cursor" };

/** Error con una acción posible para la interfaz (iniciar sesión, instalar, poner la clave…). */
export class ErrorMotor extends Error {
  constructor(message: string, public tipo: "login" | "no-instalado" | "sin-modelo" | "clave" | "otro" = "otro") {
    super(message);
  }
}

export type Sesion = { motor: MotorId | null; anthropic: Msg[]; oai: OaiMsg[]; cli: string | null };
export const sesionVacia = (): Sesion => ({ motor: null, anthropic: [], oai: [], cli: null });

export type Opciones = {
  motor: MotorId; modelo: string; esfuerzo: Esfuerzo; claves: { anthropic?: string | null; openai?: string | null };
  senal: AbortSignal; onPaso: (pasos: Paso[]) => void; onEstado?: (texto: string) => void;
};

// ---------------------------------------------------------------- detección

export type Deteccion = {
  nativo: boolean;
  clis: { id: string; ruta: string; version: string }[];
  ollamaInstalado: boolean; ollamaActivo: boolean; ollamaModelos: string[]; memoriaGb: number;
  webgpu: boolean;
};

type DetRust = { clis: { id: string; ruta: string; version: string }[]; ollama_instalado: boolean; ollama_activo: boolean; ollama_modelos: string[]; memoria_gb: number };

const OLLAMA = "http://127.0.0.1:11434";

export async function detectar(): Promise<Deteccion> {
  const webgpu = typeof navigator !== "undefined" && "gpu" in navigator;
  if (esNativo()) {
    const d = await invocar<DetRust>("agente_detectar");
    return { nativo: true, clis: d.clis, ollamaInstalado: d.ollama_instalado, ollamaActivo: d.ollama_activo, ollamaModelos: d.ollama_modelos, memoriaGb: d.memoria_gb, webgpu };
  }
  // En la web: Ollama solo si este ordenador lo tiene abierto y deja entrar a esta página (OLLAMA_ORIGINS).
  let modelos: string[] | null = null;
  try {
    const r = await fetch(`${OLLAMA}/api/tags`, { signal: AbortSignal.timeout(1500) });
    if (r.ok) modelos = ((await r.json()) as { models: { name: string }[] }).models.map((m) => m.name);
  } catch { modelos = null; /* sin Ollama accesible: es lo normal en la web */ }
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0;
  return { nativo: false, clis: [], ollamaInstalado: modelos !== null, ollamaActivo: modelos !== null, ollamaModelos: modelos ?? [], memoriaGb: mem, webgpu };
}

/** Motores disponibles en orden de preferencia: CLI → local → API. */
export function disponibles(d: Deteccion, claves: { anthropic?: string | null; openai?: string | null }): MotorId[] {
  const out: MotorId[] = [];
  for (const m of MOTORES) {
    if (m.tipo === "cli") { if (d.clis.some((c) => c.id === CLI_DE[m.id])) out.push(m.id); }
    else if (m.id === "ollama") { if (d.ollamaInstalado) out.push(m.id); }
    else if (m.id === "navegador") { if (d.webgpu) out.push(m.id); }
    else if (m.id === "anthropic" ? claves.anthropic : claves.openai) out.push(m.id);
  }
  return out;
}

// ---------------------------------------------------------------- modelos locales

/** Modelo local recomendado según la memoria del equipo (mismo criterio que BIM Atlas). */
export const CATALOGO_OLLAMA = [
  { etiqueta: "qwen3.5:122b", gb: 81, memoria: 128 },
  { etiqueta: "qwen3.8:27b", gb: 17, memoria: 32 },
  { etiqueta: "qwen3.5:9b", gb: 6.6, memoria: 24 },
  { etiqueta: "qwen3.5:4b", gb: 3.4, memoria: 0 },
];
export const recomendadoOllama = (memoriaGb: number) => CATALOGO_OLLAMA.find((m) => memoriaGb >= m.memoria) ?? CATALOGO_OLLAMA.at(-1)!;

export const MODELOS_NAVEGADOR = [
  { id: "Qwen3.5-4B-q4f16_1-MLC", nombre: "Qwen3.5 4B", gb: 3 },
  { id: "Qwen3.5-2B-q4f16_1-MLC", nombre: "Qwen3.5 2B", gb: 1.6 },
  { id: "Qwen3.5-9B-q4f16_1-MLC", nombre: "Qwen3.5 9B", gb: 6 },
];

/** Petición a Ollama: por Rust en la app (sin CORS) o directa en la web. Llama a `trozo` según llega. */
async function localHttp(ruta: string, cuerpo: unknown, trozo: (t: string) => void, senal: AbortSignal): Promise<void> {
  const url = `${OLLAMA}${ruta}`;
  if (esNativo()) {
    let cancelado = false;
    senal.addEventListener("abort", () => { cancelado = true; }, { once: true });
    const estado = await invocar<number>("local_http", { url, metodo: cuerpo ? "POST" : "GET", cuerpo: cuerpo ? JSON.stringify(cuerpo) : null, canal: canal<string>((t) => { if (!cancelado) trozo(t); }) });
    if (cancelado) throw new DOMException("Cancelado", "AbortError");
    if (estado >= 400) throw new ErrorMotor(`Ollama respondió ${estado}.`);
    return;
  }
  const r = await fetch(url, { method: cuerpo ? "POST" : "GET", body: cuerpo ? JSON.stringify(cuerpo) : undefined, headers: { "content-type": "application/json" }, signal: senal });
  if (!r.ok || !r.body) throw new ErrorMotor(`Ollama respondió ${r.status}: ${await r.text().catch(() => "")}`);
  const lector = r.body.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { value, done } = await lector.read();
    if (done) break;
    trozo(value);
  }
}

/** Arranca Ollama si hace falta (solo app nativa). */
export async function prepararOllama(): Promise<void> {
  if (esNativo()) await invocar("ollama_arrancar");
}

/** Descarga un modelo en Ollama con su progreso (0–1). */
export async function descargarOllama(etiqueta: string, progreso: (f: number, estado: string) => void, senal: AbortSignal): Promise<void> {
  await prepararOllama();
  let buf = "";
  let fallo: string | null = null;
  await localHttp("/api/pull", { model: etiqueta, stream: true }, (t) => {
    buf += t;
    const lineas = buf.split("\n");
    buf = lineas.pop() ?? "";
    for (const l of lineas) {
      if (!l.trim()) continue;
      const m = JSON.parse(l) as { status?: string; total?: number; completed?: number; error?: string };
      if (m.error) fallo = m.error;
      progreso(m.total ? (m.completed ?? 0) / m.total : 0, m.status ?? "");
    }
  }, senal);
  if (fallo) throw new ErrorMotor(`No se pudo descargar ${etiqueta}: ${fallo}`);
}

// ---------------------------------------------------------------- bucle compatible con OpenAI (Ollama, OpenAI)

export type OaiMsg =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[] }
  | { role: "tool"; tool_call_id: string; content: string };

type Llamada = { texto: string; razonamiento: string; herramientas: { id: string; nombre: string; argumentos: string }[] };
type Completar = (mensajes: OaiMsg[], delta: (d: { texto?: string; razonamiento?: string }) => void, senal: AbortSignal) => Promise<Llamada>;

const HERRAMIENTAS_OAI = TOOLS.map((t) => ({ type: "function" as const, function: { name: t.name, description: t.description ?? "", parameters: t.input_schema } }));

/** Lee un flujo SSE de chat/completions (OpenAI y Ollama /v1). */
function lectorSSE(delta: (d: { texto?: string; razonamiento?: string }) => void) {
  let buf = "";
  const acc: Llamada = { texto: "", razonamiento: "", herramientas: [] };
  const trozo = (t: string) => {
    buf += t;
    const lineas = buf.split("\n");
    buf = lineas.pop() ?? "";
    for (const l of lineas) {
      const s = l.trim();
      if (!s.startsWith("data:")) continue;
      const datos = s.slice(5).trim();
      if (datos === "[DONE]") continue;
      const j = JSON.parse(datos) as { choices?: { delta?: { content?: string | null; reasoning?: string; reasoning_content?: string; tool_calls?: { index: number; id?: string; function?: { name?: string; arguments?: string } }[] } }[]; error?: { message: string } };
      if (j.error) throw new ErrorMotor(j.error.message);
      const d = j.choices?.[0]?.delta;
      if (!d) continue;
      const r = d.reasoning ?? d.reasoning_content;
      if (r) { acc.razonamiento += r; delta({ razonamiento: r }); }
      if (d.content) { acc.texto += d.content; delta({ texto: d.content }); }
      for (const tc of d.tool_calls ?? []) {
        const h = (acc.herramientas[tc.index] ??= { id: tc.id ?? `llamada-${tc.index}`, nombre: "", argumentos: "" });
        if (tc.id) h.id = tc.id;
        if (tc.function?.name) h.nombre += tc.function.name;
        if (tc.function?.arguments) h.argumentos += tc.function.arguments;
      }
    }
  };
  return { trozo, acc };
}

const completarOllama = (modelo: string): Completar => async (mensajes, delta, senal) => {
  const { trozo, acc } = lectorSSE(delta);
  await localHttp("/v1/chat/completions", { model: modelo, messages: mensajes, tools: HERRAMIENTAS_OAI, stream: true }, trozo, senal);
  return acc;
};

const completarOpenAI = (clave: string, modelo: string): Completar => async (mensajes, delta, senal) => {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST", signal: senal,
    headers: { "content-type": "application/json", authorization: `Bearer ${clave}` },
    body: JSON.stringify({ model: modelo, messages: mensajes, tools: HERRAMIENTAS_OAI, stream: true }),
  });
  if (r.status === 401 || r.status === 403) throw new ErrorMotor("La clave de OpenAI no es válida o no tiene acceso a este modelo.", "clave");
  if (!r.ok || !r.body) throw new ErrorMotor(`OpenAI respondió ${r.status}: ${(await r.text().catch(() => "")).slice(0, 300)}`);
  const { trozo, acc } = lectorSSE(delta);
  const lector = r.body.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { value, done } = await lector.read();
    if (done) break;
    trozo(value);
  }
  return acc;
};

/** Modelos de OpenAI disponibles con esa clave (los de chat más nuevos primero). */
export async function modelosOpenAI(clave: string): Promise<string[]> {
  const r = await fetch("https://api.openai.com/v1/models", { headers: { authorization: `Bearer ${clave}` } });
  if (!r.ok) throw new ErrorMotor("La clave de OpenAI no es válida.", "clave");
  const ids = ((await r.json()) as { data: { id: string; created: number }[] }).data;
  return ids.filter((m) => /^(gpt-|o\d)/.test(m.id) && !/(audio|realtime|transcribe|tts|image|search|embedding)/.test(m.id))
    .sort((a, b) => b.created - a.created).map((m) => m.id);
}

/** Herramientas por texto para modelos sin llamada nativa (el del navegador): <herramienta>{…}</herramienta>. */
const PROTOCOLO_TEXTO = `

Herramientas: ${TOOLS.map((t) => `${t.name}: ${t.description} Entrada: ${JSON.stringify(t.input_schema)}`).join("\n")}
Nunca inventes papers, autores ni cifras: cita solo ids que aparezcan en resultados de herramientas o en <fuentes>.
Para usar una herramienta escribe SOLO una línea así y espera el resultado:
<herramienta>{"nombre": "buscar_biblioteca", "entrada": {"consulta": "quantum inequality"}}</herramienta>`;

function separarPensamiento(t: string): { pensado: string; texto: string } {
  const m = /<think>([\s\S]*?)(<\/think>|$)/.exec(t);
  return m ? { pensado: m[1].trim(), texto: t.replace(m[0], "").trim() } : { pensado: "", texto: t };
}

/** Bucle de herramientas: llama al modelo, ejecuta lo que pida y repite hasta que conteste sin pedir nada. */
async function bucleOAI(historial: OaiMsg[], ctx: Contexto, completar: Completar, o: Opciones, porTexto = false): Promise<OaiMsg[]> {
  const mensajes: OaiMsg[] = [...historial];
  let reintento = false;
  // Los modelos del navegador tienen poco contexto: resultados de herramientas más cortos.
  const recorte = porTexto ? 2500 : 12000;
  const pasos: Paso[] = [];
  const emitir = () => o.onPaso(pasos.map((p) => ({ ...p })));
  for (let vuelta = 0; vuelta < 16; vuelta++) {
    let texto: Extract<Paso, { tipo: "texto" }> | null = null;
    let pensando: Extract<Paso, { tipo: "pensando" }> | null = null;
    let bruto = "";
    const r = await completar(mensajes, (d) => {
      if (d.razonamiento) {
        if (!pensando) pasos.push((pensando = { tipo: "pensando", texto: "" }));
        pensando.texto += d.razonamiento;
      }
      if (d.texto) {
        bruto += d.texto;
        // Fuera las llamadas a herramientas (también la que está a medio escribir: «<herr…»).
        const { pensado, texto: limpio } = separarPensamiento(bruto.replace(/<herramienta>[\s\S]*$/, "").replace(/<h?e?r?r?a?m?i?e?n?t?a?$/, "").replace(/<$/, ""));
        if (pensado) {
          if (!pensando) pasos.push((pensando = { tipo: "pensando", texto: "" }));
          pensando.texto = pensado;
        }
        if (limpio) {
          if (!texto) pasos.push((texto = { tipo: "texto", texto: "" }));
          texto.texto = limpio;
        }
      }
      emitir();
    }, o.senal);
    let llamadas = r.herramientas.filter((h) => h.nombre);
    if (porTexto) {
      llamadas = [...r.texto.matchAll(/<herramienta>([\s\S]*?)<\/herramienta>/g)].map((m, i) => {
        try {
          const j = JSON.parse(m[1]) as { nombre: string; entrada?: unknown };
          return { id: `t${vuelta}-${i}`, nombre: j.nombre, argumentos: JSON.stringify(j.entrada ?? {}) };
        } catch { return { id: `t${vuelta}-${i}`, nombre: "json_invalido", argumentos: m[1] }; }
      });
    }
    mensajes.push(porTexto
      ? { role: "assistant", content: r.texto }
      : { role: "assistant", content: r.texto || null, ...(llamadas.length ? { tool_calls: llamadas.map((h) => ({ id: h.id, type: "function" as const, function: { name: h.nombre, arguments: h.argumentos } })) } : {}) });
    if (!llamadas.length) {
      // Un modelo pequeño a veces se queda razonando sin responder: se le pide la respuesta una vez.
      if (!separarPensamiento(r.texto).texto.trim() && !reintento) {
        reintento = true;
        mensajes.push({ role: "user", content: "Escribe ya la respuesta final, breve, con lo que has encontrado y citando los ids entre corchetes." });
        continue;
      }
      break;
    }
    const resultados: string[] = [];
    for (const h of llamadas) {
      let entrada: Record<string, unknown> = {};
      const paso: Extract<Paso, { tipo: "herramienta" }> = { tipo: "herramienta", nombre: h.nombre, entrada };
      pasos.push(paso);
      emitir();
      try {
        entrada = JSON.parse(h.argumentos || "{}");
        paso.entrada = entrada;
        paso.resultado = await ejecutarHerramienta(h.nombre, entrada, ctx);
      } catch (err) {
        paso.error = true;
        paso.resultado = err instanceof Error ? err.message : String(err);
      }
      emitir();
      const contenido = (paso.resultado ?? "").slice(0, recorte);
      if (porTexto) resultados.push(`<resultado nombre="${h.nombre}">\n${contenido}\n</resultado>`);
      else mensajes.push({ role: "tool", tool_call_id: h.id, content: contenido });
    }
    if (porTexto) mensajes.push({ role: "user", content: resultados.join("\n") });
  }
  return mensajes;
}

// ---------------------------------------------------------------- modelo en el navegador (WebGPU)

type MotorWeb = { chat: { completions: { create: (p: unknown) => Promise<AsyncIterable<{ choices: { delta?: { content?: string } }[] }>> } }; interruptGenerate: () => void };
let web: { id: string; motor: Promise<MotorWeb> } | null = null;

/** Carga (una vez) el modelo en un Web Worker con WebGPU; la primera vez descarga sus pesos y los guarda en caché. */
export function cargarNavegador(modelo: string, progreso: (f: number, texto: string) => void): Promise<MotorWeb> {
  if (web?.id === modelo) return web.motor;
  const motor = import("@mlc-ai/web-llm").then(({ CreateWebWorkerMLCEngine }) =>
    CreateWebWorkerMLCEngine(new Worker(new URL("../workers/llm.worker.ts", import.meta.url), { type: "module" }), modelo, {
      initProgressCallback: (r: { progress: number; text: string }) => progreso(r.progress, r.text),
    }) as unknown as Promise<MotorWeb>,
  );
  web = { id: modelo, motor };
  motor.catch(() => { web = null; });
  return motor;
}

const completarNavegador = (modelo: string, progreso: (f: number, t: string) => void): Completar => async (mensajes, delta, senal) => {
  const m = await cargarNavegador(modelo, progreso);
  const parar = () => m.interruptGenerate();
  senal.addEventListener("abort", parar, { once: true });
  const acc: Llamada = { texto: "", razonamiento: "", herramientas: [] };
  // Sin razonamiento largo: en el navegador el contexto y la velocidad son justos.
  const flujo = await m.chat.completions.create({ messages: mensajes, stream: true, temperature: 0.6, max_tokens: 1800, extra_body: { enable_thinking: false } });
  for await (const c of flujo) {
    const t = c.choices[0]?.delta?.content;
    if (t) { acc.texto += t; delta({ texto: t }); }
  }
  senal.removeEventListener("abort", parar);
  if (senal.aborted) throw new DOMException("Cancelado", "AbortError");
  return acc;
};

// ---------------------------------------------------------------- CLIs (app nativa)

/** Instrucciones para los CLIs: las del laboratorio y cómo usar la biblioteca en texto de su carpeta. */
function instruccionesCli(ctx: Contexto): string {
  const ecuaciones = ctx.ecuaciones.map((e) => `| ${e.id} | ${e.titulo} | \`${e.resultado}\` | ${e.unidad} | ${Object.entries(e.entradas).map(([k, v]) => `${k}=${v.defecto} ${v.unidad}`).join(", ")} | ${e.paper} |`).join("\n");
  return `${sistema(ctx).replace(/buscar_biblioteca|leer_paper|buscar_patentes|calcular|ecuacion_proyecto/g, (m) => `«${m}»`)}

## Cómo trabajar en esta carpeta

No tienes las herramientas «buscar_biblioteca», «leer_paper», «calcular» ni «ecuacion_proyecto»: haz lo mismo con las tuyas.

| Archivo | Qué hay (una línea JSON por elemento) |
|---|---|
| biblioteca/indice.jsonl | Un paper por línea: id, t (título), te/tf (título es/fr), a (autores), y (año), k (tipo), s (subsistemas), c (citas), f (países) |
| biblioteca/fichas.jsonl | Ficha completa: id, title, authors, year, venue, doi, arxiv, license, kind, relevance, abstracts {es,en,fr} |
| biblioteca/fragmentos.jsonl | Texto completo troceado (papers de licencia abierta, ecuaciones, informes): id, p (paper), t (título), s (sección), x (texto), u (enlace) |
| biblioteca/patentes.jsonl | Patentes: n (número), t, y (fecha), i (inventores), h (titular), o (oficina), pp (país de prioridad), e (estado), cpc, ab (resumen), u (enlace) |

- Busca con grep o rg sin distinguir mayúsculas (los textos están sobre todo en inglés), p. ej. \`rg -i "quantum inequalit" biblioteca/fragmentos.jsonl | head\`.
- Calcula con python3 (math, y numpy/sympy si están). Constantes SI: ${Object.entries(ctx.constantes).map(([k, v]) => `${k}=${v}`).join(", ")}.
- No edites ni borres archivos. Responde en Markdown.

## Ecuaciones verificadas del proyecto

| id | título | resultado | unidad | entradas por defecto | fuente |
|---|---|---|---|---|---|
${ecuaciones}
`;
}

type Evento = { o: "out" | "err" | "fin"; l?: string; codigo?: number; parado?: boolean };
type J = Record<string, unknown> & { type?: string; subtype?: string };

/** Traduce la salida JSON de cada CLI a pasos. Devuelve la sesión (para seguir la conversación) y el error si lo hay. */
function lectorCli(cli: string, pasos: Paso[], emitir: () => void) {
  let sesion: string | null = null;
  let error: string | null = null;
  let texto: Extract<Paso, { tipo: "texto" }> | null = null;
  let pensando: Extract<Paso, { tipo: "pensando" }> | null = null;
  let vioDelta = false;
  const herramientas = new Map<string, Extract<Paso, { tipo: "herramienta" }>>();
  const escribir = (t: string, completo = false) => {
    if (!texto) pasos.push((texto = { tipo: "texto", texto: "" }));
    if (completo || t.startsWith(texto.texto)) texto.texto = t; else if (texto.texto.endsWith(t)) return; else texto.texto += t;
  };
  const pensar = (t: string) => {
    if (!pensando) pasos.push((pensando = { tipo: "pensando", texto: "" }));
    pensando.texto += t;
  };
  const herramienta = (id: string, nombre: string, entrada: Record<string, unknown>) => {
    if (herramientas.has(id)) return;
    const p: Extract<Paso, { tipo: "herramienta" }> = { tipo: "herramienta", nombre, entrada };
    herramientas.set(id, p);
    pasos.push(p);
    texto = null;
    pensando = null;
  };
  const resultado = (id: string, r: unknown, esError = false) => {
    const p = herramientas.get(id);
    if (!p) return;
    p.resultado = (typeof r === "string" ? r : Array.isArray(r) ? r.map((x) => (x as { text?: string }).text ?? "").join("\n") : JSON.stringify(r ?? "")).slice(0, 8000);
    p.error = esError;
  };

  const linea = (j: J) => {
    if (typeof j.session_id === "string") sesion = j.session_id;
    if (cli === "claude") {
      if (j.type === "stream_event") {
        const ev = j.event as { type: string; delta?: { type: string; text?: string; thinking?: string } };
        if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta" && ev.delta.text) { vioDelta = true; escribir(ev.delta.text); }
        if (ev.type === "content_block_delta" && ev.delta?.type === "thinking_delta" && ev.delta.thinking) pensar(ev.delta.thinking);
      } else if (j.type === "assistant") {
        for (const b of ((j.message as { content?: J[] })?.content ?? [])) {
          if (b.type === "tool_use") herramienta(String(b.id), String(b.name), (b.input as Record<string, unknown>) ?? {});
          else if (b.type === "text" && !vioDelta) escribir(String(b.text ?? ""));
        }
        vioDelta = false;
      } else if (j.type === "user") {
        for (const b of ((j.message as { content?: J[] })?.content ?? [])) if (b.type === "tool_result") resultado(String(b.tool_use_id), b.content, !!b.is_error);
      } else if (j.type === "result" && j.is_error) error = String(j.result ?? j.subtype ?? "error");
      if (j.error === "authentication_failed") error ??= "Not logged in";
    } else if (cli === "codex") {
      if (j.type === "thread.started") sesion = String(j.thread_id);
      const it = j.item as (J & { id?: string; text?: string; command?: string; aggregated_output?: string; exit_code?: number; query?: string }) | undefined;
      if (it && (j.type === "item.completed" || j.type === "item.started" || j.type === "item.updated")) {
        if (it.type === "agent_message" && it.text) { texto = null; escribir(it.text, true); }
        else if (it.type === "reasoning" && it.text && j.type === "item.completed") pensar(it.text + "\n");
        else if (it.type === "command_execution") {
          herramienta(String(it.id), "shell", { command: it.command });
          if (j.type === "item.completed") resultado(String(it.id), it.aggregated_output ?? "", (it.exit_code ?? 0) !== 0);
        } else if (it.type === "web_search" && j.type === "item.completed") pasos.push({ tipo: "web", consulta: String(it.query ?? "") });
      }
      if (j.type === "turn.failed") error = String((j.error as { message?: string })?.message ?? "Codex falló");
      if (j.type === "error") error = String(j.message ?? "Codex falló");
    } else {
      if (j.type === "assistant") {
        const t = ((j.message as { content?: { type: string; text?: string }[] })?.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
        if (t) escribir(t);
      } else if (j.type === "thinking" && typeof j.text === "string") pensar(j.text);
      else if (j.type === "tool_call") {
        const tc = (j.tool_call ?? {}) as Record<string, { args?: Record<string, unknown>; result?: unknown }>;
        const [clave, v] = Object.entries(tc)[0] ?? ["herramienta", {}];
        const id = String(j.call_id ?? clave);
        herramienta(id, clave.replace(/ToolCall$/, ""), v?.args ?? {});
        if (j.subtype === "completed") {
          const r = v?.result as { success?: { content?: unknown; stdout?: string }; error?: { message?: string } } | undefined;
          resultado(id, r?.success?.content ?? r?.success?.stdout ?? r?.error?.message ?? r, !!r?.error);
        }
      } else if (j.type === "result" && j.is_error) error = String(j.result ?? "error");
    }
    emitir();
  };
  return { linea, estado: () => ({ sesion, error }) };
}

/** Solo para pruebas. */
export const _lectorCli = lectorCli;

async function investigarCli(motor: MotorId, sesion: string | null, pregunta: string, ctx: Contexto, o: Opciones): Promise<string | null> {
  const cli = CLI_DE[motor]!;
  await invocar("agente_espacio", { instrucciones: instruccionesCli(ctx) });
  const pasos: Paso[] = [];
  const emitir = () => o.onPaso(pasos.map((p) => ({ ...p })));
  const lector = lectorCli(cli, pasos, emitir);
  const errores: string[] = [];
  let fin: Evento | null = null;
  const parar = () => void invocar("agente_parar");
  o.senal.addEventListener("abort", parar, { once: true });
  try {
    await invocar("agente_cli", {
      cli, mensaje: pregunta, sesion, modelo: o.modelo || null,
      canal: canal<Evento>((e) => {
        if (e.o === "out" && e.l) {
          try { lector.linea(JSON.parse(e.l) as J); } catch { if (e.l.trim()) errores.push(e.l); }
        } else if (e.o === "err" && e.l) errores.push(e.l);
        else if (e.o === "fin") fin = e;
      }),
    });
  } finally {
    o.senal.removeEventListener("abort", parar);
  }
  if (o.senal.aborted || (fin as Evento | null)?.parado) throw new DOMException("Cancelado", "AbortError");
  const { sesion: nueva, error } = lector.estado();
  const codigo = (fin as Evento | null)?.codigo ?? 0;
  const detalle = error ?? (codigo !== 0 ? errores.slice(-6).join("\n") || `El CLI terminó con código ${codigo}.` : null);
  if (detalle) {
    const login = /not logged in|log ?in|authenticat|unauthori|sign in|credentials|api key/i.test(detalle);
    throw new ErrorMotor(detalle, login ? "login" : "otro");
  }
  return nueva ?? sesion;
}

export const iniciarSesionCli = (motor: MotorId) => invocar("agente_login", { cli: CLI_DE[motor] });

// ---------------------------------------------------------------- entrada única

/** Una vuelta del investigador con el motor elegido. Cambiar de motor empieza una conversación nueva. */
export async function investigar(s: Sesion, pregunta: string, ctx: Contexto, o: Opciones): Promise<Sesion> {
  const base = s.motor === o.motor ? s : { ...sesionVacia(), motor: o.motor };
  switch (o.motor) {
    case "claude-code":
    case "codex":
    case "cursor":
      return { ...base, cli: await investigarCli(o.motor, base.cli, pregunta, ctx, o) };
    case "anthropic": {
      if (!o.claves.anthropic) throw new ErrorMotor("Falta la clave de Anthropic.", "clave");
      const r = await investigarAnthropic([...base.anthropic, { role: "user", content: pregunta }], ctx, {
        clave: o.claves.anthropic, modelo: (o.modelo || "claude-opus-5-5") as Modelo, esfuerzo: o.esfuerzo, senal: o.senal, onPaso: o.onPaso,
      });
      return { ...base, anthropic: r.historial };
    }
    case "openai": {
      if (!o.claves.openai) throw new ErrorMotor("Falta la clave de OpenAI.", "clave");
      if (!o.modelo) throw new ErrorMotor("Elige un modelo de OpenAI.", "sin-modelo");
      return { ...base, oai: await bucleOAI(conPregunta(base.oai, ctx, pregunta, false), ctx, completarOpenAI(o.claves.openai, o.modelo), o) };
    }
    case "ollama": {
      if (!o.modelo) throw new ErrorMotor("Descarga o elige un modelo local.", "sin-modelo");
      await prepararOllama();
      return { ...base, oai: await bucleOAI(conPregunta(base.oai, ctx, pregunta, false), ctx, completarOllama(o.modelo), o) };
    }
    case "navegador": {
      // Un modelo pequeño no siempre decide buscar: se busca antes en la biblioteca y se le dan las fuentes.
      const modelo = o.modelo || MODELOS_NAVEGADOR[0].id;
      const previo: Paso = { tipo: "herramienta", nombre: "buscar_biblioteca", entrada: { consulta: pregunta } };
      o.onPaso([previo]);
      try { previo.resultado = await ejecutarHerramienta("buscar_biblioteca", { consulta: pregunta, max: 6 }, ctx); }
      catch (err) { previo.resultado = err instanceof Error ? err.message : String(err); previo.error = true; }
      const conFuentes = `${pregunta}\n\n<fuentes>\n${(previo.resultado ?? "").slice(0, 3500)}\n</fuentes>\nResponde con estas fuentes (pide más con una herramienta si hace falta). Cita solo ids que aparezcan en ellas; si no bastan, dilo. No inventes papers ni cifras.`;
      const onPaso = (pasos: Paso[]) => o.onPaso([previo, ...pasos]);
      return { ...base, oai: await bucleOAI(conPregunta(base.oai, ctx, conFuentes, true), ctx, completarNavegador(modelo, (f, t) => o.onEstado?.(`${Math.round(f * 100)} % · ${t}`)), { ...o, onPaso }, true) };
    }
  }
}

/** Historial OAI con las instrucciones al principio y la pregunta nueva al final. */
function conPregunta(h: OaiMsg[], ctx: Contexto, pregunta: string, porTexto: boolean): OaiMsg[] {
  const base: OaiMsg[] = h.length ? h : [{ role: "system", content: sistema(ctx) + (porTexto ? PROTOCOLO_TEXTO : "") }];
  return [...base, { role: "user", content: pregunta }];
}
