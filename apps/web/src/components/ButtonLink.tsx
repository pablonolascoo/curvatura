import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

type Props = { href: string; children: React.ReactNode; variant?: "solid" | "ghost"; external?: boolean };

/** Píldora con icono anidado en su propio círculo. */
export function ButtonLink({ href, children, variant = "solid", external }: Props) {
  const solid = variant === "solid";
  const cls = [
    "group inline-flex items-center gap-3 rounded-full py-2 pl-6 pr-2 text-[15px] font-medium whitespace-nowrap",
    "transition-[transform,background-color,color] duration-500 ease-premium active:scale-[0.98]",
    solid ? "bg-fg text-bg hover:bg-accent" : "text-fg ring-1 ring-line-strong hover:ring-fg/40",
  ].join(" ");
  const icon = (
    <span
      className={[
        "flex size-9 items-center justify-center rounded-full transition-transform duration-500 ease-premium",
        "group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105",
        solid ? "bg-bg/10" : "bg-fg/5",
      ].join(" ")}
    >
      <ArrowUpRight size={16} weight="light" aria-hidden />
    </span>
  );
  if (external)
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {children}
        {icon}
      </a>
    );
  return (
    <Link href={href} className={cls}>
      {children}
      {icon}
    </Link>
  );
}
