"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle, Clock, FileArrowUp, Medal, SignOut, XCircle } from "@phosphor-icons/react";
import { ApiError, api, enApp, loginUrl, postJson, SITE_URL } from "@/lib/api";

type Verif = { id: string; tipo: string; titulo: string; institucion: string; anio: number | null; area: string; estado: string; nota: string | null; creada: string };
type Yo = { usuario: { id: string; nombre: string; mencion: string; mencion_base: string | null } | null; admin: boolean; verificaciones: Verif[]; orcid: boolean };
type Pendiente = Verif & { usuario: string; nombre: string; doc_sha256: string | null; evidencia: string | null; documento: string | null };

export type AccountLabels = {
  intro: string; login: string; notConfigured: string; logout: string; signedAs: string; status: Record<string, string>;
  stepsTitle: string; steps: string[]; formTitle: string; type: string; types: Record<string, string>; degree: string; institution: string;
  year: string; area: string; document: string; documentHelp: string; submit: string; sending: string; mine: string; none: string;
  adminTitle: string; adminEmpty: string; approve: string; reject: string; note: string; openDoc: string; evidence: string; hash: string;
  onWeb: string; privacy: string; resultApproved: string; resultPending: string;
};

const ICON: Record<string, React.ReactNode> = {
  aprobada: <CheckCircle size={16} weight="fill" className="text-green" aria-hidden />,
  pendiente: <Clock size={16} weight="fill" className="text-yellow" aria-hidden />,
  rechazada: <XCircle size={16} weight="fill" className="text-red" aria-hidden />,
};

