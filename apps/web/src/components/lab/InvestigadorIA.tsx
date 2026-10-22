"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Anthropic from "@anthropic-ai/sdk";
import { ArrowUp, BookOpen, Books, Calculator, CaretRight, Cpu, DownloadSimple, FileText, Function as FunctionIcon, Globe, Key, MagnifyingGlass, Scroll, Sparkle, Stop, Terminal, Trash } from "@phosphor-icons/react";
import { MODELOS, probarClave, type Contexto, type Esfuerzo, type Paso } from "@/lib/agente";
import { renderMarkdownSeguro } from "@/lib/md";
import {
  descargarOllama, detectar, disponibles, ErrorMotor, iniciarSesionCli, investigar, MODELOS_NAVEGADOR, modelosOpenAI, MOTORES, recomendadoOllama, sesionVacia,
  type Deteccion, type MotorId, type Sesion,
} from "@/lib/motores";

export type IALabels = {
  title: string; body: string; keyLabel: string; keyLabelOpenai: string; keyHint: string; keyGet: string; keyGetOpenai: string; keySave: string; keyForget: string; keyBad: string;
  model: string; defaultModel: string; effort: string; efforts: Record<Esfuerzo, string>; placeholder: string; send: string; stop: string; clear: string; export: string;
  thinking: string; tools: Record<string, string>; suggestions: string[]; you: string;
  engine: string; groups: { cli: string; local: string; api: string }; engines: Record<MotorId, string>; notInstalled: string; detecting: string;
  cost: { cli: string; local: string; api: string };
  login: string; loginHint: string; ollamaMissing: string; ollamaGet: string; ollamaNoModel: string; download: string; downloading: string;
  browserHint: string; browserNoGpu: string; needKey: string; nativeOnly: string; switched: string;
  errors: { auth: string; rate: string; net: string; other: string };
};

type Turno = { pregunta: string; pasos: Paso[]; error?: string; tipoError?: ErrorMotor["tipo"] };

const CLAVES = { anthropic: "curvatura:clave-anthropic", openai: "curvatura:clave-openai" } as const;
const PREFS = "curvatura:investigador";
const leer = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const guardar = (k: string, v: string | null) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* sin almacenamiento: la clave vive solo en memoria */ } };

const ICONO: Record<string, typeof Books> = {
  buscar_biblioteca: Books, buscar_patentes: Scroll, leer_paper: BookOpen, calcular: Calculator, ecuacion_proyecto: FunctionIcon, web: Globe,
  Read: FileText, read: FileText, Grep: MagnifyingGlass, grep: MagnifyingGlass, Glob: MagnifyingGlass, glob: MagnifyingGlass, Bash: Terminal, shell: Terminal, WebSearch: Globe, WebFetch: Globe,
};
const EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";

/** Enlaza los ids de paper citados como [fuchs-2024] a su ficha. */
const conEnlaces = (md: string, lang: string) => md.replace(/\[([a-z][a-z0-9-]*-\d{4}[a-z]?)\](?!\()/g, `[$1](/${lang}/biblioteca/$1/)`);

function resumenEntrada(p: Extract<Paso, { tipo: "herramienta" }>): string {
  const e = p.entrada;
  const v = e.consulta ?? e.id ?? e.expresion ?? e.pattern ?? e.command ?? e.file_path ?? e.path ?? e.query ?? e.url ?? e.globPattern;
  return (typeof v === "string" ? v : v ? JSON.stringify(v) : "") || "…";
}

function mensajeError(err: unknown, l: IALabels["errors"]): string {
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) return l.auth;
  if (err instanceof Anthropic.RateLimitError) return l.rate;
  if (err instanceof Anthropic.APIConnectionError) return l.net;
  if (err instanceof Anthropic.APIError) return `${l.other} (${err.status ?? "?"}): ${err.message}`;
  return err instanceof Error ? err.message : `${l.other}: ${String(err)}`;
}

const esCancelacion = (err: unknown) => err instanceof Anthropic.APIUserAbortError || (err instanceof DOMException && err.name === "AbortError");

