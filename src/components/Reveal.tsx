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
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
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
