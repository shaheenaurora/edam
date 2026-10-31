import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";

export default function Login() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState<string | null>(null);

  const requestCode = trpc.auth.requestCode.useMutation({
    onSuccess: () => {
      setError(null);
      setStep("code");
    },
    onError: (e) => setError(e.message),
  });

  const verifyCode = trpc.auth.verifyCode.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate("/account");
    },
    onError: (e) => setError(e.message),
  });

  const pending = requestCode.isPending || verifyCode.isPending;

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Your account</p>
      <h1 className="mt-3 font-display text-4xl text-foreground">Sign in with your email</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        No passwords here. We send a six digit code to your inbox, and that gets you in.
      </p>

      {step === "email" ? (
        <form
          className="mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            requestCode.mutate({ email: email.trim() });
          }}
        >
          <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="focus-ring mt-2 h-12 w-full border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground/60"
          />
          <button
            type="submit"
            disabled={pending}
            className="focus-ring mt-4 h-12 w-full bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-forest-deep disabled:opacity-50"
          >
            {pending ? "Sending..." : "Email me a code"}
          </button>
        </form>
      ) : (
        <form
          className="mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            verifyCode.mutate({ email: email.trim(), code: code.trim() });
          }}
        >
          <p className="text-sm text-muted-foreground">
            We sent a code to <span className="font-semibold text-foreground">{email.trim()}</span>. It expires in
            ten minutes.
          </p>
          <label htmlFor="login-code" className="mt-6 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Six digit code
          </label>
          <input
            id="login-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="focus-ring mt-2 h-12 w-full border border-border bg-card px-4 text-center font-mono text-lg tracking-[0.5em] text-foreground placeholder:text-muted-foreground/40"
          />
          <button
            type="submit"
            disabled={pending || code.length !== 6}
            className="focus-ring mt-4 h-12 w-full bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-forest-deep disabled:opacity-50"
          >
            {pending ? "Checking..." : "Sign in"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="focus-ring mt-3 w-full text-center text-xs font-semibold text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Use a different email
          </button>
        </form>
      )}

      {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}

      <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
        You never need an account to shop or check out. This one just keeps your orders and tree IDs in one
        place. Just ordered as a guest?{" "}
        <Link to="/the-tree" className="focus-ring font-semibold text-primary underline underline-offset-2">
          Look up your tree on the ledger
        </Link>
        .
      </p>
    </div>
  );
}
