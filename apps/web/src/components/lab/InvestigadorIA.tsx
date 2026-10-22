"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Anthropic from "@anthropic-ai/sdk";
import { ArrowUp, BookOpen, Books, Calculator, CaretRight, DownloadSimple, Function as FunctionIcon, Globe, Key, Sparkle, Stop, Trash } from "@phosphor-icons/react";
import { investigar, MODELOS, probarClave, type Contexto, type Esfuerzo, type Modelo, type Msg, type Paso } from "@/lib/agente";
import { renderMarkdownSeguro } from "@/lib/md";

export type IALabels = {
  title: string; body: string; keyLabel: string; keyHint: string; keyGet: string; keySave: string; keyForget: string; keyOk: string; keyBad: string;
  model: string; effort: string; efforts: Record<Esfuerzo, string>; web: string; placeholder: string; send: string; stop: string; clear: string; export: string;
  thinking: string; tools: Record<string, string>; suggestions: string[]; cost: string; needKey: string; you: string;
  errors: { auth: string; rate: string; net: string; other: string };
};

type Turno = { pregunta: string; pasos: Paso[]; error?: string };

const CLAVE = "curvatura:clave-anthropic";
const PREFS = "curvatura:investigador";
const leer = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const guardar = (k: string, v: string | null) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* sin almacenamiento: la clave vive solo en memoria */ } };

const ICONO: Record<string, typeof Books> = { buscar_biblioteca: Books, leer_paper: BookOpen, calcular: Calculator, ecuacion_proyecto: FunctionIcon, web: Globe };
const EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";

/** Enlaza los ids de paper citados como [fuchs-2024] a su ficha. */
const conEnlaces = (md: string, lang: string) => md.replace(/\[([a-z][a-z0-9-]*-\d{4}[a-z]?)\](?!\()/g, `[$1](/${lang}/biblioteca/$1/)`);

function resumenEntrada(p: Extract<Paso, { tipo: "herramienta" }>): string {
  const e = p.entrada;
  return String(e.consulta ?? e.id ?? e.expresion ?? "") || "…";
}

function mensajeError(err: unknown, l: IALabels["errors"]): string {
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) return l.auth;
  if (err instanceof Anthropic.RateLimitError) return l.rate;
  if (err instanceof Anthropic.APIConnectionError) return l.net;
  if (err instanceof Anthropic.APIError) return `${l.other} (${err.status ?? "?"}): ${err.message}`;
  return `${l.other}: ${err instanceof Error ? err.message : String(err)}`;
}

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
        if (p.tipo === "web") {
          return (
            <div key={i} className="flex items-center gap-2 text-sm text-muted">
              <Globe size={14} weight="bold" aria-hidden /> <span className="text-fg-2">{labels.tools.web}</span> <span className="truncate font-mono text-xs">{p.consulta}</span>
            </div>
          );
        }
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

