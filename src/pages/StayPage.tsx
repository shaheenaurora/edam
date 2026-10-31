import { Link } from "react-router";
import { ArrowRight, CalendarCheck, Leaf, Moon, Users } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { TreeCounter } from "@/components/TreeCounter";

export default function StayPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img src="/images/stay.png" alt="The Edam homestead — a tiled-roof cottage in lush Kerala greenery" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/80 via-forest-deep/40 to-transparent" />
        </div>
        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center px-5 py-24 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B38A56]">The Stay · Thrissur, Kerala</p>
          <h1 className="mt-4 max-w-xl font-display text-4xl leading-tight text-cream sm:text-6xl">
            A place to step out of a stressful life — and recharge by reconnecting with nature.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-cream/90">
            A small, green homestead near the Vadakkumnathan temple. Nine keys, a nursery, good food, and quiet. Every
            stay plants a tree; every guest leaves with seeds or a sapling.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:stay@edam.in?subject=Stay%20enquiry"
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 bg-cream px-8 text-sm font-semibold text-foreground hover:bg-white"
            >
              Enquire about a stay <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/shop"
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 border border-cream/60 px-8 text-sm font-semibold text-cream hover:bg-cream/10"
            >
              Shop the stay's pantry
            </Link>
          </div>
        </div>
      </section>

      {/* What a stay is */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Moon, t: "Genuine rest", d: "No itinerary, no itinerary pressure. Hammocks, reading corners, and evenings that smell of sambrani." },
            { icon: Leaf, t: "Nature-led by design", d: "The garden, the nursery and the trees are the amenity. Every path is designed to bring you closer to green." },
            { icon: Users, t: "For the people who need it", d: "Tired professionals, writers between chapters, temple visitors, solo travellers, NRIs coming home." },
            { icon: CalendarCheck, t: "Simple to book", d: "Write to us for dates. Also on MakeMyTrip, Booking.com and Cleartrip once listings go live." },
          ].map((f) => (
            <Reveal key={f.t}>
              <div>
                <f.icon className="h-7 w-7 text-clay" strokeWidth={1.5} />
                <h2 className="mt-4 font-display text-xl text-foreground">{f.t}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* The loop */}
      <section className="bg-forest-deep">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2">
          <Reveal>
            <div>
              <h2 className="font-display text-3xl leading-tight text-cream sm:text-4xl">The stay and the store are one brand.</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/80">
                Guests take the pantry home; shoppers come to stay. The soap in the bathroom is the soap in the store.
                The tree your stay plants appears on the same public ledger as the tree your order plants.
              </p>
              <div className="mt-8">
                <TreeCounter dark />
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <img src="/images/range-nourish.png" alt="Spices and staples from the Edam pantry" loading="lazy" className="w-full rounded-md object-cover" />
          </Reveal>
        </div>
      </section>

      {/* Departed guest offer */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <Reveal>
          <div className="rounded-md border border-border bg-secondary p-8 sm:p-12">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Stayed with us?</p>
              <h2 className="mt-2 font-display text-3xl text-foreground">The welcome-back is coded into your card.</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The seed-paper card you left with carries a code for your first store order — our way of keeping the
                stay going after the checkout. If it never reached you, write to{" "}
                <a href="mailto:hello@edam.in" className="focus-ring font-semibold text-primary underline underline-offset-2">hello@edam.in</a>.
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
