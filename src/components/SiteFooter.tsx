import { Link } from "react-router";
import { RANGES } from "@/lib/ranges";
import { Wordmark } from "./SiteHeader";
import { FieldNotesForm } from "./FieldNotesForm";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-forest-deep text-cream">
      {/* brand mark watermark — the sprout, as used across Edam print collateral */}
      <img
        src="/brand/icon-cream.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 bottom-0 w-72 select-none opacity-[0.07] sm:w-96"
      />
      {/* Field Notes — lead capture */}
      <section className="border-b border-cream/15">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand">
              Field Notes
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              Learn to read a label the way we read one.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/75">
              An occasional letter from Edam: a maker, a season, a guide to telling the real thing from the labelled
              thing. Useful and brand-true — never "10% off".
            </p>
          </div>
          <FieldNotesForm />
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Wordmark light />
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.42em] text-cream/60">Hospitality</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/75">
            The honest version of your everyday things — from a named Kerala maker, plastic-free, and every order
            plants a tree.
          </p>
          <p className="mt-4 text-sm italic text-cream/60">Thrissur, Kerala, India</p>
        </div>

        <nav aria-label="Shop ranges">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/60">Shop</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {RANGES.map((r) => (
              <li key={r.key}>
                <Link to={`/shop/${r.slug}`} className="focus-ring text-cream/85 transition-colors hover:text-cream">
                  {r.name} — {r.line.toLowerCase()}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/shop" className="focus-ring text-cream/85 transition-colors hover:text-cream">
                All products
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="About Edam">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/60">Edam</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/our-story" className="focus-ring text-cream/85 hover:text-cream">Our story</Link></li>
            <li><Link to="/makers" className="focus-ring text-cream/85 hover:text-cream">Our makers</Link></li>
            <li><Link to="/the-tree" className="focus-ring text-cream/85 hover:text-cream">The tree ledger</Link></li>
            <li><Link to="/the-stay" className="focus-ring text-cream/85 hover:text-cream">The stay</Link></li>
            <li><Link to="/gifting" className="focus-ring text-cream/85 hover:text-cream">Gifting</Link></li>
            <li><Link to="/corporate-gifting" className="focus-ring text-cream/85 hover:text-cream">Corporate gifting</Link></li>
            <li><Link to="/journal" className="focus-ring text-cream/85 hover:text-cream">Journal &amp; grow guides</Link></li>
          </ul>
        </nav>

        <nav aria-label="Help and policies">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/60">Help</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/account" className="focus-ring text-cream/85 hover:text-cream">Account &amp; orders</Link></li>
            <li><Link to="/policies#shipping" className="focus-ring text-cream/85 hover:text-cream">Shipping</Link></li>
            <li><Link to="/policies#returns" className="focus-ring text-cream/85 hover:text-cream">Returns &amp; the replacement promise</Link></li>
            <li><Link to="/policies#privacy" className="focus-ring text-cream/85 hover:text-cream">Privacy</Link></li>
            <li><Link to="/policies#terms" className="focus-ring text-cream/85 hover:text-cream">Terms</Link></li>
            <li><Link to="/policies#contact" className="focus-ring text-cream/85 hover:text-cream">Contact us</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-cream/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-cream/55 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© 2026 Edam · Thrissur, Kerala · GST-inclusive pricing, always.</span>
          <span className="italic">"Everyone says they plant trees. We'll show you ours."</span>
        </div>
      </div>
    </footer>
  );
}