export function InvestigadorIA({ ctx, labels }: { ctx: Contexto; labels: IALabels }) {
  const [clave, setClave] = useState<string | null>(null);
  const [borrador, setBorrador] = useState("");
  const [estadoClave, setEstadoClave] = useState<"" | "probando" | "mal">("");
  const [modelo, setModelo] = useState<Modelo>("claude-opus-5-5");
  const [esfuerzo, setEsfuerzo] = useState<Esfuerzo>("high");
  const [web, setWeb] = useState(false);
  const [texto, setTexto] = useState("");
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [corriendo, setCorriendo] = useState(false);
  const historial = useRef<Msg[]>([]);
  const parar = useRef<AbortController | null>(null);
  const fondo = useRef<HTMLDivElement>(null);
  const caja = useRef<HTMLTextAreaElement>(null);
  const seccion = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setClave(leer(CLAVE));
    try {
      const p = JSON.parse(leer(PREFS) ?? "{}") as { modelo?: Modelo; esfuerzo?: Esfuerzo; web?: boolean };
      if (p.modelo && MODELOS.some((m) => m.id === p.modelo)) setModelo(p.modelo);
      if (p.esfuerzo) setEsfuerzo(p.esfuerzo);
      if (typeof p.web === "boolean") setWeb(p.web);
    } catch { /* preferencias corruptas: se ignoran */ }
  }, []);
  useEffect(() => guardar(PREFS, JSON.stringify({ modelo, esfuerzo, web })), [modelo, esfuerzo, web]);

  // Seguir el final mientras escribe, salvo que el usuario haya subido a leer.
  useEffect(() => {
    const el = fondo.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 160) el.scrollTop = el.scrollHeight;
  }, [turnos]);

  const enviar = useCallback(async (pregunta: string) => {
    const q = pregunta.trim();
    if (!q || !clave || corriendo) return;
    setTexto("");
    setCorriendo(true);
    const ctrl = new AbortController();
    parar.current = ctrl;
    const idx = turnos.length;
    setTurnos((t) => [...t, { pregunta: q, pasos: [] }]);
    const previo = historial.current;
    try {
      const r = await investigar([...previo, { role: "user", content: q }], ctx, {
        clave, modelo, esfuerzo, web, senal: ctrl.signal,
        onPaso: (pasos) => setTurnos((t) => t.map((x, i) => (i === idx ? { ...x, pasos } : x))),
      });
      historial.current = r.historial;
    } catch (err) {
      if (err instanceof Anthropic.APIUserAbortError) {
        historial.current = previo; // la vuelta interrumpida no entra en el historial
      } else {
        console.error("Investigador IA:", err);
        if (err instanceof Anthropic.AuthenticationError) setEstadoClave("mal");
        setTurnos((t) => t.map((x, i) => (i === idx ? { ...x, error: mensajeError(err, labels.errors) } : x)));
        historial.current = previo;
      }
    } finally {
      setCorriendo(false);
      parar.current = null;
    }
  }, [clave, corriendo, ctx, esfuerzo, labels.errors, modelo, turnos.length, web]);

  // Los botones «Investigar con IA» del tablero envían su pregunta aquí.
  useEffect(() => {
    const on = (e: Event) => {
      const q = (e as CustomEvent<string>).detail;
      seccion.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (clave && !corriendo) void enviar(q);
      else { setTexto(q); caja.current?.focus({ preventScroll: true }); }
    };
    window.addEventListener("curvatura:investigar", on);
    return () => window.removeEventListener("curvatura:investigar", on);
  }, [clave, corriendo, enviar]);

  const guardarClave = async () => {
    const k = borrador.trim();
    if (!k) return;
    setEstadoClave("probando");
    try {
      await probarClave(k);
      guardar(CLAVE, k);
      setClave(k);
      setBorrador("");
      setEstadoClave("");
    } catch (err) {
      console.error("Comprobación de la clave:", err);
      setEstadoClave("mal");
    }
  };
  const olvidar = () => { guardar(CLAVE, null); setClave(null); setEstadoClave(""); };
  const nueva = () => { parar.current?.abort(); historial.current = []; setTurnos([]); };

  const exportar = () => {
    const md = turnos.map((t) => `## ${labels.you}\n\n${t.pregunta}\n\n${t.pasos.map((p) => p.tipo === "texto" ? p.texto : p.tipo === "herramienta" ? `> ${labels.tools[p.nombre] ?? p.nombre}: ${resumenEntrada(p)}\n>\n> ${(p.resultado ?? "").split("\n").join("\n> ")}` : p.tipo === "web" ? `> ${labels.tools.web}: ${p.consulta}` : "").filter(Boolean).join("\n\n")}${t.error ? `\n\n**${t.error}**` : ""}`).join("\n\n---\n\n");
    const url = URL.createObjectURL(new Blob([`# ${labels.title}\n\n${md}\n`], { type: "text/markdown" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `curvatura-investigacion-${new Date().toISOString().slice(0, 10)}.md` });
    a.click();
    URL.revokeObjectURL(url);
  };

  const select = "rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm text-fg outline-none transition-colors hover:border-line-strong focus-visible:border-line-strong";
  const vacio = turnos.length === 0;
  const sugerencias = useMemo(() => labels.suggestions, [labels.suggestions]);

  return (
    <div ref={seccion} className="scroll-mt-24 rounded-[18px] bg-[var(--line)]/40 p-1.5 ring-1 ring-[var(--line)]">
      <div className="grid overflow-hidden rounded-[12px] bg-surface">
        {/* Barra: modelo, profundidad, web y clave */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-4 py-3 md:px-5">
          <span className="flex items-center gap-2 text-sm text-fg"><Sparkle size={16} weight="fill" className="text-[var(--blue)]" aria-hidden />{labels.title}</span>
          <span className="ml-auto flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="ia-modelo">{labels.model}</label>
            <select id="ia-modelo" className={select} value={modelo} onChange={(e) => setModelo(e.target.value as Modelo)} disabled={corriendo}>
              {MODELOS.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
            <label className="sr-only" htmlFor="ia-esfuerzo">{labels.effort}</label>
            <select id="ia-esfuerzo" className={select} value={esfuerzo} onChange={(e) => setEsfuerzo(e.target.value as Esfuerzo)} disabled={corriendo} title={labels.effort}>
              {(Object.keys(labels.efforts) as Esfuerzo[]).map((k) => <option key={k} value={k}>{labels.effort}: {labels.efforts[k]}</option>)}
            </select>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-line px-2.5 py-1.5 text-sm text-fg-2 transition-colors hover:border-line-strong">
              <input type="checkbox" checked={web} onChange={(e) => setWeb(e.target.checked)} disabled={corriendo} className="accent-[var(--ink)]" />
              <Globe size={14} weight="bold" aria-hidden />{labels.web}
            </label>
            {clave && (
              <button type="button" onClick={olvidar} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted transition-colors hover:text-fg" title={labels.keyForget}>
                <Key size={14} weight="bold" aria-hidden /><span className="hidden sm:inline">{labels.keyForget}</span>
              </button>
            )}
          </span>
        </div>

        {/* Conversación */}
        <div ref={fondo} className="grid max-h-[68vh] min-h-[360px] content-start gap-8 overflow-y-auto px-4 py-6 md:px-8 md:py-8" aria-live="polite" aria-busy={corriendo}>
          {!clave ? (
            <div className="grid max-w-xl gap-4 self-center justify-self-center py-6">
              <p className="font-serif text-2xl leading-tight tracking-[-0.02em] text-fg">{labels.needKey}</p>
              <p className="text-sm leading-relaxed text-muted">{labels.keyHint}</p>
              <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); void guardarClave(); }}>
                <label className="sr-only" htmlFor="ia-clave">{labels.keyLabel}</label>
                <input id="ia-clave" type="password" autoComplete="off" spellCheck={false} placeholder={labels.keyLabel} value={borrador} onChange={(e) => { setBorrador(e.target.value); setEstadoClave(""); }}
                  className="min-w-0 flex-1 rounded-md border border-line bg-bg-2 px-3 py-2 font-mono text-sm text-fg outline-none transition-colors focus-visible:border-line-strong" />
                <button type="submit" disabled={!borrador.trim() || estadoClave === "probando"} className={`rounded-md bg-[var(--ink)] px-4 py-2 text-sm text-[var(--bg)] transition-transform duration-300 ${EASE} active:scale-[0.98] disabled:opacity-40`}>
                  {estadoClave === "probando" ? "…" : labels.keySave}
                </button>
              </form>
              {estadoClave === "mal" && <p className="text-sm text-[var(--red)]" role="alert">{labels.keyBad}</p>}
              <p className="text-xs text-muted">
                <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-4 hover:text-fg">{labels.keyGet}</a> · {labels.cost}
              </p>
            </div>
          ) : vacio ? (
            <div className="grid gap-6">
              <p className="max-w-2xl text-[15px] leading-relaxed text-fg-2">{labels.body}</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {sugerencias.map((s) => (
                  <li key={s}>
                    <button type="button" onClick={() => void enviar(s)} className={`card card-hover group flex h-full w-full items-start gap-3 p-4 text-left text-sm leading-relaxed text-fg-2 transition-transform duration-300 ${EASE} active:scale-[0.98]`}>
                      <span className="flex-1">{s}</span>
                      <ArrowUp size={14} weight="bold" className={`mt-0.5 rotate-45 text-muted transition-transform duration-300 ${EASE} group-hover:translate-x-0.5 group-hover:-translate-y-0.5`} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
              {estadoClave === "mal" && <p className="text-sm text-[var(--red)]" role="alert">{labels.keyBad}</p>}
            </div>
          ) : (
            turnos.map((t, i) => (
              <article key={i} className="grid gap-4">
                <p className="max-w-[85%] justify-self-end rounded-[14px] bg-bg-2 px-4 py-2.5 text-[15px] leading-relaxed text-fg ring-1 ring-[var(--line)]">{t.pregunta}</p>
                <Pasos pasos={t.pasos} lang={ctx.lang} labels={labels} vivo={corriendo && i === turnos.length - 1} />
                {corriendo && i === turnos.length - 1 && t.pasos.length === 0 && (
                  <div className="grid gap-2" aria-hidden><span className="h-3 w-2/3 animate-pulse rounded bg-bg-2" /><span className="h-3 w-1/2 animate-pulse rounded bg-bg-2" /></div>
                )}
                {t.error && <p className="rounded-lg bg-[var(--red-bg)] px-3 py-2 text-sm text-[var(--red)]" role="alert">{t.error}</p>}
              </article>
            ))
          )}
        </div>

        {/* Redactor */}
        <form className="grid gap-2 border-t border-line p-3 md:p-4" onSubmit={(e) => { e.preventDefault(); void enviar(texto); }}>
          <div className="flex items-end gap-2 rounded-[12px] border border-line bg-bg-2 p-2 transition-colors focus-within:border-line-strong">
            <label className="sr-only" htmlFor="ia-texto">{labels.placeholder}</label>
            <textarea id="ia-texto" ref={caja} rows={2} value={texto} onChange={(e) => setTexto(e.target.value)} disabled={!clave}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void enviar(texto); } }}
              placeholder={labels.placeholder} className="max-h-48 min-h-[44px] flex-1 resize-y bg-transparent px-2 py-1.5 text-[15px] text-fg outline-none placeholder:text-muted disabled:opacity-50" />
            {corriendo ? (
              <button type="button" onClick={() => parar.current?.abort()} className={`flex h-10 items-center gap-2 rounded-full bg-[var(--ink)] px-4 text-sm text-[var(--bg)] transition-transform duration-300 ${EASE} active:scale-[0.98]`}>
                <Stop size={14} weight="fill" aria-hidden />{labels.stop}
              </button>
            ) : (
              <button type="submit" disabled={!clave || !texto.trim()} className={`group flex h-10 items-center gap-2 rounded-full bg-[var(--ink)] py-1 pl-4 pr-1 text-sm text-[var(--bg)] transition-transform duration-300 ${EASE} active:scale-[0.98] disabled:opacity-40`}>
                {labels.send}
                <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg)]/15 transition-transform duration-300 ${EASE} group-hover:-translate-y-px group-hover:scale-105`}><ArrowUp size={14} weight="bold" aria-hidden /></span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-muted">
            <span>{clave ? labels.cost : ""}</span>
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
