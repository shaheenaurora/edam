import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowRight, Leaf, Minus, Package, Plus, Recycle, TreePine } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { inr } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import NotFound from "./NotFound";

export default function ProductPage() {
  const { slug = "" } = useParams();
  const { data: product, isLoading } = trpc.catalogue.product.useQuery({ slug }, { staleTime: 30_000 });
  const makerId = product?.makerId;
  const siblings = trpc.catalogue.byMaker.useQuery({ makerId: makerId ?? 0 }, { enabled: !!makerId, staleTime: 60_000 });
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-md bg-secondary" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-secondary" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-secondary" />
          <div className="h-40 w-full animate-pulse rounded bg-secondary" />
        </div>
      </div>
    );
  }
  if (!product) return <NotFound />;

  const out = product.stock <= 0;
  const crossSell = (siblings.data ?? []).filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/shop" className="focus-ring hover:text-foreground">Shop</Link>
        <span className="mx-2">/</span>
        <Link to={`/shop/${product.range.toLowerCase()}`} className="focus-ring hover:text-foreground">
          {product.range.charAt(0) + product.range.slice(1).toLowerCase()}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <Reveal>
          <div className="relative overflow-hidden rounded-md bg-secondary">
            <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
            {product.livePlant && (
              <span className="absolute left-4 top-4 flex items-center gap-1.5 bg-background/95 px-3 py-1.5 text-xs font-semibold text-primary">
                <Leaf className="h-3.5 w-3.5" /> Live plant — early-week dispatch
              </span>
            )}
          </div>
        </Reveal>

        {/* Buy box */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">{product.category}</p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-foreground">{product.name}</h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{product.shortLine}</p>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl tabular-nums text-foreground">{inr(product.price)}</span>
            <span className="text-sm text-muted-foreground">· {product.unit} · GST included</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            The price is the provenance: a named maker, small batches, plastic-free packing — no fake compare-at, no fake discount.
          </p>

          <div className="mt-7 flex items-stretch gap-3">
            <div className="flex items-center border border-border">
              <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} className="focus-ring flex h-12 w-11 items-center justify-center hover:bg-secondary">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold tabular-nums">{qty}</span>
              <button aria-label="Increase quantity" onClick={() => setQty(Math.min(20, qty + 1))} className="focus-ring flex h-12 w-11 items-center justify-center hover:bg-secondary">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              disabled={out}
              onClick={() =>
                add(
                  { slug: product.slug, name: product.name, price: product.price, unit: product.unit, image: product.image, range: product.range },
                  qty,
                )
              }
              className="focus-ring h-12 flex-1 bg-primary text-sm font-semibold uppercase tracking-[0.1em] text-primary-foreground transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              {out ? "Out of stock — check back soon" : "Add to basket"}
            </button>
          </div>
          {out && (
            <p className="mt-3 text-sm text-muted-foreground">
              Small batches sell out. <Link to="/policies#contact" className="focus-ring font-semibold text-primary underline underline-offset-2">Write to us</Link> and we'll tell you when the next batch lands.
            </p>
          )}

          {/* Proof points */}
          <ul className="mt-8 space-y-3 border-t border-border pt-6 text-sm">
            <li className="flex items-start gap-3">
              <TreePine className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
              <span>
                <strong>Every order plants a tree.</strong>{" "}
                <Link to="/the-tree" className="focus-ring font-semibold text-primary underline underline-offset-2">See the ledger</Link> — your tree ID arrives with the confirmation.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Recycle className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
              <span><strong>Plastic-free packing.</strong> Paper, coir and jute — the parcel itself keeps the promise.</span>
            </li>
            <li className="flex items-start gap-3">
              <Package className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
              <span>
                {product.livePlant ? (
                  <>
                    <strong>Live-plant handling.</strong> Ships Monday–Wednesday so it never weekends in a warehouse, with a care
                    guide and a first-month replacement promise.
                  </>
                ) : (
                  <>
                    <strong>Ships India-wide</strong> in 2–6 days. Free shipping above {inr(1499)}.
                  </>
                )}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Named source block */}
      <Reveal>
        <section className="mt-14 rounded-md border border-border bg-secondary p-6 sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[280px_1fr]">
            <img src={product.image} alt="" aria-hidden className="hidden aspect-[4/3] w-full rounded-md object-cover lg:block" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">The named source</p>
              <h2 className="mt-2 font-display text-2xl text-foreground sm:text-3xl">Made by {product.makerName}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/85">
                Every Edam product names the farm, collective or artisan behind it — that's not decoration, it's the
                whole model. If we can't name the source, we don't list the product.
              </p>
              <MakerLink makerId={product.makerId} />
            </div>
          </div>
        </section>
      </Reveal>

      {/* Description & usage */}
      <section className="mt-14 grid gap-10 lg:grid-cols-2">
        <Reveal>
          <div>
            <h2 className="font-display text-2xl text-foreground">About it</h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-foreground/85">{product.description}</p>
          </div>
        </Reveal>
        {product.usage && (
          <Reveal delay={100}>
            <div>
              <h2 className="font-display text-2xl text-foreground">Using it well</h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-foreground/85">{product.usage}</p>
            </div>
          </Reveal>
        )}
      </section>

      {/* Cross-sell */}
      {crossSell.length > 0 && (
        <section className="mt-16 border-t border-border pt-12">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl text-foreground sm:text-3xl">From the same maker</h2>
            <Link to="/makers" className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-clay">
              All makers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {crossSell.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MakerLink({ makerId }: { makerId: number }) {
  const makers = trpc.makers.list.useQuery(undefined, { staleTime: 60_000 });
  const maker = makers.data?.find((m) => m.id === makerId);
  if (!maker) return null;
  return (
    <Link
      to={`/makers/${maker.slug}`}
      className="focus-ring mt-5 inline-flex items-center gap-2 border border-foreground px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
    >
      Meet {maker.name} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
