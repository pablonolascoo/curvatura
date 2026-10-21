/**
 * Banderas en círculo por país de las instituciones de los autores (OpenAlex).
 * Hasta `max` superpuestas y «+n» para el resto; nombre del país en el idioma de la página.
 */
export function Flags({ codes, lang, max = 4, size = 18, withNames = false }: { codes: string[]; lang: string; max?: number; size?: number; withNames?: boolean }) {
  if (!codes?.length) return null;
  let names: Intl.DisplayNames | null = null;
  try { names = new Intl.DisplayNames([lang], { type: "region" }); } catch { names = null; }
  const name = (c: string) => names?.of(c.toUpperCase()) ?? c.toUpperCase();
  const shown = codes.slice(0, max);
  const label = codes.map(name).join(", ");
  return (
    <span className="inline-flex items-center gap-2" title={label}>
      <span className="flex -space-x-1.5" aria-hidden={withNames}>
        {shown.map((c) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={c} src={`/flags/${c.toLowerCase()}.svg`} alt={withNames ? "" : name(c)} width={size} height={size} loading="lazy"
            className="rounded-full object-cover ring-2 ring-[var(--surface)]" style={{ width: size, height: size }} />
        ))}
      </span>
      {codes.length > max && <span className="font-mono text-xs text-muted">+{codes.length - max}</span>}
      {withNames && <span className="text-sm text-fg-2">{label}</span>}
    </span>
  );
}