export function AccountPanel({ lang, l }: { lang: string; l: AccountLabels }) {
  const [yo, setYo] = useState<Yo | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [pend, setPend] = useState<Pendiente[] | null>(null);

  const cargar = useCallback(() => {
    api<Yo>("/api/yo").then((y) => {
      setYo(y);
      if (y.admin) api<{ pendientes: Pendiente[] }>("/api/admin/verificaciones").then((r) => setPend(r.pendientes), (e: Error) => setErr(e.message));
    }, (e: Error) => setErr(e.message));
  }, []);
  useEffect(cargar, [cargar]);

  if (enApp()) return <a href={`${SITE_URL}/${lang}/cuenta/`} className="inline-flex h-11 w-max items-center rounded-md border border-line px-5 text-fg">{l.onWeb}</a>;
  if (err) return <p className="tag tag-red w-max normal-case tracking-normal">{err}</p>;
  if (!yo) return <div className="card h-48 animate-pulse bg-gray-bg" aria-busy="true" />;

  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEnviando(true);
    setAviso(null);
    try {
      const r = await fetch("/api/verificacion", { method: "POST", body: new FormData(e.currentTarget), credentials: "same-origin" });
      const data = (await r.json()) as { estado?: string; error?: string };
      if (!r.ok) throw new ApiError(r.status, data.error ?? `HTTP ${r.status}`);
      setAviso(data.estado === "aprobada" ? l.resultApproved : l.resultPending);
      (e.target as HTMLFormElement).reset();
      cargar();
    } catch (x) {
      setAviso(x instanceof Error ? x.message : String(x));
    } finally {
      setEnviando(false);
    }
  };

  const revisar = async (id: string, decision: "aprobada" | "rechazada", nota: string) => {
    try {
      await postJson(`/api/admin/verificaciones/${id}`, { decision, nota });
      cargar();
    } catch (x) {
      setErr(x instanceof Error ? x.message : String(x));
    }
  };

  const salir = async () => {
    await postJson("/api/auth/logout", {}).catch(() => null);
    cargar();
  };

  const campo = "h-11 w-full rounded-md border border-line bg-surface px-3 text-fg outline-none focus:border-line-strong";

  return (
    <div className="grid gap-12">
      {!yo.usuario ? (
        <div className="card grid gap-5 p-8">
          <p className="max-w-[60ch] text-fg-2">{l.intro}</p>
          {yo.orcid ? (
            <a href={loginUrl(`/${lang}/cuenta/`)} className="inline-flex h-11 w-max items-center rounded-md bg-[var(--ink)] px-5 font-medium text-[var(--bg)] active:scale-[0.98]">{l.login}</a>
          ) : (
            <p className="tag tag-yellow w-max normal-case tracking-normal">{l.notConfigured}</p>
          )}
        </div>
      ) : (
        <div className="card flex flex-wrap items-center justify-between gap-6 p-8">
          <div className="grid gap-1">
            <span className="text-sm text-muted">{l.signedAs}</span>
            <span className="font-serif text-2xl tracking-[-0.02em]">{yo.usuario.nombre}</span>
            <a href={`https://orcid.org/${yo.usuario.id}`} target="_blank" rel="noreferrer" className="font-mono text-sm text-muted underline decoration-line-strong underline-offset-4">{yo.usuario.id}</a>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`tag ${yo.usuario.mencion === "aprobada" ? "tag-green" : yo.usuario.mencion === "pendiente" ? "tag-yellow" : yo.usuario.mencion === "rechazada" ? "tag-red" : ""}`}>
              <Medal size={13} weight="fill" aria-hidden /> {l.status[yo.usuario.mencion] ?? yo.usuario.mencion}
            </span>
            <button type="button" onClick={salir} className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-sm text-fg hover:border-line-strong">
              <SignOut size={16} weight="bold" aria-hidden /> {l.logout}
            </button>
          </div>
        </div>
      )}

      <section className="grid gap-6">
        <h2 className="font-serif text-3xl tracking-[-0.02em]">{l.stepsTitle}</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {l.steps.map((s, i) => (
            <li key={i} className="card grid content-start gap-3 p-6">
              <span className="font-mono text-3xl tracking-[-0.04em] text-fg">{i + 1}</span>
              <p className="text-[15px] text-fg-2">{s}</p>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted">{l.privacy}</p>
      </section>

      {yo.usuario && yo.usuario.mencion !== "aprobada" && (
        <form onSubmit={enviar} className="card grid gap-5 p-8" encType="multipart/form-data">
          <h2 className="font-serif text-2xl tracking-[-0.02em]">{l.formTitle}</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm"><span className="text-muted">{l.type}</span>
              <select name="tipo" required className={campo} defaultValue="doctorado">
                {Object.entries(l.types).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm"><span className="text-muted">{l.degree}</span><input name="titulo" required maxLength={200} autoComplete="off" className={campo} /></label>
            <label className="grid gap-2 text-sm"><span className="text-muted">{l.institution}</span><input name="institucion" required maxLength={200} autoComplete="organization" className={campo} /></label>
            <label className="grid gap-2 text-sm"><span className="text-muted">{l.year}</span><input name="anio" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} autoComplete="off" className={campo} /></label>
            <label className="grid gap-2 text-sm md:col-span-2"><span className="text-muted">{l.area}</span><input name="area" required maxLength={200} autoComplete="off" className={campo} /></label>
            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="flex items-center gap-2 text-muted"><FileArrowUp size={16} weight="bold" aria-hidden /> {l.document}</span>
              <input name="documento" type="file" accept="application/pdf,image/png,image/jpeg" className="text-sm text-fg-2 file:mr-4 file:h-10 file:rounded-md file:border file:border-line file:bg-surface file:px-4 file:text-fg" />
              <span className="text-xs text-muted">{l.documentHelp}</span>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={enviando} className="inline-flex h-11 items-center rounded-md bg-[var(--ink)] px-5 font-medium text-[var(--bg)] disabled:opacity-60">{enviando ? l.sending : l.submit}</button>
            {aviso && <p className="text-sm text-fg-2" aria-live="polite">{aviso}</p>}
          </div>
        </form>
      )}

      {yo.usuario && (
        <section className="grid gap-4">
          <h2 className="font-serif text-2xl tracking-[-0.02em]">{l.mine}</h2>
          {yo.verificaciones.length === 0 ? <p className="text-muted">{l.none}</p> : (
            <ul className="border-t border-line">
              {yo.verificaciones.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center gap-3 border-b border-line py-4 text-sm">
                  {ICON[v.estado]}
                  <span className="font-medium text-fg">{v.titulo}</span>
                  <span className="text-muted">{v.institucion}{v.anio ? ` · ${v.anio}` : ""}</span>
                  <span className="ml-auto text-muted">{l.status[v.estado] ?? v.estado}</span>
                  {v.nota && <span className="w-full text-muted">{v.nota}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {yo.admin && (
        <section className="grid gap-4">
          <h2 className="font-serif text-2xl tracking-[-0.02em]">{l.adminTitle}</h2>
          {!pend?.length ? <p className="text-muted">{l.adminEmpty}</p> : pend.map((v) => (
            <article key={v.id} className="card grid gap-3 p-6 text-sm">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-serif text-xl">{v.nombre}</span>
                <a href={`https://orcid.org/${v.usuario}`} target="_blank" rel="noreferrer" className="font-mono text-muted underline">{v.usuario}</a>
              </div>
              <p className="text-fg-2">{l.types[v.tipo] ?? v.tipo}: {v.titulo} · {v.institucion}{v.anio ? ` · ${v.anio}` : ""} · {v.area}</p>
              {v.doc_sha256 && <p className="font-mono text-xs text-muted">{l.hash}: {v.doc_sha256}</p>}
              <details><summary className="cursor-pointer text-muted">{l.evidence}</summary><pre className="mt-2 max-h-60 overflow-auto rounded-md bg-bg-2 p-3 text-xs">{v.evidencia}</pre></details>
              <form className="flex flex-wrap items-center gap-3" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); revisar(v.id, (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") as "aprobada" | "rechazada", String(f.get("nota") ?? "")); }}>
                <a href={`/api/admin/documento/${v.id}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-md border border-line px-4 text-fg">{l.openDoc}</a>
                <input name="nota" placeholder={l.note} className="h-10 min-w-56 flex-1 rounded-md border border-line bg-surface px-3" />
                <button type="submit" value="aprobada" className="inline-flex h-10 items-center rounded-md bg-[var(--ink)] px-4 text-[var(--bg)]">{l.approve}</button>
                <button type="submit" value="rechazada" className="inline-flex h-10 items-center rounded-md border border-line px-4 text-red">{l.reject}</button>
              </form>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
