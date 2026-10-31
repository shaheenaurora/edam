import { useEffect } from "react";
import { useLocation } from "react-router";
import { Reveal } from "@/components/Reveal";

const SECTIONS = [
  {
    id: "shipping",
    title: "Shipping",
    body: [
      "We ship across India through a multi-carrier aggregator, so your order takes the fastest serviceable route to your pincode. Most orders dispatch within 2 working days and arrive in 2–6.",
      "Shipping is a flat ₹79, free above ₹1,499. Live plants dispatch Monday to Wednesday only — a plant should never spend a weekend in a warehouse — and are currently limited to serviceable South-Indian pincodes while we prove the handling.",
      "Every parcel is packed plastic-free: paper, coir and jute. The packaging is part of the promise, and part of the product photography.",
    ],
  },
  {
    id: "returns",
    title: "Returns & the replacement promise",
    body: [
      "If something arrives damaged, photograph it and write to us within 7 days — replacement or refund, your choice, processed promptly. We log every cause (product, packing or carrier) so the same failure doesn't ship twice.",
      "For live plants: if your plant fails in the first month despite honest care, we replace it. The gain you're buying is not a plant; it's succeeding at keeping one alive.",
      "Edibles and opened personal-care products can't be resold, so we don't take them back — but if something is wrong, tell us and we'll make it right.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy",
    body: [
      "Your data belongs to you and stays portable. Marketing consent is captured explicitly and separately from any order — a purchase is never consent.",
      "We keep personal data only as long as there's a reason to, honour deletion requests, and never sell or rent your information. Payment details never touch our systems; the gateway (PCI-compliant) handles them.",
      "Questions or a deletion request: privacy@edam.in.",
    ],
  },
  {
    id: "terms",
    title: "Terms",
    body: [
      "Prices are displayed inclusive of GST, as Indian consumer rules require — the price on the page is the price at checkout. No compare-at inflation, no countdown timers, no manufactured scarcity.",
      "The tree registered to each order is planted with a named Kerala partner in the next planting window; the tree ID and batch are published on the public ledger, where survival is reported honestly at 12 and 24 months.",
      "Product descriptions stay in their lane: foods are foods, cosmetics are cosmetics. Nothing here makes a medical or therapeutic claim.",
    ],
  },
  {
    id: "faq",
    title: "FAQ",
    body: [
      "Is the tree really included in the price? Yes — it's never a checkout add-on. Every order and every stay registers a tree obligation in our own registry, which feeds the public ledger.",
      "Can I choose the species? The batch planting sets the species with the local partner — natives only, suited to the site.",
      "Do you ship abroad? Not yet at launch; NRI gifters can order to any Indian address with an international card.",
      "Where do products come from? Every product page names its maker — farmer collectives, women's self-help groups and artisan clusters across Kerala.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: [
      "Email: hello@edam.in — the whole team reads it. WhatsApp and phone support run during shop hours, IST.",
      "Edam, Thrissur, Kerala, India. GSTIN and registration details appear on every invoice.",
      "For corporate and bulk gifting, use the enquiry form on the corporate gifting page.",
    ],
  },
];

export default function PoliciesPage() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">The fine print, in plain language</p>
        <h1 className="mt-2 font-display text-4xl text-foreground">Policies, written to be read.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          A brand built on honesty doesn't get to hide behind legal prose. These are the real rules we run on.
        </p>
      </Reveal>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Policy sections">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="focus-ring min-h-11 rounded-full border border-border px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            {s.title}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-12">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-32">
            <h2 className="font-display text-2xl text-foreground">{s.title}</h2>
            <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-foreground/85">
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
