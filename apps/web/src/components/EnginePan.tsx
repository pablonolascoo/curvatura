"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Scroll vertical convertido en desplazamiento horizontal (solo ≥ 768 px y sin movimiento reducido). */
export function EnginePan({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrap.current || !track.current) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const t = track.current!;
      const distance = () => t.scrollWidth - window.innerWidth;
      gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={wrap} className="relative overflow-hidden md:flex md:min-h-[100dvh] md:items-center">
      <div ref={track} className="flex flex-col gap-4 px-4 md:w-max md:flex-row md:gap-6 md:px-[8vw]">
        {children}
      </div>
    </div>
  );
}
