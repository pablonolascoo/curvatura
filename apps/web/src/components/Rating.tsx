"use client";

import { useCallback, useEffect, useState } from "react";
import { Medal, Star } from "@phosphor-icons/react";
import { ApiError, api, enApp, loginUrl, postJson, SITE_URL } from "@/lib/api";

type Resumen = { n: number; media: number | null; e1: number; e2: number; e3: number; e4: number; e5: number };
type Datos = {
  resumen: Resumen;
  menciones: { nombre: string; orcid: string; base: string | null }[];
  mia: { estrellas: number; mencion: number } | null;
  usuario: { nombre: string; mencion: string } | null;
};
type Labels = {
  title: string; votes: string; yours: string; login: string; honor: string; honorGive: string; honorGiven: string;
  honorHow: string; honorList: string; error: string; onWeb: string; loading: string; saved: string;
};

function Estrellas({ valor, size = 18, label }: { valor: number; size?: number; label: string }) {
  return (
    <span className="inline-flex text-yellow" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} weight={valor >= i - 0.25 ? "fill" : valor >= i - 0.75 ? "duotone" : "regular"} aria-hidden />
      ))}
    </span>
  );
}

export function Rating({ paper, lang, labels }: { paper: string; lang: string; labels: Labels }) {
  const [d, setD] = useState<Datos | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [hover, setHover] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const app = enApp();
  const fmt = new Intl.NumberFormat(lang, { maximumFractionDigits: 1, minimumFractionDigits: 1 });

  const cargar = useCallback(() => {
    api<Datos>(`/api/valoraciones?paper=${paper}`).then(setD, (e: Error) => setErr(e.message));
  }, [paper]);
  useEffect(cargar, [cargar]);

  const votar = async (estrellas: number, mencion = !!d?.mia?.mencion) => {
    setAviso(null);
    const previo = d;
    if (d) setD({ ...d, mia: { estrellas, mencion: mencion ? 1 : 0 } }); // optimista
    try {
      await postJson("/api/valoraciones", { paper, estrellas, mencion });
      setAviso(labels.saved);
      cargar();
    } catch (e) {
      setD(previo);
      setAviso(e instanceof ApiError ? e.message : labels.error);
    }
  };

  const volver = typeof window !== "undefined" ? location.pathname + location.search : `/${lang}/`;

  if (err) return <p className="tag tag-red w-max normal-case tracking-normal">{labels.error}: {err}</p>;
  if (!d) return <div className="card h-40 animate-pulse bg-gray-bg" aria-busy="true" aria-label={labels.loading} />;

  const media = d.resumen.media ?? 0;
  const mia = d.mia?.estrellas ?? 0;
  return (
    <section className="card grid gap-5 p-6" aria-labelledby={`val-${paper}`}>
      <div className="flex items-end justify-between gap-4">
        <div className="grid gap-1">
          <h2 id={`val-${paper}`} className="text-xs uppercase tracking-[0.05em] text-muted">{labels.title}</h2>
          <div className="flex items-center gap-3">
            <span className="font-mono text-4xl tracking-[-0.04em] text-fg tabular-nums">{d.resumen.n ? fmt.format(media) : "–"}</span>
            <Estrellas valor={media} label={`${fmt.format(media)} / 5`} />
          </div>
          <span className="text-sm text-muted">{d.resumen.n} {labels.votes}</span>
        </div>
        {d.menciones.length > 0 && (
          <span className="tag tag-yellow"><Medal size={14} weight="fill" aria-hidden /> {d.menciones.length}</span>
        )}
      </div>

      {app ? (
        <a href={`${SITE_URL}${volver}`} className="inline-flex h-10 w-max items-center rounded-md border border-line px-4 text-sm text-fg hover:border-line-strong">{labels.onWeb}</a>
      ) : !d.usuario ? (
        <a href={loginUrl(volver)} className="inline-flex h-10 w-max items-center gap-2 rounded-md bg-[var(--ink)] px-4 text-sm font-medium text-[var(--bg)] active:scale-[0.98]">
          {labels.login}
        </a>
      ) : (
        <div className="grid gap-3 border-t border-line pt-4">
          <span className="text-sm text-muted">{labels.yours}</span>
          <div className="flex gap-1" role="radiogroup" aria-label={labels.yours} onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" role="radio" aria-checked={mia === i} aria-label={`${i} / 5`}
                onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(0)} onClick={() => votar(i)}
                className="rounded p-0.5 text-yellow transition-transform hover:scale-110 active:scale-95">
                <Star size={26} weight={(hover || mia) >= i ? "fill" : "regular"} aria-hidden />
              </button>
            ))}
          </div>
          {d.usuario.mencion === "aprobada" ? (
            <button type="button" disabled={!mia} onClick={() => votar(mia, !d.mia?.mencion)}
              className={`inline-flex h-10 w-max items-center gap-2 rounded-md px-4 text-sm font-medium transition-colors disabled:opacity-50 ${d.mia?.mencion ? "bg-yellow-bg text-yellow" : "border border-line text-fg hover:border-line-strong"}`}>
              <Medal size={16} weight={d.mia?.mencion ? "fill" : "regular"} aria-hidden />
              {d.mia?.mencion ? labels.honorGiven : labels.honorGive}
            </button>
          ) : (
            <a href={`/${lang}/cuenta/`} className="w-max text-sm text-muted underline decoration-line-strong underline-offset-4 hover:text-fg">{labels.honorHow}</a>
          )}
          {aviso && <p className="text-sm text-muted" aria-live="polite">{aviso}</p>}
        </div>
      )}

      {d.menciones.length > 0 && (
        <div className="grid gap-2 border-t border-line pt-4">
          <span className="flex items-center gap-2 text-xs uppercase tracking-[0.05em] text-muted"><Medal size={14} weight="fill" className="text-yellow" aria-hidden /> {labels.honorList}</span>
          <ul className="grid gap-1.5 text-sm">
            {d.menciones.map((m) => (
              <li key={m.orcid}>
                <a href={`https://orcid.org/${m.orcid}`} target="_blank" rel="noreferrer" className="text-fg underline decoration-line-strong underline-offset-4">{m.nombre}</a>
                {m.base && <span className="text-muted"> · {m.base}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
