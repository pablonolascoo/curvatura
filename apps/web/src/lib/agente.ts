"use client";

/**
 * Investigador IA del laboratorio. Corre entero en el navegador con la clave de quien lo usa
 * (nunca pasa por nuestros servidores) y sus herramientas trabajan sobre los datos de la propia web:
 * texto completo de la biblioteca, fichas de papers, ecuaciones del proyecto y el motor de fórmulas.
 */
import Anthropic from "@anthropic-ai/sdk";
import { compile, parse } from "@curvatura/formula";
import { buscarTexto } from "./buscadorTexto";
import { getJSON, INDICE_BIBLIOTECA, shardDe } from "./datos";

export type Msg = Anthropic.Beta.BetaMessageParam;
export type EcuacionAgente = { id: string; paper: string; titulo: string; resultado: string; unidad: string; entradas: Record<string, { min: number; max: number; defecto: number; unidad: string }> };
export type Contexto = { lang: string; estado: string; ecuaciones: EcuacionAgente[]; constantes: Record<string, number> };

export const MODELOS = [
  { id: "claude-opus-5-5", nombre: "Claude Opus 5.5" },
  { id: "claude-sonnet-5-5", nombre: "Claude Sonnet 5.5" },
  { id: "claude-haiku-5-5", nombre: "Claude Haiku 5.5" },
  { id: "claude-fable-5-1", nombre: "Claude Fable 5.1" },
] as const;
export type Modelo = (typeof MODELOS)[number]["id"];
export type Esfuerzo = "low" | "medium" | "high" | "xhigh" | "max";

/** Paso visible del agente (para la interfaz). */
export type Paso =
  | { tipo: "texto"; texto: string }
  | { tipo: "pensando"; texto: string }
  | { tipo: "herramienta"; nombre: string; entrada: Record<string, unknown>; resultado?: string; error?: boolean }
  | { tipo: "web"; consulta: string };

type Entrada = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

type FilaIndice = { id: string; t: string; te?: string; tf?: string; a: string[]; y: number | null; k: string };
type Paper = { id: string; title: string; authors: string[]; year: number | null; venue: string | null; doi: string | null; arxiv: string | null; source: string | null; license: string; kind: string; relevance: string; abstracts?: Record<string, string>; titles?: Record<string, string> };

const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

// ---------- Herramientas ----------

export const TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: "buscar_biblioteca",
    description:
      "Busca en la biblioteca de Curvatura (~3400 papers sobre motores de curvatura, condiciones de energía, desigualdades cuánticas, Casimir, horizontes, materia exótica…). Busca a la vez en títulos y en el texto completo de los papers de licencia abierta, las ecuaciones y los informes. Devuelve ids de paper con fragmentos. Usa términos técnicos en inglés para el texto completo (la mayoría de papers están en inglés). Llámala varias veces con consultas distintas para cubrir el tema.",
    input_schema: {
      type: "object",
      properties: {
        consulta: { type: "string", description: "Términos de búsqueda, p. ej. «quantum inequality warp bubble wall thickness»." },
        max: { type: "integer", description: "Resultados máximos (1–15, por defecto 8)." },
      },
      required: ["consulta"],
    },
    eager_input_streaming: true,
  },
  {
    name: "leer_paper",
    description: "Ficha de un paper de la biblioteca por su id: título, autores, año, revista, DOI/arXiv, tipo (solución, restricción…) y resumen. Úsala antes de citar un paper para no atribuirle algo que no dice.",
    input_schema: { type: "object", properties: { id: { type: "string", description: "Id del paper, p. ej. «fuchs-2024»." } }, required: ["id"] },
    eager_input_streaming: true,
  },
  {
    name: "calcular",
    description:
      "Evalúa una expresión numérica con el motor de fórmulas del proyecto (SI). Sintaxis: + - * / ^, paréntesis, sqrt, exp, log (neperiano), sin, cos, tan, sinh, cosh, tanh, sech, abs, pi, e; integral definida int(f, x, a, b); derivada diff(f, x). Nombres de variable con subíndice: v_s, R_1. Constantes disponibles sin declararlas: hbar, c, G, k_B, M_J, M_sun, L_P y el resto de constants.yaml. Con «barrer» recorre una variable en un intervalo y devuelve mínimo, máximo y cambios de signo: úsalo para comprobar cotas y signos, no te fíes de un solo punto.",
    input_schema: {
      type: "object",
      properties: {
        expresion: { type: "string", description: "Expresión, p. ej. «2/3 * beta * R_1 * c^2 / G / M_J»." },
        variables: { type: "object", description: "Valores numéricos de las variables, p. ej. {\"beta\": 0.02, \"R_1\": 100}.", additionalProperties: { type: "number" } },
        barrer: {
          type: "object",
          description: "Opcional: barrido de una variable.",
          properties: { variable: { type: "string" }, desde: { type: "number" }, hasta: { type: "number" }, puntos: { type: "integer" }, log: { type: "boolean" } },
          required: ["variable", "desde", "hasta"],
        },
      },
      required: ["expresion"],
    },
    eager_input_streaming: true,
  },
  {
    name: "buscar_patentes",
    description: "Busca en las patentes relacionadas que vigila el proyecto (propulsión sin propelente, gravedad, inercia, Casimir…): número, título, fecha, inventores, titular, oficina, país de prioridad, estado legal, CPC y resumen oficial, con enlace. Sin consulta devuelve las más recientes.",
    input_schema: { type: "object", properties: { consulta: { type: "string" }, max: { type: "integer", description: "1–15, por defecto 8." } } },
    eager_input_streaming: true,
  },
  {
    name: "ecuacion_proyecto",
    description: "Evalúa una de las ecuaciones verificadas del proyecto (cada una sale de un paper) con los valores que indiques; las entradas que no des toman su valor por defecto. Sin id, lista las ecuaciones disponibles con sus entradas y unidades.",
    input_schema: {
      type: "object",
      properties: { id: { type: "string" }, valores: { type: "object", additionalProperties: { type: "number" } } },
    },
    eager_input_streaming: true,
  },
];

