import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { RANGES, type RangeKey } from "@/lib/ranges";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [range, setRange] = useState<RangeKey | null>((params.get("range") as RangeKey) ?? null);
  const [giftOnly, setGiftOnly] = useState(params.get("gift") === "1");
  const [liveOnly, setLiveOnly] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    if (params.get("focus") === "search") {
      document.getElementById("shop-search")?.focus();
    }
  }, [params]);

  useEffect(() => {
    const next: Record<string, string> = {};
    if (q) next.q = q;
    if (range) next.range = range;
    if (giftOnly) next.gift = "1";
    setParams(next, { replace: true });
  }, [q, range, giftOnly, setParams]);

  const products = trpc.catalogue.products.useQuery(
    {
      ...(range ? { range } : {}),
      ...(q ? { q } : {}),
      ...(giftOnly ? { giftReady: true } : {}),
      ...(liveOnly ? { livePlant: true } : {}),
      ...(category ? { category } : {}),
    },
    { staleTime: 30_000 },
  );
  const categories = trpc.catalogue.categories.useQuery({}, { staleTime: 60_000 });

  const activeFilters = useMemo(
    () => [range, giftOnly ? "gift" : null, liveOnly ? "live" : null, category].filter(Boolean).length,
    [range, giftOnly, liveOnly, category],
  );

  const filterPanel = (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Range</h3>
        <ul className="mt-3 space-y-1">
          <li>
            <button
              onClick={() => setRange(null)}
              className={`focus-ring w-full rounded px-2 py-2 text-left text-sm transition-colors ${
                !range ? "bg-secondary font-semibold text-foreground" : "text-foreground/80 hover:bg-secondary/60"
              }`}
            >
              All ranges
            </button>
          </li>
          {RANGES.map((r) => (
            <li key={r.key}>
              <button
                onClick={() => setRange(range === r.key ? null : r.key)}
                className={`focus-ring w-full rounded px-2 py-2 text-left text-sm transition-colors ${
                  range === r.key ? "bg-secondary font-semibold text-foreground" : "text-foreground/80 hover:bg-secondary/60"
                }`}
              >
                {r.name} <span className="text-muted-foreground">— {r.line.toLowerCase()}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {categories.data && categories.data.length > 1 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Type</h3>
          <ul className="mt-3 space-y-1">
            {categories.data.map((c) => (
              <li key={c}>
                <button
                  onClick={() => setCategory(category === c ? null : c)}
                  className={`focus-ring w-full rounded px-2 py-2 text-left text-sm transition-colors ${
                    category === c ? "bg-secondary font-semibold text-foreground" : "text-foreground/80 hover:bg-secondary/60"
                  }`}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Good to know</h3>
        <div className="mt-3 space-y-2">
          <label className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 text-sm text-foreground/80 hover:bg-secondary/60">
            <input type="checkbox" checked={giftOnly} onChange={(e) => setGiftOnly(e.target.checked)} className="h-4 w-4 accent-primary" />
            Gift-ready
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 text-sm text-foreground/80 hover:bg-secondary/60">
            <input type="checkbox" checked={liveOnly} onChange={(e) => setLiveOnly(e.target.checked)} className="h-4 w-4 accent-primary" />
            Live plants (early-week dispatch)
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <Reveal>
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">The store</p>
          <h1 className="mt-2 font-display text-4xl text-foreground">Everything, honestly labelled.</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Prices include GST. Every SKU names its maker. Nothing here carries a claim we can't keep.
          </p>
        </div>
      </Reveal>

      <div className="mt-8 flex items-center gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="shop-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pepper, honey, grow kit…"
            className="focus-ring h-11 w-full rounded-md border border-input bg-card pl-10 pr-4 text-sm"
          />
        </div>
        <button
          onClick={() => setMobileFilters(true)}
          className="focus-ring flex h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilters > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-clay text-[10px] font-bold text-white">{activeFilters}</span>}
        </button>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-32">{filterPanel}</div>
        </aside>

        <div>
          {products.isLoading ? (
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-md bg-secondary" />
              ))}
            </div>
          ) : products.data && products.data.length > 0 ? (
            <>
              <p className="mb-4 text-xs text-muted-foreground">
                {products.data.length} product{products.data.length === 1 ? "" : "s"}
                {q && <> matching “{q}”</>}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 xl:grid-cols-3">
                {products.data.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-border py-20 text-center">
              <p className="max-w-[34ch] text-sm text-muted-foreground">
                Nothing matches that combination. Honesty is a smaller catalogue — try widening the filters.
              </p>
              <button
                onClick={() => {
                  setQ("");
                  setRange(null);
                  setGiftOnly(false);
                  setLiveOnly(false);
                  setCategory(null);
                }}
                className="focus-ring border border-foreground px-6 py-3 text-sm font-semibold hover:bg-foreground hover:text-background"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-forest-deep/50" onClick={() => setMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[86vw] max-w-sm flex-col bg-background">
            <div className="flex items-center justify-between border-b border-border p-4">
              <span className="font-display text-lg">Filters</span>
              <button className="focus-ring flex h-11 w-11 items-center justify-center" aria-label="Close filters" onClick={() => setMobileFilters(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{filterPanel}</div>
            <div className="border-t border-border p-4">
              <button
                onClick={() => setMobileFilters(false)}
                className="focus-ring h-12 w-full bg-primary text-sm font-semibold text-primary-foreground"
              >
                Show {products.data?.length ?? "…"} products
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-16 border-t border-border pt-8 text-xs text-muted-foreground">
        Looking for something specific? <Link to="/policies#contact" className="focus-ring font-semibold text-primary underline underline-offset-2">Write to us</Link> — if it's genuine and Kerala-true, we may know a maker.
      </p>
    </div>
  );
}
