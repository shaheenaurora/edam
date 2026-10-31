import { Link, useParams } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { rangeBySlug, RANGES } from "@/lib/ranges";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import NotFound from "./NotFound";

export default function RangePage() {
  const { slug = "" } = useParams();
  const meta = rangeBySlug(slug);

  const products = trpc.catalogue.products.useQuery(
    { range: meta?.key },
    { enabled: !!meta, staleTime: 30_000 },
  );

  if (!meta) return <NotFound />;

  const idx = RANGES.findIndex((r) => r.key === meta.key);
  const next = RANGES[(idx + 1) % RANGES.length];

  return (
    <div>
      {/* Range hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img src={meta.image} alt={meta.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/80 via-forest-deep/40 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <Link to="/shop" className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cream/80 hover:text-cream">
            <ArrowLeft className="h-3.5 w-3.5" /> All products
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#B38A56]">{meta.role}</p>
          <h1 className="mt-2 font-display text-5xl text-cream sm:text-6xl">{meta.name}</h1>
          <p className="mt-2 font-display text-xl italic text-cream/85">{meta.line}.</p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream/85">{meta.description}</p>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        {products.isLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-md bg-secondary" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {(products.data ?? []).map((p, i) => (
              <Reveal key={p.slug} delay={(i % 4) * 50}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Next range */}
      <section className="border-t border-border">
        <Link to={`/shop/${next.slug}`} className="focus-ring group mx-auto flex max-w-7xl items-center justify-between px-5 py-10 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Next range</p>
            <p className="mt-1 font-display text-2xl text-foreground transition-colors group-hover:text-clay sm:text-3xl">
              {next.name}
            </p>
          </div>
          <ArrowRight className="h-6 w-6 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-clay" />
        </Link>
      </section>
    </div>
  );
}
