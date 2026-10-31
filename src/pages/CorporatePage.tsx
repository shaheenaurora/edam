import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { FieldNotesForm } from "@/components/FieldNotesForm";

export default function CorporatePage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <Reveal>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Corporate gifting</p>
            <h1 className="mt-2 font-display text-4xl leading-tight text-foreground sm:text-5xl">
              Fifty hampers for Onam. Five hundred trees for an anniversary.
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-foreground/85">
              Corporate gifting at Edam is the same honesty at a larger scale: hampers assembled by the women's
              collective, certificates on plantable seed paper, and a tree count your CSR report can point at, with a
              public ledger behind it.
            </p>
            <ul className="mt-8 space-y-4 text-sm leading-relaxed">
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /> Curated hampers from ₹890, co-branded on request</li>
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /> Bulk tree programmes with batch-level reporting and survival updates</li>
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /> GST invoicing and single-point fulfilment across India</li>
            </ul>
            <img src="/images/range-give.jpg" alt="Edam gifting hampers" loading="lazy" className="mt-8 w-full rounded-md object-cover" />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="rounded-md border border-border bg-card p-6 sm:p-8">
            <h2 className="font-display text-2xl text-foreground">Start an enquiry</h2>
            {sent ? (
              <div className="mt-6 flex items-start gap-3 rounded-md bg-secondary p-5 text-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p>
                  Thank you, noted. Corporate gifting is handled personally; expect a reply from{" "}
                  <strong>gifts@edam.in</strong> within one working day.
                </p>
              </div>
            ) : (
              <form
                className="mt-5 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <input required placeholder="Your name" className="focus-ring h-12 w-full rounded-md border border-input bg-background px-4 text-sm" />
                <input required type="email" placeholder="Work email" className="focus-ring h-12 w-full rounded-md border border-input bg-background px-4 text-sm" />
                <input placeholder="Company" className="focus-ring h-12 w-full rounded-md border border-input bg-background px-4 text-sm" />
                <select required defaultValue="" className="focus-ring h-12 w-full rounded-md border border-input bg-background px-4 text-sm">
                  <option value="" disabled>What are you planning?</option>
                  <option>Festive hampers</option>
                  <option>A bulk tree programme</option>
                  <option>Event / wedding favours</option>
                  <option>Something else</option>
                </select>
                <textarea placeholder="Roughly how many, and by when?" rows={4} className="focus-ring w-full rounded-md border border-input bg-background px-4 py-3 text-sm" />
                <button type="submit" className="focus-ring h-12 w-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-forest-deep">
                  Send the enquiry
                </button>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> Prefer email? gifts@edam.in
                </p>
              </form>
            )}
          </div>
        </Reveal>
      </div>

      <section className="mt-16 rounded-md bg-forest-deep p-8 sm:p-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-2xl text-cream">The Field Notes, for your team</h2>
            <p className="mt-2 text-sm text-cream/75">Our honest guide to reading labels. A useful thing to put in a welcome kit.</p>
          </div>
          <FieldNotesForm />
        </div>
      </section>
    </div>
  );
}
