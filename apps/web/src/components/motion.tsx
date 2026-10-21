"use client";

/**
 * Movimiento con GSAP + ScrollTrigger (gpt-taste), contenido y con propósito:
 *   ScrubText    las palabras pasan de 0,12 a 1 de opacidad al ritmo del scroll (lectura guiada)
 *   PinnedSplit  la columna izquierda queda fijada mientras la derecha avanza (≥ 1024 px)
 *   FadeOnLeave  la portada 3D se reduce y se apaga al salir (transición de capítulo)
 * Todo se desactiva con prefers-reduced-motion y se limpia al desmontar.
 */
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ScrubText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll("[data-w]"), { opacity: 0.12 }, {
        opacity: 1, ease: "none", stagger: 0.05,
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.5 },
      });
    }, el);
    return () => ctx.revert();
  }, [text]);
  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} data-w>{w} </span>
      ))}
    </p>
  );
}

export function PinnedSplit({ left, right, className }: { left: React.ReactNode; right: React.ReactNode; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!wrap.current || !pin.current || reduced()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      ScrollTrigger.create({ trigger: wrap.current, start: "top 112px", end: "bottom bottom", pin: pin.current, pinSpacing: false });
      if (bar.current)
        gsap.fromTo(bar.current, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: wrap.current, start: "top 112px", end: "bottom bottom", scrub: true } });
    });
    return () => mm.revert();
  }, []);
  return (
    <div ref={wrap} className={`grid gap-12 lg:grid-cols-12 ${className ?? ""}`}>
      <div className="lg:col-span-5">
        <div ref={pin} className="relative grid gap-6 lg:pr-10">
          {left}
          <div aria-hidden className="hidden h-40 w-px origin-top bg-line lg:block">
            <div ref={bar} className="h-full w-px origin-top bg-[var(--ink)]" />
          </div>
        </div>
      </div>
      <div className="min-w-0 lg:col-span-7">{right}</div>
    </div>
  );
}

export function FadeOnLeave({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const tw = gsap.to(el, {
      scale: 0.92, opacity: 0.2, ease: "none", transformOrigin: "60% 40%",
      scrollTrigger: { trigger: el.parentElement, start: "top top", end: "bottom top", scrub: true },
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); };
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
