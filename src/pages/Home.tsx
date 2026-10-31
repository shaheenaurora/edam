import { Link } from "react-router";
import { ArrowRight, Recycle, TreePine, UserRound } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { RANGES } from "@/lib/ranges";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { TreeCounter } from "@/components/TreeCounter";

const PROOFS = [
  {
    icon: UserRound,
    title: "Named makers",
    text: "Every product names the farm, collective or artisan behind it — with a photograph, not a logo.",
    to: "/makers",
  },
  {
    icon: Recycle,
    title: "Plastic-free",
    text: "Coir, glass, paper and tin. The parcel that arrives is the proof — nothing synthetic to throw away.",
    to: "/our-story",
  },
  {
    icon: TreePine,
    title: "A tree in every order",
    text: "Included in the price, never an add-on. Your tree has an ID, a site, and a survival count.",
    to: "/the-tree",
  },
];

export default function Home() {
  const featured = trpc.catalogue.featured.useQuery(undefined, { staleTime: 60_000 });
  const makers = trpc.makers.list.useQuery(undefined, { staleTime: 60_000 });
  const featuredMaker = makers.data?.[0];

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative">
        <div className="absolute inset-0">
          <img
            src="/images/hero.png"
            alt="A Kerala homestead garden in morning light, mist over banana and coconut palms"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/80 via-forest-deep/45 to-transparent" />
        </div>
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-4 py-24 sm:px-6">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B38A56]">
              Eco-conscious stays · natural products · real trees
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] text-cream sm:text-6xl lg:text-7xl">
              Rooted in truth.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-cream/90">
              The honest version of your everyday things — from a named Kerala maker, plastic-free, and every order
              plants a tree.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/shop"
                className="focus-ring inline-flex h-12 items-center justify-center gap-2 bg-cream px-8 text-sm font-semibold tracking-wide text-foreground transition-colors hover:bg-white"
              >
                Shop the ranges <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/makers"
                className="focus-ring inline-flex h-12 items-center justify-center gap-2 border border-cream/60 px-8 text-sm font-semibold tracking-wide text-cream transition-colors hover:bg-cream/10"
              >
                See where it comes from
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Proof strip ---------- */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
          {PROOFS.map((p) => (
            <Reveal key={p.title}>
              <Link to={p.to} className="focus-ring group flex gap-4">
                <p.icon className="mt-1 h-6 w-6 shrink-0 text-clay" strokeWidth={1.5} />
                <span>
                  <span className="block font-display text-lg text-foreground">{p.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{p.text}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary group-hover:text-clay">
                    The proof <ArrowRight className="h-3 w-3" />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- The five ranges ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">The catalogue</p>
              <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">Five ways of living, one way of making.</h2>
            </div>
            <Link
              to="/shop"
              className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-clay"
            >
              Browse everything <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {RANGES.map((r, i) => (
            <Reveal key={r.key} delay={i * 60} className={i < 2 ? "lg:col-span-3" : "lg:col-span-2"}>
              <Link
                to={`/shop/${r.slug}`}
                className="focus-ring group relative block h-64 overflow-hidden rounded-md sm:h-72"
              >
                <img
                  src={r.image}
                  alt={r.name}
                  loading="lazy"
                  className="img-fade absolute inset-0 h-full w-full object-cover group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/85 via-forest-deep/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B38A56]">{r.role}</p>
                  <h3 className="mt-1 font-display text-2xl text-cream">{r.name}</h3>
                  <p className="text-sm text-cream/80">{r.line}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Tree counter band ---------- */}
      <section className="bg-forest-deep">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B38A56]">The Tree Ledger</p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-cream sm:text-4xl">
                Everyone says they plant trees.
                <br />
                We'll show you ours.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/75">
                Where, which species, and whether they lived — the count below is the real one, never rounded up.
                Survival at twelve months is published on the ledger, including when the number disappoints.
              </p>
              <Link
                to="/the-tree"
                className="focus-ring mt-6 inline-flex items-center gap-2 border border-cream/50 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
              >
                Open the ledger <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="rounded-md border border-cream/15 bg-forest p-8 sm:p-10">
              <TreeCounter dark />
              <div className="mt-6 border-t border-cream/15 pt-5 text-sm text-cream/70">
                <p>
                  Planted with the Nilambur Vanam Trust and the Chalakudy River Guardians — sites and batches on the
                  ledger page.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Featured products ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Start here</p>
              <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">The ones we'd hand you first.</h2>
            </div>
            <Link to="/shop" className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-clay">
              Shop all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {(featured.data ?? []).slice(0, 8).map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 60}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
        {featured.isLoading && (
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-md bg-secondary" />
            ))}
          </div>
        )}
      </section>

      {/* ---------- Featured maker ---------- */}
      {featuredMaker && (
        <section className="border-y border-border bg-secondary">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
            <Reveal>
              <div className="overflow-hidden rounded-md">
                <img
                  src={featuredMaker.image}
                  alt={featuredMaker.name}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Meet the makers</p>
                <h2 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
                  {featuredMaker.name}
                </h2>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">
                  {featuredMaker.kind} · {featuredMaker.place}
                </p>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-foreground/85">{featuredMaker.summary}</p>
                <Link
                  to={`/makers/${featuredMaker.slug}`}
                  className="focus-ring mt-6 inline-flex items-center gap-2 border border-foreground px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  Read their story <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------- Stay bridge ---------- */}
      <section className="relative">
        <div className="absolute inset-0">
          <img src="/images/stay.png" alt="The Edam eco cottage among Kerala greenery" loading="lazy" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-forest-deep/60" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <Reveal>
            <div className="max-w-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B38A56]">The other half of Edam</p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-cream sm:text-4xl">
                Some things should be stayed in, not shipped.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-cream/85">
                Edam began as a place — a quiet, green homestead in Thrissur where stressed people come to recharge.
                Every stay plants a tree, and every guest leaves with seeds or a sapling.
              </p>
              <Link
                to="/the-stay"
                className="focus-ring mt-6 inline-flex items-center gap-2 bg-cream px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-white"
              >
                Discover the stay <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Gifting entry ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Gifting</p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
                Send Kerala home — the real thing, with a tree in their name.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Hampers built on wooden trays, gift cards, and trees planted for someone you love. Photographed as the
                parcel that actually arrives — because for a gift sent from far away, trust is the whole product.
              </p>
              <Link
                to="/gifting"
                className="focus-ring mt-6 inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-forest-deep"
              >
                Find a gift <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="order-1 overflow-hidden rounded-md lg:order-2">
              <img src="/images/range-give.png" alt="An Edam gift hamper on a wooden tray" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