const fmt = (x: number) => (Math.abs(x) >= 1e5 || (Math.abs(x) < 1e-3 && x !== 0) ? x.toExponential(4) : String(+x.toPrecision(6)));

async function buscarBiblioteca(e: Entrada): Promise<string> {
  const q = str(e.consulta);
  if (!q) throw new Error("falta «consulta»");
  const max = Math.min(15, Math.max(1, num(e.max) ?? 8));
  const [indice, frag] = await Promise.all([getJSON<FilaIndice[]>(INDICE_BIBLIOTECA), buscarTexto(q)]);
  const terms = fold(q).split(/\W+/).filter((t) => t.length > 2);
  const porTitulo = indice
    .map((p) => {
      const h = fold(`${p.t} ${p.te ?? ""} ${p.tf ?? ""}`);
      return { p, s: terms.reduce((a, t) => a + (h.includes(t) ? 1 : 0), 0) };
    })
    .filter((x) => x.s >= Math.max(1, Math.ceil(terms.length * 0.6)))
    .sort((a, b) => b.s - a.s)
    .slice(0, max);
  const fila = new Map(indice.map((p) => [p.id, p]));
  const out = new Map<string, string>();
  for (const f of frag) {
    const id = f.p ?? f.id;
    if (out.size >= max) break;
    if (out.has(id)) continue;
    const p = fila.get(id);
    const titulo = p ? `${p.t} (${p.y ?? "s. f."})` : f.t;
    out.set(id, `- [${id}] ${titulo} · ${f.k}${f.s ? ` · sección «${f.s}»` : ""}\n  «${f.x.replace(/\s+/g, " ").slice(0, 420)}»`);
  }
  for (const { p } of porTitulo) {
    if (out.size >= max * 1.5) break;
    if (!out.has(p.id)) out.set(p.id, `- [${p.id}] ${p.t} (${p.y ?? "s. f."}) · ${p.k} · ${p.a.slice(0, 3).join(", ")}${p.a.length > 3 ? " et al." : ""}`);
  }
  return out.size ? `${out.size} resultados para «${q}»:\n${[...out.values()].join("\n")}` : `Sin resultados para «${q}». Prueba con otros términos (en inglés para el texto completo).`;
}

