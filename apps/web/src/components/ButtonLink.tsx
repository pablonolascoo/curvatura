import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

type Props = { href: string; children: React.ReactNode; variant?: "solid" | "outline"; external?: boolean };

/** Botón de enlace: sólido #111 o contorno de 1 px, radio 6 px. */
export function ButtonLink({ href, children, variant = "solid", external }: Props) {
  const cls = [
    "group inline-flex h-11 items-center gap-2.5 rounded-md px-5 text-[15px] font-medium whitespace-nowrap",
    "transition-[background-color,border-color,transform] duration-200 ease-premium active:scale-[0.98]",
    variant === "solid"
      ? "bg-[var(--ink)] text-[var(--bg)] hover:opacity-90"
      : "border border-line bg-surface text-fg hover:border-line-strong",
  ].join(" ");
  const Icon = external ? ArrowUpRight : ArrowRight;
  const icon = <Icon size={16} weight="bold" aria-hidden className="transition-transform duration-200 ease-premium group-hover:translate-x-0.5" />;
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
