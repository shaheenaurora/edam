import { Link } from "react-router";
import { ArrowRight, Sprout } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const VALUES = [
  { t: "Sustainability & eco-friendliness", d: "We choose the greener option even when it's costlier or slower. No decision is allowed to harm nature." },
  { t: "Honesty & ethics", d: "No greenwashing, ever. Sustainability claims are real and verifiable — the ledger is public for a reason." },
  { t: "Positivity", d: "Warmth in every interaction and every corner of the space. A hopeful tone, in service and in content." },
  { t: "Nature-led relaxation", d: "Every experience is designed to bring people closer to nature and help them genuinely unwind — not just to sell a room." },
];

export default function StoryPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img src="/images/story.png" alt="The Edam family homestead in Thrissur" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-forest-deep/65" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B38A56]">Our story</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight text-cream sm:text-6xl">
            A stressed world needs somewhere to recharge. The planet needs businesses that give back more green than they take.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-cream/90">
            Edam is both answers at once — a family brand from Thrissur, Kerala, built by David Mathew and family.
          </p>
        </div>
      </section>

      {/* Purpose */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Why we exist</p>
          <blockquote className="mt-4 border-l-2 border-clay pl-6 font-display text-2xl leading-relaxed text-foreground sm:text-3xl">
            To help people step out of stressful modern life and recharge by reconnecting with nature — while making
            the planet greener and happier for the generations to come.
          </blockquote>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-foreground/85">
            That's the sentence that would survive even if the business never made money. Everything else — the stays,
            the store, the nursery, the trees — is that sentence made operational.
          </p>
        </Reveal>
      </section>

      {/* What that means in practice */}
      <section className="border-y border-border bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Reveal>
            <h2 className="font-display text-3xl text-foreground">What that means in practice</h2>
          </Reveal>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <Reveal key={v.t} delay={(i % 2) * 80}>
                <div className="border-t-2 border-primary/30 pt-5">
                  <h3 className="font-display text-xl text-foreground">{v.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The one thing we removed */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="rounded-md border border-border bg-card p-8">
            <div className="flex items-start gap-4">
              <Sprout className="mt-1 h-7 w-7 shrink-0 text-primary" strokeWidth={1.5} />
              <div>
                <h2 className="font-display text-2xl text-foreground">An honesty story, on the record</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
                  Early in the planning, a skin-whitening cream sat on the product shortlist. It would have sold. It's
                  gone — not deferred, not reworded, removed. A fairness claim is not something Edam believes in, and a
                  brand taking Kerala's traditions honestly to the world doesn't get to make that exception.
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
                  That's the standard applied to every product since: if it exists to chase a trend or make a claim we
                  can't stand behind, it doesn't list — however profitable it might be.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* The goal */}
      <section className="bg-forest-deep">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B38A56]">The five-year goal</p>
            <p className="mt-4 font-display text-3xl leading-snug text-cream sm:text-4xl">
              The No. 1 choice for eco-conscious stays, the No. 1 eco-friendly brand in our market — and 100,000 trees
              planted through Edam and its guests.
            </p>
            <Link
              to="/the-tree"
              className="focus-ring mt-8 inline-flex items-center gap-2 border border-cream/50 px-8 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
            >
              Watch the count <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