async function leerPaper(e: Entrada, ctx: Contexto): Promise<string> {
  const id = str(e.id);
  if (!id) throw new Error("falta «id»");
  const shard = await getJSON<Record<string, Paper>>(shardDe(id));
  const p = shard[id];
  if (!p) throw new Error(`no hay ningún paper con id «${id}» (usa buscar_biblioteca)`);
  const resumen = p.abstracts?.[ctx.lang] ?? p.abstracts?.en ?? p.abstracts?.es ?? Object.values(p.abstracts ?? {})[0] ?? "(sin resumen)";
  return [
    `id: ${p.id}`,
    `título: ${p.title}`,
    `autores: ${p.authors.join(", ")}`,
    `año: ${p.year ?? "s. f."} · ${p.venue ?? ""}`,
    p.doi ? `doi: https://doi.org/${p.doi}` : "",
    p.arxiv ? `arXiv: https://arxiv.org/abs/${p.arxiv}` : "",
    `tipo: ${p.kind} · relevancia: ${p.relevance} · licencia: ${p.license}`,
    `ficha en la web: /${ctx.lang}/biblioteca/${p.id}/`,
    `resumen: ${resumen.slice(0, 3500)}`,
  ].filter(Boolean).join("\n");
}

function evaluar(expr: string, scope: Record<string, number>): number {
  const ast = parse(expr);
  const v = compile(ast)(scope);
  if (!Number.isFinite(v)) {
    const faltan = [...expr.matchAll(/[A-Za-z][A-Za-z0-9_]*/g)].map((m) => m[0]).filter((s) => !(s in scope) && !/^(sqrt|exp|log|sin|cos|tan|sinh|cosh|tanh|sech|csch|coth|abs|int|diff|pi|e)$/.test(s));
    throw new Error(faltan.length ? `faltan valores para: ${[...new Set(faltan)].join(", ")}` : `el resultado no es finito (${v})`);
  }
  return v;
}

function calcular(e: Entrada, ctx: Contexto): string {
  const expr = str(e.expresion);
  if (!expr) throw new Error("falta «expresion»");
  const vars: Record<string, number> = {};
  if (e.variables && typeof e.variables === "object") {
    for (const [k, v] of Object.entries(e.variables as Entrada)) {
      const n = num(v);
      if (n === null) throw new Error(`la variable «${k}» no es un número`);
      vars[k] = n;
    }
  }
  const scope = { ...ctx.constantes, ...vars };
  const b = e.barrer as Entrada | undefined;
  if (!b) return `${expr} = ${fmt(evaluar(expr, scope))}`;
  const variable = str(b.variable), desde = num(b.desde), hasta = num(b.hasta);
  if (!variable || desde === null || hasta === null) throw new Error("«barrer» necesita variable, desde y hasta");
  const n = Math.min(2000, Math.max(3, num(b.puntos) ?? 200));
  const log = b.log === true;
  if (log && (desde <= 0 || hasta <= 0)) throw new Error("un barrido logarítmico necesita límites positivos");
  const f = compile(parse(expr));
  let min = Infinity, max = -Infinity, xmin = desde, xmax = desde, cambios = 0, prev = NaN, malos = 0;
  const muestras: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = log ? desde * (hasta / desde) ** t : desde + (hasta - desde) * t;
    const y = f({ ...scope, [variable]: x });
    if (!Number.isFinite(y)) { malos++; continue; }
    if (y < min) { min = y; xmin = x; }
    if (y > max) { max = y; xmax = x; }
    if (Number.isFinite(prev) && Math.sign(y) !== Math.sign(prev)) cambios++;
    prev = y;
    if (i % Math.ceil(n / 6) === 0 || i === n - 1) muestras.push(`${variable}=${fmt(x)} → ${fmt(y)}`);
  }
  if (min === Infinity) throw new Error("ningún punto del barrido dio un valor finito");
  return [
    `Barrido de ${expr} con ${variable} ∈ [${fmt(desde)}, ${fmt(hasta)}] (${n} puntos${log ? ", logarítmico" : ""}):`,
    `mínimo ${fmt(min)} en ${variable}=${fmt(xmin)} · máximo ${fmt(max)} en ${variable}=${fmt(xmax)} · cambios de signo: ${cambios}${malos ? ` · ${malos} puntos no finitos` : ""}`,
    `muestras: ${muestras.join("; ")}`,
  ].join("\n");
}

