"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Párrafo cuyas palabras pasan de 0.12 a 1 de opacidad al ritmo del scroll. */
export function ScrubText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-w]"),
        { opacity: 0.12 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 42%", scrub: 0.6 },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [text]);
  return (
    <p ref={ref} className="text-[clamp(1.6rem,3.4vw,3.1rem)] leading-[1.18] tracking-[-0.025em] text-fg">
      {text.split(" ").map((w, i) => (
        <span key={i} data-w>
          {w}{" "}
        </span>
      ))}
    </p>
  );
}
