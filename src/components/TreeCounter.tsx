import { useEffect, useRef, useState } from "react";
import { trpc } from "@/providers/trpc";

function useCountUp(target: number, durationMs = 1400) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current || target <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    started.current = true;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

export function TreeCounter({ dark = false }: { dark?: boolean }) {
  const { data } = trpc.trees.stats.useQuery(undefined, { staleTime: 60_000 });
  const target = (data?.treesPlanted ?? 0) + (data?.pledged ?? 0);
  const value = useCountUp(target);
  const shown = data ? value : null;

  return (
    <div className={`flex items-baseline gap-3 ${dark ? "text-cream" : "text-foreground"}`}>
      <span className="font-display text-5xl tabular-nums sm:text-6xl">
        {shown === null ? "—" : shown.toLocaleString("en-IN")}
      </span>
      <span className={`text-sm leading-snug ${dark ? "text-cream/75" : "text-muted-foreground"}`}>
        trees planted or pledged
        <br />
        with named Kerala partners
      </span>
    </div>
  );
}