function ecuacionProyecto(e: Entrada, ctx: Contexto): string {
  const id = str(e.id);
  if (!id) return `Ecuaciones disponibles:\n${ctx.ecuaciones.map((q) => `- ${q.id} (${q.titulo}; fuente ${q.paper}) → ${q.unidad}; entradas: ${Object.entries(q.entradas).map(([k, v]) => `${k} [${v.unidad}] por defecto ${v.defecto}`).join(", ")}`).join("\n")}`;
  const q = ctx.ecuaciones.find((x) => x.id === id);
  if (!q) throw new Error(`no existe la ecuación «${id}» (llama sin id para ver la lista)`);
  const scope: Record<string, number> = { ...ctx.constantes };
  for (const [k, v] of Object.entries(q.entradas)) scope[k] = v.defecto;
  for (const [k, v] of Object.entries((e.valores as Entrada) ?? {})) {
    const n = num(v);
    if (n === null) throw new Error(`el valor de «${k}» no es un número`);
    if (!(k in q.entradas)) throw new Error(`«${k}» no es una entrada de ${id}; entradas: ${Object.keys(q.entradas).join(", ")}`);
    scope[k] = n;
  }
  const v = evaluar(q.resultado, scope);
  return `${q.titulo} (${q.id}, fuente ${q.paper})\n${q.resultado} = ${fmt(v)} ${q.unidad}\nentradas: ${Object.keys(q.entradas).map((k) => `${k}=${fmt(scope[k])} ${q.entradas[k].unidad}`).join(", ")}`;
}

type FilaPatente = { n: string; t: string; y: string; yp: string | null; i: string[]; h: string | null; o: string; pp: string[]; e: string | null; cpc: string[]; k: string[]; cp: number; u: string; ab: string | null };

