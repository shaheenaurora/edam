import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router";
import { ArrowLeft, Minus, Package, Plus, TreePine } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/context/CartContext";
import { inr, FREE_SHIPPING_ABOVE } from "@/lib/format";
import { Reveal } from "@/components/Reveal";

const MIN_ITEMS = 3;

export default function BuildHamperPage() {
  const products = trpc.catalogue.products.useQuery({}, { staleTime: 30_000 });
  const { add, setOpen } = useCart();
  const navigate = useNavigate();
  const [picked, setPicked] = useState<Record<string, number>>({});

  // Everything gift-ready can go in a hamper — except live plants, which travel
  // on their own schedule and shouldn't sit in a gift box.
  const giftables = useMemo(
    () =>
      (products.data ?? []).filter((p) => p.giftReady && !p.livePlant && p.stock > 0),
    [products.data],
  );

  const chosen = useMemo(
    () =>
      Object.entries(picked)
        .map(([slug, qty]) => ({ product: giftables.find((p) => p.slug === slug), qty }))
        .filter((c): c is { product: (typeof giftables)[number]; qty: number } => Boolean(c.product)),
    [picked, giftables],
  );

  const itemCount = chosen.reduce((s, c) => s + c.qty, 0);
  const total = chosen.reduce((s, c) => s + c.qty * c.product.price, 0);
  const ready = itemCount >= MIN_ITEMS;

  const bump = (slug: string, delta: number) =>
    setPicked((prev) => {
      const next = { ...prev };
      const qty = (next[slug] ?? 0) + delta;
      if (qty <= 0) delete next[slug];
      else next[slug] = Math.min(qty, 10);
      return next;
    });

  const packHamper = () => {
    for (const c of chosen) {
      const p = c.product;
      add(
        { slug: p.slug, name: p.name, price: p.price, unit: p.unit, image: p.image, range: p.range },
        c.qty,
      );
    }
    setOpen(false);
    // Tell checkout this is a gift — the gift section opens pre-ticked.
    localStorage.setItem("edam-gift-intent", "1");
    navigate("/checkout");
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <Link
        to="/gifting"
        className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All gifting
      </Link>

      <div className="mt-6 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Build your own hamper</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-foreground sm:text-5xl">
          Pick the pieces. We pack it like a gift, because it is one.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Choose {MIN_ITEMS} or more things and we'll assemble them on the kraft-and-coir tray, tuck in a
          hand-written seed-paper card, and plant a tree for the recipient — all inside the price you see. Live
          plants travel separately, so they're not in this list.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* picker */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
          {giftables.map((p, i) => {
            const qty = picked[p.slug] ?? 0;
            return (
              <Reveal key={p.slug} delay={(i % 6) * 40}>
                <div className={`flex h-full flex-col ${qty > 0 ? "rounded-md ring-2 ring-clay" : ""}`}>
                  <Link to={`/product/${p.slug}`} className="focus-ring block overflow-hidden rounded-t-md bg-secondary">
                    <img src={p.image} alt={p.name} className="aspect-square w-full object-cover" loading="lazy" />
                  </Link>
                  <div className="flex flex-1 flex-col pt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-clay">{p.category}</p>
                    <p className="mt-1 font-display text-lg leading-snug text-foreground">{p.name}</p>
                    <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                      {inr(p.price)} <span className="text-xs font-normal text-muted-foreground">· {p.unit}</span>
                    </p>
                    <div className="mt-auto pt-3">
                      {qty === 0 ? (
                        <button
                          onClick={() => bump(p.slug, 1)}
                          className="focus-ring h-11 w-full border border-foreground text-[13px] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-foreground hover:text-background"
                        >
                          Add to hamper
                        </button>
                      ) : (
                        <div className="flex items-center justify-between border border-primary">
                          <button
                            onClick={() => bump(p.slug, -1)}
                            aria-label={`Remove one ${p.name} from hamper`}
                            className="focus-ring flex h-11 w-11 items-center justify-center text-foreground hover:bg-secondary"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-semibold tabular-nums">{qty} in the hamper</span>
                          <button
                            onClick={() => bump(p.slug, 1)}
                            aria-label={`Add one more ${p.name} to the hamper`}
                            className="focus-ring flex h-11 w-11 items-center justify-center text-foreground hover:bg-secondary"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* tray */}
        <aside className="h-fit rounded-md border border-border bg-card p-6 lg:sticky lg:top-32">
          <h2 className="flex items-center gap-2 font-display text-xl text-foreground">
            <Package className="h-5 w-5 text-clay" strokeWidth={1.75} /> Your hamper
          </h2>

          {chosen.length === 0 ? (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Nothing picked yet. Start with something they'd never buy themselves — the forest honey is the usual
              answer.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {chosen.map((c) => (
                <li key={c.product.slug} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{c.product.name}</span>
                    <span className="text-xs text-muted-foreground">× {c.qty}</span>
                  </span>
                  <span className="shrink-0 tabular-nums">{inr(c.product.price * c.qty)}</span>
                </li>
              ))}
            </ul>
          )}

          <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Hamper total (incl. GST)</dt>
              <dd className="font-semibold tabular-nums">{inr(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">
                {total >= FREE_SHIPPING_ABOVE ? "Free" : total > 0 ? `${inr(79)} · free above ${inr(FREE_SHIPPING_ABOVE)}` : "—"}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex items-start gap-2 rounded-md bg-secondary p-3 text-xs leading-relaxed text-secondary-foreground">
            <TreePine className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
            <span>
              A tree in the recipient's name, the tray, the kraft and the hand-written card — included, never
              itemised at you.
            </span>
          </div>

          <button
            onClick={packHamper}
            disabled={!ready}
            className="focus-ring mt-5 h-13 w-full bg-primary py-4 text-sm font-semibold uppercase tracking-[0.1em] text-primary-foreground transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            {ready ? "Pack this hamper" : `Pick ${MIN_ITEMS - itemCount} more to make a hamper`}
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            The gift message and the tree recipient are set at the next step.
          </p>
        </aside>
      </div>
    </div>
  );
}
