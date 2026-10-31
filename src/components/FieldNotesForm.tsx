import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CheckCircle2 } from "lucide-react";

export function FieldNotesForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);
  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => setDone(true),
  });

  if (done) {
    return (
      <div className="flex items-start gap-3 text-sm">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className={compact ? "" : "text-cream"}>
          You're on the list. The first Field Note, our honest guide to reading labels, is on its way to{" "}
          <strong>{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email && consent) subscribe.mutate({ email, consent: true });
      }}
      className="w-full"
    >
      <div className={`flex ${compact ? "flex-row" : "flex-col sm:flex-row"} gap-3`}>
        <label htmlFor={compact ? "fn-email-c" : "fn-email"} className="sr-only">
          Email address
        </label>
        <input
          id={compact ? "fn-email-c" : "fn-email"}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={`focus-ring h-12 min-w-0 flex-1 border bg-transparent px-4 text-sm placeholder:opacity-60 ${
            compact
              ? "border-border text-foreground"
              : "border-cream/40 text-cream placeholder:text-cream/50"
          }`}
        />
        <button
          type="submit"
          disabled={!consent || subscribe.isPending}
          className={`focus-ring h-12 shrink-0 px-6 text-sm font-semibold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            compact
              ? "bg-primary text-primary-foreground hover:bg-forest-deep"
              : "bg-cream text-foreground hover:bg-white"
          }`}
        >
          {subscribe.isPending ? "Sending…" : "Get the Field Notes"}
        </button>
      </div>
      <label
        className={`mt-3 flex cursor-pointer items-start gap-2 text-xs leading-relaxed ${
          compact ? "text-muted-foreground" : "text-cream/80"
        }`}
      >
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="focus-ring mt-0.5 h-4 w-4 shrink-0 accent-primary"
        />
        Yes, email me the Field Notes and occasional Edam news. Marketing consent, given separately, as it should be.
        No spam, unsubscribe anytime.
      </label>
      {subscribe.isError && <p className="mt-2 text-xs text-red-700">Something went wrong. Please try again.</p>}
    </form>
  );
}