async function buscarPatentes(e: Entrada): Promise<string> {
  const max = Math.min(15, Math.max(1, num(e.max) ?? 8));
  const todas = await getJSON<FilaPatente[]>("/library/patentes.json");
  const terms = fold(str(e.consulta) ?? "").split(/\s+/).filter((t) => t.length > 2);
  const res = terms.length
    ? todas
        .map((p) => ({ p, s: terms.reduce((a, t) => a + (fold([p.n, p.t, p.h, ...p.i, ...p.cpc, ...p.k, p.ab].filter(Boolean).join(" ")).includes(t) ? 1 : 0), 0) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || b.p.y.localeCompare(a.p.y))
        .map((x) => x.p)
    : todas;
  if (!res.length) return `Ninguna patente coincide con «${e.consulta}».`;
  return res.slice(0, max).map((p) => [
    `- ${p.n} (${p.y}, oficina ${p.o}${p.pp.length ? `, prioridad ${p.pp.join("/")}` : ""}${p.e ? `, ${p.e}` : ""}) ${p.t}`,
    `  inventores: ${p.i.join(", ") || "—"} · titular: ${p.h ?? "—"} · CPC: ${p.cpc.slice(0, 4).join(", ")} · citada por ${p.cp}`,
    `  ${p.u}`,
    p.ab ? `  resumen: ${p.ab.slice(0, 600)}` : "",
  ].filter(Boolean).join("\n")).join("\n");
}

const EJECUTAR: Record<string, (e: Entrada, ctx: Contexto) => Promise<string> | string> = {
  buscar_biblioteca: buscarBiblioteca,
  buscar_patentes: buscarPatentes,
  leer_paper: leerPaper,
  calcular,
  ecuacion_proyecto: ecuacionProyecto,
};

/** Ejecuta una herramienta por su nombre (también sirve para probarlas sin el modelo). */
export async function ejecutarHerramienta(nombre: string, entrada: Entrada, ctx: Contexto): Promise<string> {
  const fn = EJECUTAR[nombre];
  if (!fn) throw new Error(`herramienta desconocida «${nombre}»`);
  return fn(entrada, ctx);
}

// ---------- Instrucciones ----------

export function sistema(ctx: Contexto): string {
  return `Eres el investigador IA del laboratorio de Curvatura, un programa abierto que estudia si un motor de curvatura (warp drive) es físicamente posible y qué haría falta para construirlo.

Tu trabajo es investigar con rigor: proponer soluciones a los obstáculos, comprobar la física y las matemáticas, y decir con claridad qué está vivo, qué choca con una ley y qué queda descartado.

Cómo trabajas:
- Antes de afirmar algo sobre la literatura, búscalo en la biblioteca (buscar_biblioteca) y ábrelo (leer_paper). Mira también las patentes (buscar_patentes) y prioriza lo más reciente. Cita los papers por su id entre corchetes, así: [fuchs-2024]. No inventes ids ni resultados.
- Toda cifra sale de un cálculo hecho con calcular o ecuacion_proyecto, o de un paper citado. Muestra la expresión y las unidades. Si una cota depende de un parámetro, bárrelo.
- Distingue lo demostrado, lo calculado aquí y lo especulativo. Si no lo sabes, dilo.
- Ataca tus propias ideas: contrasta cada propuesta con las condiciones de energía (NEC, WEC), las desigualdades cuánticas, la conservación del momento ADM y la formación de horizontes.
- Termina con un veredicto corto (viva / choca con una ley / descartada), la cifra clave y el siguiente cálculo concreto.
- Escribe claro y breve, en el idioma de la pregunta (por defecto «${ctx.lang}»). Usa Markdown y fórmulas en LaTeX entre $…$.

Estado actual de la investigación del proyecto (sesión 1; ya revisado por una crítica cruzada):
${ctx.estado}`;
}

// ---------- Bucle ----------

export type OpcionesAnthropic = { clave: string; modelo: Modelo; esfuerzo: Esfuerzo; senal: AbortSignal; onPaso: (pasos: Paso[]) => void };

/**
 * Ejecuta una vuelta del agente: llama al modelo, ejecuta sus herramientas y repite hasta que
 * termina. Devuelve el historial completo (para continuar la conversación) y los pasos de esta vuelta.
 */
export async function investigarAnthropic(historial: Msg[], ctx: Contexto, o: OpcionesAnthropic): Promise<{ historial: Msg[]; pasos: Paso[] }> {
  const client = new Anthropic({ apiKey: o.clave, dangerouslyAllowBrowser: true, maxRetries: 2 });
  const mensajes = [...historial];
  const pasos: Paso[] = [];
  const emitir = () => o.onPaso([...pasos]);
  const conFallback = o.modelo !== "claude-haiku-5-5";
  let fallosJSON = 0;

  for (let vuelta = 0; vuelta < 24; vuelta++) {
    const stream = client.beta.messages.stream(
      {
        model: o.modelo,
        max_tokens: 64000,
        system: [{ type: "text", text: sistema(ctx), cache_control: { type: "ephemeral" } }],
        tools: TOOLS,
        thinking: { type: "adaptive", display: "summarized" },
        output_config: { effort: o.esfuerzo },
        messages: mensajes,
        cache_control: { type: "ephemeral" },
        ...(conFallback ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
      },
      { signal: o.senal },
    );
    let actual: Paso | null = null;
    stream.on("thinking", (d) => {
      if (actual?.tipo !== "pensando") pasos.push((actual = { tipo: "pensando", texto: "" }));
      actual.texto += d;
      emitir();
    });
    stream.on("text", (d) => {
      if (actual?.tipo !== "texto") pasos.push((actual = { tipo: "texto", texto: "" }));
      actual.texto += d;
      emitir();
    });

    let m: Anthropic.Beta.BetaMessage;
    try {
      m = await stream.finalMessage();
      fallosJSON = 0;
    } catch (err) {
      // Solo se reintenta una entrada de herramienta ilegible; los errores de la API suben tal cual.
      if (err instanceof Anthropic.APIError || err instanceof Anthropic.APIUserAbortError || fallosJSON++ >= 2) throw err;
      continue;
    }

    if (m.stop_reason === "refusal") {
      pasos.push({ tipo: "texto", texto: "\n\n_(El modelo ha rechazado continuar con esta petición.)_" });
      emitir();
      break;
    }
    mensajes.push({ role: "assistant", content: m.content });
    if (m.stop_reason === "pause_turn") continue;
    const usos = m.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (!usos.length) break;
    if (m.stop_reason === "max_tokens") throw new Error("La respuesta se cortó por longitud mientras pedía una herramienta.");

    const resultados = await Promise.all(
      usos.map(async (u): Promise<Anthropic.Beta.BetaToolResultBlockParam> => {
        const entrada = (u.input ?? {}) as Entrada;
        const paso: Paso = { tipo: "herramienta", nombre: u.name, entrada };
        pasos.push(paso);
        actual = null;
        emitir();
        try {
          const r = await ejecutarHerramienta(u.name, entrada, ctx);
          paso.resultado = r;
          emitir();
          return { type: "tool_result", tool_use_id: u.id, content: r };
        } catch (err) {
          paso.resultado = err instanceof Error ? err.message : String(err);
          paso.error = true;
          emitir();
          return { type: "tool_result", tool_use_id: u.id, content: paso.resultado, is_error: true };
        }
      }),
    );
    mensajes.push({ role: "user", content: resultados });
  }
  return { historial: mensajes, pasos };
}

/** Comprueba la clave con una llamada mínima (lista de modelos, sin coste de tokens). */
export async function probarClave(clave: string): Promise<void> {
  const client = new Anthropic({ apiKey: clave, dangerouslyAllowBrowser: true, maxRetries: 0 });
  await client.models.retrieve("claude-opus-5-5");
}
