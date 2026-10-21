/** Franja continua de texto (una sola por página). Se detiene con movimiento reducido o al pasar el ratón. */
export function Marquee({ items, label }: { items: string[]; label: string }) {
  const row = items.map((t, i) => (
    <li key={i} className="flex shrink-0 items-center gap-10 pr-10 font-serif text-xl italic text-fg-2 md:text-2xl">
      {t}
      <span aria-hidden className="size-1 rounded-full bg-line-strong" />
    </li>
  ));
  return (
    <div className="group relative overflow-hidden border-y border-line bg-surface py-6" aria-label={label}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--surface)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--surface)] to-transparent" />
      <div className="flex w-max motion-safe:animate-[marquee_60s_linear_infinite] group-hover:[animation-play-state:paused]">
        <ul className="flex">{row}</ul>
        <ul className="flex" aria-hidden>{row}</ul>
      </div>
    </div>
  );
}
