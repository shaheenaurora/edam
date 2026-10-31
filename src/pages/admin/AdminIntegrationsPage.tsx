import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Plus, Trash2, Send, RotateCcw, CheckCircle2, XCircle, CircleDashed } from "lucide-react";

const EVENT_OPTIONS = [
  { id: "order.placed", label: "Order placed" },
  { id: "order.status_changed", label: "Order status changed" },
  { id: "order.cancelled", label: "Order cancelled" },
  { id: "payment.paid", label: "Payment paid" },
  { id: "payment.failed", label: "Payment failed" },
  { id: "*", label: "Everything" },
];

export default function AdminIntegrationsPage() {
  const utils = trpc.useUtils();
  const status = trpc.admin.integrationStatus.useQuery();
  const endpoints = trpc.admin.webhooks.useQuery();
  const deliveries = trpc.admin.webhookDeliveries.useQuery();
  const notifications = trpc.admin.notifications.useQuery();

  const invalidate = () => {
    utils.admin.webhooks.invalidate();
    utils.admin.webhookDeliveries.invalidate();
  };
  const create = trpc.admin.createWebhook.useMutation({ onSuccess: invalidate });
  const toggle = trpc.admin.setWebhookActive.useMutation({ onSuccess: invalidate });
  const remove = trpc.admin.deleteWebhook.useMutation({ onSuccess: invalidate });
  const test = trpc.admin.testWebhook.useMutation({ onSuccess: invalidate });
  const retry = trpc.admin.retryWebhook.useMutation({ onSuccess: invalidate });

  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["order.placed"]);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleEvent = (id: string) =>
    setEvents((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNewSecret(null);
    create.mutate(
      { url, events },
      {
        onSuccess: (res) => { setUrl(""); setNewSecret(res.secret); },
        onError: (err) => setError(err.message),
      },
    );
  };

  const input = "focus-ring h-11 rounded-md border border-input bg-card px-3 text-sm";
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-2xl text-foreground">Integrations</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Payments, outbound webhooks and the mail outbox — the wires that connect Edam to the rest of your stack.
        </p>
      </div>

      {/* Payments */}
      <section className="rounded-md border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg text-foreground">Online payments · Razorpay</h3>
          {status.data && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.data.razorpay ? "bg-primary/10 text-primary" : "bg-sand/20 text-foreground"}`}>
              {status.data.razorpay ? "Connected" : "Not configured"}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          One gateway, every Indian payment method — UPI, cards, netbanking, wallets. Amounts are computed on this
          server from database prices, and a payment counts only when Razorpay's signature verifies. To go live, set{" "}
          <code className="font-mono text-xs">RAZORPAY_KEY_ID</code> and <code className="font-mono text-xs">RAZORPAY_KEY_SECRET</code>{" "}
          in the environment — no code change, the storefront starts offering online checkout immediately.
        </p>
        <div className="mt-4 rounded-md bg-secondary p-4 text-xs leading-relaxed text-secondary-foreground">
          <p className="font-semibold uppercase tracking-[0.12em]">Webhook URL for the Razorpay dashboard</p>
          <p className="mt-1 font-mono break-all">{appUrl}/api/webhooks/razorpay</p>
          <p className="mt-2 text-muted-foreground">Subscribe to <span className="font-mono">payment.captured</span> and <span className="font-mono">payment.failed</span>. Orders mark themselves paid the moment money actually moves.</p>
        </div>
      </section>

      {/* Outbound webhooks */}
      <section className="rounded-md border border-border bg-card p-5 sm:p-6">
        <h3 className="font-display text-lg text-foreground">Outbound webhooks</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Push store events anywhere — a CRM, a courier, Google Sheets via Zapier/Make, your own server. Every delivery
          is signed <code className="font-mono text-xs">X-Edam-Signature: HMAC-SHA256(secret, body)</code> and logged below,
          with retry.
        </p>

        <form onSubmit={submit} className="mt-5 space-y-3 border-t border-border pt-5">
          <input required type="url" placeholder="https://hooks.zapier.com/… or your endpoint" value={url} onChange={(e) => setUrl(e.target.value)} className={`${input} w-full`} />
          <div className="flex flex-wrap gap-2">
            {EVENT_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => toggleEvent(opt.id)}
                className={`focus-ring rounded-full border px-4 py-2 text-xs font-semibold ${events.includes(opt.id) ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {newSecret && (
            <p className="rounded-md bg-primary/10 p-3 font-mono text-xs text-primary">
              Signing secret (shown once — save it): {newSecret}
            </p>
          )}
          <button type="submit" disabled={create.isPending || events.length === 0} className="focus-ring inline-flex h-11 items-center gap-2 bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-forest-deep disabled:opacity-50">
            <Plus className="h-4 w-4" /> Add endpoint
          </button>
        </form>

        <ul className="mt-5 divide-y divide-border">
          {(endpoints.data ?? []).map((ep) => (
            <li key={ep.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs font-semibold">{ep.url}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {(JSON.parse(ep.events) as string[]).join(", ")} · secret {ep.secret}
                </p>
              </div>
              <button onClick={() => test.mutate({ id: ep.id })} className="focus-ring inline-flex h-11 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold hover:border-foreground/40">
                <Send className="h-3.5 w-3.5" /> Test
              </button>
              <button onClick={() => toggle.mutate({ id: ep.id, active: !ep.active })} className={`focus-ring rounded-full px-3 py-1 text-xs font-semibold ${ep.active ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                {ep.active ? "Active" : "Paused"}
              </button>
              <button onClick={() => remove.mutate({ id: ep.id })} aria-label="Delete endpoint" className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {(endpoints.data ?? []).length === 0 && <li className="py-4 text-sm text-muted-foreground">No endpoints yet.</li>}
        </ul>
      </section>

      {/* Delivery log */}
      <section className="rounded-md border border-border bg-card p-5 sm:p-6">
        <h3 className="font-display text-lg text-foreground">Delivery log</h3>
        <ul className="mt-4 divide-y divide-border">
          {(deliveries.data ?? []).map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
              {d.status === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              ) : d.status === "failed" ? (
                <XCircle className="h-4 w-4 shrink-0 text-destructive" />
              ) : (
                <CircleDashed className="h-4 w-4 shrink-0 text-sand" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs font-semibold">{d.event}{d.responseCode ? ` · HTTP ${d.responseCode}` : ""}</p>
                <p className="truncate text-xs text-muted-foreground">{d.url}{d.lastError ? ` — ${d.lastError}` : ""}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(d.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
              {d.status === "failed" && (
                <button onClick={() => retry.mutate({ id: d.id })} className="focus-ring inline-flex h-11 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold hover:border-foreground/40">
                  <RotateCcw className="h-3.5 w-3.5" /> Retry
                </button>
              )}
            </li>
          ))}
          {(deliveries.data ?? []).length === 0 && <li className="py-4 text-sm text-muted-foreground">Nothing delivered yet — place a test order after adding an endpoint.</li>}
        </ul>
      </section>

      {/* Mail outbox */}
      <section className="rounded-md border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg text-foreground">Notification outbox</h3>
          {status.data && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.data.mailer ? "bg-primary/10 text-primary" : "bg-sand/20 text-foreground"}`}>
              {status.data.mailer ? "Mailer connected" : "Queueing only"}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Every confirmation and status mail is recorded here before it goes anywhere. Set{" "}
          <code className="font-mono text-xs">MAIL_WEBHOOK_URL</code> (Resend hook, Zapier, your mailer) and the queue
          starts delivering; without it, nothing pretends to be sent.
        </p>
        <ul className="mt-4 divide-y divide-border">
          {(notifications.data ?? []).map((n) => (
            <li key={n.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
              <span className={`h-2 w-2 shrink-0 rounded-full ${n.status === "sent" ? "bg-primary" : n.status === "failed" ? "bg-destructive" : "bg-sand"}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{n.subject}</p>
                <p className="text-xs text-muted-foreground">{n.toEmail} · {n.kind} · {n.status}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(n.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </li>
          ))}
          {(notifications.data ?? []).length === 0 && <li className="py-4 text-sm text-muted-foreground">No notifications yet.</li>}
        </ul>
      </section>
    </div>
  );
}