function Pasos({ pasos, lang, labels, vivo }: { pasos: Paso[]; lang: string; labels: IALabels; vivo: boolean }) {
  return (
    <div className="grid gap-3">
      {pasos.map((p, i) => {
        if (p.tipo === "texto")
          return <div key={i} className="prose-paper max-w-none text-[15px]" dangerouslySetInnerHTML={{ __html: renderMarkdownSeguro(conEnlaces(p.texto, lang)) }} />;
        if (p.tipo === "pensando")
          return (
            <details key={i} className="group text-sm text-muted">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 hover:text-fg">
                <CaretRight size={12} weight="bold" className="transition-transform duration-300 group-open:rotate-90" aria-hidden />
                {labels.thinking}
              </summary>
              <p className="mt-2 whitespace-pre-wrap border-l border-line pl-3 leading-relaxed">{p.texto}</p>
            </details>
          );
        if (p.tipo === "web")
          return (
            <div key={i} className="flex items-center gap-2 text-sm text-muted">
              <Globe size={14} weight="bold" aria-hidden /> <span className="text-fg-2">{labels.tools.web}</span> <span className="truncate font-mono text-xs">{p.consulta}</span>
            </div>
          );
        const Icono = ICONO[p.nombre] ?? Sparkle;
        const enCurso = p.resultado === undefined;
        return (
          <details key={i} className="group rounded-lg border border-line bg-bg-2/60 text-sm">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2">
              <Icono size={14} weight="bold" className={p.error ? "text-[var(--red)]" : "text-muted"} aria-hidden />
              <span className="text-fg-2">{labels.tools[p.nombre] ?? p.nombre}</span>
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted">{resumenEntrada(p)}</span>
              {enCurso && vivo ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--blue)]" aria-hidden /> : <CaretRight size={12} weight="bold" className="text-muted transition-transform duration-300 group-open:rotate-90" aria-hidden />}
            </summary>
            {!enCurso && <pre className="max-h-72 overflow-auto whitespace-pre-wrap border-t border-line px-3 py-2 font-mono text-xs leading-relaxed text-fg-2">{p.resultado}</pre>}
          </details>
        );
      })}
    </div>
  );
}

/** Modelos que ofrece cada motor ("" = el que use el CLI por defecto). */
function modelosDe(motor: MotorId, det: Deteccion | null, openai: string[], porDefecto: string): { id: string; nombre: string }[] {
  switch (motor) {
    case "claude-code": return [{ id: "", nombre: porDefecto }, { id: "opus", nombre: "Opus" }, { id: "sonnet", nombre: "Sonnet" }, { id: "haiku", nombre: "Haiku" }];
    case "codex":
    case "cursor": return [{ id: "", nombre: porDefecto }];
    case "ollama": return (det?.ollamaModelos ?? []).map((m) => ({ id: m, nombre: m }));
    case "navegador": return MODELOS_NAVEGADOR.map((m) => ({ id: m.id, nombre: `${m.nombre} · ≈${m.gb} GB` }));
    case "anthropic": return MODELOS.map((m) => ({ id: m.id, nombre: m.nombre }));
    case "openai": return openai.map((m) => ({ id: m, nombre: m }));
  }
}

