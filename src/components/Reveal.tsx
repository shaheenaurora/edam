import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Quiet scroll-reveal. Content is visible by default; when JS and
 * IntersectionObserver are available, the element arms, then eases in
 * the first time it enters the viewport. Honors prefers-reduced-motion.
 */
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 40) return; // already visible on load — don't animate
    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px 48px 0px" },
    );
    io.observe(el);
    // Safety net: if the observer never fires (edge cases with very tall
    // elements, print emulation, odd browsers), reveal anything that has
    // reached the viewport so content is never stranded invisible.
    const fallback = window.setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) setInView(true);
    }, 1400);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: armed ? `${delay}ms` : undefined }}
      className={`reveal ${armed ? "reveal-armed" : ""} ${inView ? "reveal-in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
