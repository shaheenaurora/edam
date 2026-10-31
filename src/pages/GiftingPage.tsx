import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, CalendarDays } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

const OCCASIONS = [
  { id: "all", label: "Everything" },
  { id: "hampers", label: "Hampers" },
  { id: "selfcare", label: "For someone tired" },
  { id: "green", label: "For a plant person" },
  { id: "foodie", label: "For a kitchen" },
  { id: "under500", label: "Under ₹500" },
] as const;

const HAMPER_SLUGS = ["the-kerala-pantry", "taste-of-malabar", "the-recharge-box", "the-green-gift"];
const SELFCARE_SLUGS = ["the-recharge-box", "sleep-body-oil", "turmeric-sandal-glow-bar", "after-travel-herbal-tea", "coconut-body-butter", "hibiscus-hair-ritual"];
const GREEN_SLUGS = ["the-green-gift", "kitchen-herb-grow-kit", "terrarium-kit", "seed-ball-pack", "plantable-seed-paper", "a-tree-in-their-name"];
const FOODIE_SLUGS = ["the-kerala-pantry", "taste-of-malabar", "malabar-fish-curry-base", "raw-forest-honey", "malabar-black-pepper", "idukki-cardamom"];

export default function GiftingPage() {
  const [occasion, setOccasion] = useState<(typeof OCCASIONS)[number]["id"]>("all");
  const products = trpc.catalogue.products.useQuery({}, { staleTime: 30_000 });

  const hampers = (products.data ?? []).filter((p) => HAMPER_SLUGS.includes(p.slug));
  const giftables = useMemo(() => {
    const all = products.data ?? [];
    switch (occasion) {
      case "hampers":
        return all.filter((p) => HAMPER_SLUGS.includes(p.slug));
      case "selfcare":
        return all.filter((p) => SELFCARE_SLUGS.includes(p.slug));
      case "green":
        return all.filter((p) => GREEN_SLUGS.includes(p.slug));
      case "foodie":
        return all.filter((p) => FOODIE_SLUGS.includes(p.slug));
      case "under500":
        return all.filter((p) => p.giftReady && p.price <= 500);
      default:
        return all.filter((p) => p.giftReady);
    }
  }, [products.data, occasion]);

  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img src="/images/range-give.png" alt="An Edam hamper on a wooden tray" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-forest-deep/65" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B38A56]">Gifting</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight text-cream sm:text-5xl">
            Send Kerala home — the real thing, beautifully, with a tree planted in their name.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream/85">
            Every hamper is photographed as the parcel that actually arrives. The tree is inside the price — never an
            add-on. Gift messages are hand-written on seed paper that can be planted.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              to="/gifting/build"
              className="focus-ring inline-flex items-center gap-2 bg-cream px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-white"
            >
              Build your own hamper <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="inline-flex items-center gap-2 rounded-md bg-cream/10 px-4 py-2.5 text-xs text-cream backdrop-blur">
              <CalendarDays className="h-4 w-4 text-[#B38A56]" />
              Festival note: order by <strong>18 December</strong> for Christmas delivery across India.
            </div>
          </div>
        </div>
      </section>

      {/* Build your own — entry band */}
      <section className="border-b border-border bg-secondary">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 sm:px-8">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl text-foreground">Rather choose every piece yourself?</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Pick any three or more things and we assemble them as a hamper — tray, kraft, seed-paper card and the
              tree, all inside the price.
            </p>
          </div>
          <Link
            to="/gifting/build"
            className="focus-ring inline-flex items-center gap-2 border border-foreground px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Start building <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Hampers */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <Reveal>
          <h2 className="font-display text-3xl text-foreground">The hampers</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Built on wooden trays and honest kraft, assembled by the same women's collective that makes what's inside.
          </p>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {hampers.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 60}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Gift finder */}
      <section className="border-y border-border bg-secondary">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <Reveal>
            <h2 className="font-display text-3xl text-foreground">Find a gift</h2>
            <p className="mt-2 text-sm text-muted-foreground">By who it's for — not by department.</p>
          </Reveal>
          <div className="mt-6 flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <button
                key={o.id}
                onClick={() => setOccasion(o.id)}
                className={`focus-ring min-h-11 whitespace-nowrap rounded-full border px-5 text-sm font-semibold transition-colors ${
                  occasion === o.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-foreground/40"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {giftables.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* NRI + corporate */}
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-14 sm:px-8 lg:grid-cols-2">
        <Reveal>
          <div className="flex h-full flex-col rounded-md border border-border bg-card p-8">
            <h2 className="font-display text-2xl text-foreground">Sending from abroad?</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              International cards work at checkout, the parcel is photographed as it will arrive, and the tree
              certificate is addressed to your recipient — the distance shrinks to a delivery date.
            </p>
            <Link to="/product/a-tree-in-their-name" className="focus-ring mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-clay">
              The simplest far-away gift: a tree in their name <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="flex h-full flex-col rounded-md border border-border bg-card p-8">
            <h2 className="font-display text-2xl text-foreground">Corporate &amp; occasion gifting</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              Fifty hampers for Onam, five hundred trees for a company's anniversary — same honesty, larger scale,
              co-branded certificates.
            </p>
            <Link to="/corporate-gifting" className="focus-ring mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-clay">
              Start a corporate enquiry <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