export function InvestigadorIA({ ctx, labels }: { ctx: Contexto; labels: IALabels }) {
  const [det, setDet] = useState<Deteccion | null>(null);
  const [claves, setClaves] = useState<{ anthropic: string | null; openai: string | null }>({ anthropic: null, openai: null });
  const [motor, setMotor] = useState<MotorId | null>(null);
  const [modelo, setModelo] = useState("");
  const [esfuerzo, setEsfuerzo] = useState<Esfuerzo>("high");
  const [openaiModelos, setOpenaiModelos] = useState<string[]>([]);
  const [borrador, setBorrador] = useState("");
  const [estadoClave, setEstadoClave] = useState<"" | "probando" | "mal">("");
  const [descarga, setDescarga] = useState<{ f: number; texto: string } | null>(null);
  const [estado, setEstado] = useState("");
  const [texto, setTexto] = useState("");
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [corriendo, setCorriendo] = useState(false);
  const sesion = useRef<Sesion>(sesionVacia());
  const parar = useRef<AbortController | null>(null);
  const fondo = useRef<HTMLDivElement>(null);
  const caja = useRef<HTMLTextAreaElement>(null);
  const seccion = useRef<HTMLDivElement>(null);

  // Detección de motores y preferencias guardadas: CLI → local → clave API.
  const redetectar = useCallback(async () => {
    try {
      const d = await detectar();
      setDet(d);
      return d;
    } catch (err) {
      console.error("Detección de motores:", err);
      const d: Deteccion = { nativo: false, clis: [], ollamaInstalado: false, ollamaActivo: false, ollamaModelos: [], memoriaGb: 0, webgpu: false };
      setDet(d);
      return d;
    }
  }, []);
  useEffect(() => {
    const c = { anthropic: leer(CLAVES.anthropic), openai: leer(CLAVES.openai) };
    setClaves(c);
    let p: { motor?: MotorId; modelos?: Record<string, string>; esfuerzo?: Esfuerzo } = {};
    try { p = JSON.parse(leer(PREFS) ?? "{}"); } catch { p = {}; /* preferencias corruptas: se ignoran */ }
    if (p.esfuerzo) setEsfuerzo(p.esfuerzo);
    void redetectar().then((d) => {
      const libres = disponibles(d, c);
      const m = p.motor && libres.includes(p.motor) ? p.motor : libres[0] ?? (d.nativo ? "ollama" : d.webgpu ? "navegador" : "anthropic");
      setMotor(m);
      setModelo(p.modelos?.[m] ?? "");
    });
  }, [redetectar]);

  const modelos = useMemo(() => (motor ? modelosDe(motor, det, openaiModelos, labels.defaultModel) : []), [motor, det, openaiModelos, labels.defaultModel]);
  // Si el modelo guardado no existe en este motor, el primero de la lista (o el recomendado en Ollama).
  useEffect(() => {
    if (!motor || !modelos.length) return;
    if (!modelos.some((m) => m.id === modelo)) setModelo(modelos[0].id);
  }, [motor, modelos, modelo]);
  useEffect(() => {
    if (!motor) return;
    let p: { modelos?: Record<string, string> } = {};
    try { p = JSON.parse(leer(PREFS) ?? "{}"); } catch { p = {}; }
    guardar(PREFS, JSON.stringify({ motor, esfuerzo, modelos: { ...(p.modelos ?? {}), [motor]: modelo } }));
  }, [motor, modelo, esfuerzo]);
  useEffect(() => {
    if (motor !== "openai" || !claves.openai || openaiModelos.length) return;
    modelosOpenAI(claves.openai).then(setOpenaiModelos).catch((err: unknown) => { console.error("Modelos de OpenAI:", err); setEstadoClave("mal"); });
  }, [motor, claves.openai, openaiModelos.length]);

  useEffect(() => {
    const el = fondo.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 160) el.scrollTop = el.scrollHeight;
  }, [turnos]);

  const info = MOTORES.find((m) => m.id === motor);
  const claveDe = motor === "anthropic" ? claves.anthropic : motor === "openai" ? claves.openai : null;
  const faltaClave = info?.tipo === "api" && !claveDe;
  const faltaOllama = motor === "ollama" && det && !det.ollamaInstalado;
  const sinModeloLocal = motor === "ollama" && det?.ollamaInstalado && !det.ollamaModelos.length;
  const sinGpu = motor === "navegador" && det && !det.webgpu;
  const listo = !!motor && !!det && !faltaClave && !faltaOllama && !sinModeloLocal && !sinGpu;

  const enviar = useCallback(async (pregunta: string) => {
    const q = pregunta.trim();
    if (!q || !motor || !listo || corriendo) return;
    setTexto("");
    setCorriendo(true);
    setEstado("");
    const ctrl = new AbortController();
    parar.current = ctrl;
    const idx = turnos.length;
    setTurnos((t) => [...t, { pregunta: q, pasos: [] }]);
    try {
      sesion.current = await investigar(sesion.current, q, ctx, {
        motor, modelo, esfuerzo, claves, senal: ctrl.signal, onEstado: setEstado,
        onPaso: (pasos) => setTurnos((t) => t.map((x, i) => (i === idx ? { ...x, pasos } : x))),
      });
    } catch (err) {
      if (!esCancelacion(err)) {
        console.error("Investigador IA:", err);
        const tipo = err instanceof ErrorMotor ? err.tipo : err instanceof Anthropic.AuthenticationError ? "clave" : "otro";
        if (tipo === "clave") setEstadoClave("mal");
        setTurnos((t) => t.map((x, i) => (i === idx ? { ...x, error: mensajeError(err, labels.errors), tipoError: tipo } : x)));
      }
    } finally {
      setCorriendo(false);
      setEstado("");
      parar.current = null;
    }
  }, [claves, corriendo, ctx, esfuerzo, labels.errors, listo, modelo, motor, turnos.length]);

  // Los botones «Investigar con IA» del tablero envían su pregunta aquí.
  useEffect(() => {
    const on = (e: Event) => {
      const q = (e as CustomEvent<string>).detail;
      seccion.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (listo && !corriendo) void enviar(q);
      else { setTexto(q); caja.current?.focus({ preventScroll: true }); }
    };
    window.addEventListener("curvatura:investigar", on);
    return () => window.removeEventListener("curvatura:investigar", on);
  }, [listo, corriendo, enviar]);

  const cambiarMotor = (m: MotorId) => {
    setMotor(m);
    setEstadoClave("");
    setBorrador("");
    if (turnos.length && m !== sesion.current.motor) setEstado(labels.switched);
  };

  const guardarClave = async () => {
    const k = borrador.trim();
    if (!k || (motor !== "anthropic" && motor !== "openai")) return;
    setEstadoClave("probando");
    try {
      if (motor === "anthropic") await probarClave(k);
      else setOpenaiModelos(await modelosOpenAI(k));
      guardar(CLAVES[motor], k);
      setClaves((c) => ({ ...c, [motor]: k }));
      setBorrador("");
      setEstadoClave("");
    } catch (err) {
      console.error("Comprobación de la clave:", err);
      setEstadoClave("mal");
    }
  };
  const olvidar = () => {
    if (motor !== "anthropic" && motor !== "openai") return;
    guardar(CLAVES[motor], null);
    setClaves((c) => ({ ...c, [motor]: null }));
    if (motor === "openai") setOpenaiModelos([]);
    setEstadoClave("");
  };

  const bajarModelo = async () => {
    if (!det) return;
    const r = recomendadoOllama(det.memoriaGb);
    const ctrl = new AbortController();
    parar.current = ctrl;
    setDescarga({ f: 0, texto: "" });
    try {
      await descargarOllama(r.etiqueta, (f, t) => setDescarga({ f, texto: t }), ctrl.signal);
      await redetectar();
      setModelo(r.etiqueta);
    } catch (err) {
      if (!esCancelacion(err)) { console.error("Descarga del modelo:", err); setEstado(err instanceof Error ? err.message : String(err)); }
    } finally {
      setDescarga(null);
      parar.current = null;
    }
  };

  const nueva = () => { parar.current?.abort(); sesion.current = sesionVacia(); setTurnos([]); setEstado(""); };

  const exportar = () => {
    const md = turnos.map((t) => `## ${labels.you}\n\n${t.pregunta}\n\n${t.pasos.map((p) => p.tipo === "texto" ? p.texto : p.tipo === "herramienta" ? `> ${labels.tools[p.nombre] ?? p.nombre}: ${resumenEntrada(p)}\n>\n> ${(p.resultado ?? "").split("\n").join("\n> ")}` : p.tipo === "web" ? `> ${labels.tools.web}: ${p.consulta}` : "").filter(Boolean).join("\n\n")}${t.error ? `\n\n**${t.error}**` : ""}`).join("\n\n---\n\n");
    const url = URL.createObjectURL(new Blob([`# ${labels.title}\n\n${md}\n`], { type: "text/markdown" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `curvatura-investigacion-${new Date().toISOString().slice(0, 10)}.md` });
    a.click();
    URL.revokeObjectURL(url);
  };

  const select = "rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm text-fg outline-none transition-colors hover:border-line-strong focus-visible:border-line-strong disabled:opacity-50";
  const boton = `rounded-md bg-[var(--ink)] px-4 py-2 text-sm text-[var(--bg)] transition-transform duration-300 ${EASE} active:scale-[0.98] disabled:opacity-40`;
  const vacio = turnos.length === 0;
  const libres = det ? disponibles(det, claves) : [];
  const recomendado = det ? recomendadoOllama(det.memoriaGb) : null;
  const navegadorGb = MODELOS_NAVEGADOR.find((m) => m.id === modelo)?.gb ?? MODELOS_NAVEGADOR[0].gb;

  // Panel de preparación del motor elegido (clave, instalar, descargar modelo).
  const preparar = !det ? (
    <p className="self-center justify-self-center text-sm text-muted" aria-busy="true">{labels.detecting}</p>
  ) : faltaClave ? (
    <div className="grid max-w-xl gap-4 self-center justify-self-center py-6">
      <p className="font-serif text-2xl leading-tight tracking-[-0.02em] text-fg">{labels.needKey.replace("{p}", labels.engines[motor!])}</p>
      <p className="text-sm leading-relaxed text-muted">{labels.keyHint}</p>
      <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); void guardarClave(); }}>
        <label className="sr-only" htmlFor="ia-clave">{motor === "openai" ? labels.keyLabelOpenai : labels.keyLabel}</label>
        <input id="ia-clave" type="password" autoComplete="off" spellCheck={false} placeholder={motor === "openai" ? labels.keyLabelOpenai : labels.keyLabel} value={borrador}
          onChange={(e) => { setBorrador(e.target.value); setEstadoClave(""); }}
          className="min-w-0 flex-1 rounded-md border border-line bg-bg-2 px-3 py-2 font-mono text-sm text-fg outline-none transition-colors focus-visible:border-line-strong" />
        <button type="submit" disabled={!borrador.trim() || estadoClave === "probando"} className={boton}>{estadoClave === "probando" ? "…" : labels.keySave}</button>
      </form>
      {estadoClave === "mal" && <p className="text-sm text-[var(--red)]" role="alert">{labels.keyBad}</p>}
      <p className="text-xs text-muted">
        <a href={motor === "openai" ? "https://platform.openai.com/api-keys" : "https://console.anthropic.com/settings/keys"} target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-4 hover:text-fg">
          {motor === "openai" ? labels.keyGetOpenai : labels.keyGet}
        </a> · {labels.cost.api}
      </p>
    </div>
  ) : faltaOllama ? (
    <div className="grid max-w-xl gap-4 self-center justify-self-center py-6">
      <p className="font-serif text-2xl leading-tight tracking-[-0.02em] text-fg">{labels.ollamaMissing}</p>
      <div className="flex flex-wrap gap-2">
        <a href="https://ollama.com/download" target="_blank" rel="noreferrer" className={boton}>{labels.ollamaGet}</a>
        <button type="button" onClick={() => void redetectar()} className="rounded-md border border-line px-4 py-2 text-sm text-fg hover:border-line-strong">{labels.detecting.replace("…", "")}</button>
      </div>
    </div>
  ) : sinModeloLocal && recomendado ? (
    <div className="grid max-w-xl gap-4 self-center justify-self-center py-6">
      <p className="font-serif text-2xl leading-tight tracking-[-0.02em] text-fg">{labels.ollamaNoModel}</p>
      {descarga ? (
        <div className="grid gap-2" aria-live="polite">
          <div className="h-1.5 overflow-hidden rounded-full bg-bg-2"><span className="block h-full bg-[var(--ink)] transition-[width] duration-500" style={{ width: `${Math.round(descarga.f * 100)}%` }} /></div>
          <p className="font-mono text-xs text-muted">{labels.downloading} {Math.round(descarga.f * 100)} % · {descarga.texto}</p>
          <button type="button" onClick={() => parar.current?.abort()} className="w-max text-sm text-muted underline underline-offset-4 hover:text-fg">{labels.stop}</button>
        </div>
      ) : (
        <button type="button" onClick={() => void bajarModelo()} className={`${boton} w-max`}>
          {labels.download.replace("{m}", recomendado.etiqueta).replace("{gb}", String(recomendado.gb)).replace("{mem}", String(det.memoriaGb))}
        </button>
      )}
    </div>
  ) : sinGpu ? (
    <p className="max-w-xl self-center justify-self-center text-center text-sm leading-relaxed text-muted">{labels.browserNoGpu}</p>
  ) : null;

  return (
    <div ref={seccion} className="scroll-mt-24 rounded-[18px] bg-[var(--line)]/40 p-1.5 ring-1 ring-[var(--line)]">
      <div className="grid overflow-hidden rounded-[12px] bg-surface">
        {/* Barra: motor, modelo y profundidad */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-4 py-3 md:px-5">
          <span className="flex items-center gap-2 text-sm text-fg"><Sparkle size={16} weight="fill" className="text-[var(--blue)]" aria-hidden />{labels.title}</span>
          <span className="ml-auto flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="ia-motor">{labels.engine}</label>
            <select id="ia-motor" className={select} value={motor ?? ""} onChange={(e) => cambiarMotor(e.target.value as MotorId)} disabled={corriendo || !det}>
              {(["cli", "local", "api"] as const).map((g) => {
                const ms = MOTORES.filter((m) => m.tipo === g && (det?.nativo || !m.soloNativo));
                if (!ms.length) return null;
                return (
                  <optgroup key={g} label={labels.groups[g]}>
                    {ms.map((m) => (
                      <option key={m.id} value={m.id} disabled={m.tipo === "cli" && !libres.includes(m.id)}>
                        {labels.engines[m.id]}{m.tipo === "cli" && !libres.includes(m.id) ? ` · ${labels.notInstalled}` : ""}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            {modelos.length > 1 && (
              <>
                <label className="sr-only" htmlFor="ia-modelo">{labels.model}</label>
                <select id="ia-modelo" className={select} value={modelo} onChange={(e) => setModelo(e.target.value)} disabled={corriendo}>
                  {modelos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </>
            )}
            {motor === "anthropic" && (
              <>
                <label className="sr-only" htmlFor="ia-esfuerzo">{labels.effort}</label>
                <select id="ia-esfuerzo" className={select} value={esfuerzo} onChange={(e) => setEsfuerzo(e.target.value as Esfuerzo)} disabled={corriendo}>
                  {(Object.keys(labels.efforts) as Esfuerzo[]).map((k) => <option key={k} value={k}>{labels.effort}: {labels.efforts[k]}</option>)}
                </select>
              </>
            )}
            {claveDe && (
              <button type="button" onClick={olvidar} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted transition-colors hover:text-fg" title={labels.keyForget}>
                <Key size={14} weight="bold" aria-hidden /><span className="hidden sm:inline">{labels.keyForget}</span>
              </button>
            )}
          </span>
        </div>

        {/* Conversación */}
        <div ref={fondo} className="grid max-h-[68vh] min-h-[360px] content-start gap-8 overflow-y-auto px-4 py-6 md:px-8 md:py-8" aria-live="polite" aria-busy={corriendo}>
          {preparar ?? (vacio ? (
            <div className="grid gap-6">
              <p className="max-w-2xl text-[15px] leading-relaxed text-fg-2">{labels.body}</p>
              {motor === "navegador" && <p className="max-w-2xl text-sm leading-relaxed text-muted">{labels.browserHint.replace("{gb}", String(navegadorGb))}</p>}
              <ul className="grid gap-3 sm:grid-cols-2">
                {labels.suggestions.map((s) => (
                  <li key={s}>
                    <button type="button" onClick={() => void enviar(s)} className={`card card-hover group flex h-full w-full items-start gap-3 p-4 text-left text-sm leading-relaxed text-fg-2 transition-transform duration-300 ${EASE} active:scale-[0.98]`}>
                      <span className="flex-1">{s}</span>
                      <ArrowUp size={14} weight="bold" className={`mt-0.5 rotate-45 text-muted transition-transform duration-300 ${EASE} group-hover:translate-x-0.5 group-hover:-translate-y-0.5`} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            turnos.map((t, i) => (
              <article key={i} className="grid gap-4">
                <p className="max-w-[85%] justify-self-end rounded-[14px] bg-bg-2 px-4 py-2.5 text-[15px] leading-relaxed text-fg ring-1 ring-[var(--line)]">{t.pregunta}</p>
                <Pasos pasos={t.pasos} lang={ctx.lang} labels={labels} vivo={corriendo && i === turnos.length - 1} />
                {corriendo && i === turnos.length - 1 && t.pasos.length === 0 && (
                  <div className="grid gap-2" aria-hidden><span className="h-3 w-2/3 animate-pulse rounded bg-bg-2" /><span className="h-3 w-1/2 animate-pulse rounded bg-bg-2" /></div>
                )}
                {t.error && (
                  <div className="grid gap-2 rounded-lg bg-[var(--red-bg)] px-3 py-2 text-sm text-[var(--red)]" role="alert">
                    <p className="whitespace-pre-wrap break-words">{t.error}</p>
                    {t.tipoError === "login" && motor && info?.tipo === "cli" && (
                      <p className="text-fg-2">
                        <button type="button" onClick={() => void iniciarSesionCli(motor).catch((err: unknown) => setEstado(String(err)))} className="mr-2 inline-flex items-center gap-1.5 rounded-md bg-[var(--ink)] px-3 py-1.5 text-xs text-[var(--bg)]">
                          <Terminal size={12} weight="bold" aria-hidden />{labels.login.replace("{cli}", labels.engines[motor])}
                        </button>
                        <span className="text-xs">{labels.loginHint}</span>
                      </p>
                    )}
                  </div>
                )}
              </article>
            ))
          ))}
        </div>

        {/* Redactor */}
        <form className="grid gap-2 border-t border-line p-3 md:p-4" onSubmit={(e) => { e.preventDefault(); void enviar(texto); }}>
          <div className="flex items-end gap-2 rounded-[12px] border border-line bg-bg-2 p-2 transition-colors focus-within:border-line-strong">
            <label className="sr-only" htmlFor="ia-texto">{labels.placeholder}</label>
            <textarea id="ia-texto" ref={caja} rows={2} value={texto} onChange={(e) => setTexto(e.target.value)} disabled={!listo}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void enviar(texto); } }}
              placeholder={labels.placeholder} className="max-h-48 min-h-[44px] flex-1 resize-y bg-transparent px-2 py-1.5 text-[15px] text-fg outline-none placeholder:text-muted disabled:opacity-50" />
            {corriendo ? (
              <button type="button" onClick={() => parar.current?.abort()} className={`flex h-10 items-center gap-2 rounded-full bg-[var(--ink)] px-4 text-sm text-[var(--bg)] transition-transform duration-300 ${EASE} active:scale-[0.98]`}>
                <Stop size={14} weight="fill" aria-hidden />{labels.stop}
              </button>
            ) : (
              <button type="submit" disabled={!listo || !texto.trim()} className={`group flex h-10 items-center gap-2 rounded-full bg-[var(--ink)] py-1 pl-4 pr-1 text-sm text-[var(--bg)] transition-transform duration-300 ${EASE} active:scale-[0.98] disabled:opacity-40`}>
                {labels.send}
                <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg)]/15 transition-transform duration-300 ${EASE} group-hover:-translate-y-px group-hover:scale-105`}><ArrowUp size={14} weight="bold" aria-hidden /></span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              {info && <><Cpu size={12} weight="bold" aria-hidden />{labels.cost[info.tipo]}</>}
              {estado && <span className="font-mono">· {estado}</span>}
            </span>
            {!vacio && (
              <span className="flex gap-3">
                <button type="button" onClick={exportar} disabled={corriendo} className="flex items-center gap-1 hover:text-fg disabled:opacity-40"><DownloadSimple size={13} weight="bold" aria-hidden />{labels.export}</button>
                <button type="button" onClick={nueva} className="flex items-center gap-1 hover:text-fg"><Trash size={13} weight="bold" aria-hidden />{labels.clear}</button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
