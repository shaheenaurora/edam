import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { inr } from "@/lib/format";
import { ArrowLeft } from "lucide-react";

const FLOW = ["placed", "packed", "shipped", "delivered"] as const;

type AddressForm = { line1: string; line2?: string; city: string; state: string; pincode: string };
type OrderItem = { slug: string; name: string; qty: number; price: number; makerName?: string };

export default function AdminOrderDetailPage() {
  const { orderNo = "" } = useParams();
  const data = trpc.admin.order.useQuery({ orderNo });
  const utils = trpc.useUtils();
  const setStatus = trpc.admin.setOrderStatus.useMutation({
    onSuccess: () => utils.admin.order.invalidate({ orderNo }),
  });

  if (data.isLoading) return <p className="text-sm text-muted-foreground">Loading order…</p>;
  if (!data.data) return <p className="text-sm text-destructive">Order not found.</p>;

  const { order, trees } = data.data;
  const address = safeJson<AddressForm>(order.address);
  const items = safeJson<OrderItem[]>(order.items) ?? [];
  const idx = FLOW.indexOf(order.status);

  return (
    <div className="space-y-8">
      <Link to="/admin/orders" className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-mono text-2xl font-semibold text-foreground">{order.orderNo}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {new Date(order.createdAt).toLocaleString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            {order.isGift && " · Gift order"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</span>
          <select
            value={order.status}
            onChange={(e) => setStatus.mutate({ orderNo, status: e.target.value as (typeof FLOW)[number] })}
            disabled={setStatus.isPending}
            className="focus-ring h-11 rounded-md border border-input bg-card px-3 text-sm font-semibold"
          >
            {FLOW.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* progress */}
      <ol className="flex flex-wrap gap-2">
        {FLOW.map((s, i) => (
          <li
            key={s}
            className={`rounded-full border px-4 py-2 text-xs font-semibold capitalize ${
              i <= idx ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
            }`}
          >
            {s}
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* items */}
        <section className="rounded-md border border-border bg-card p-5 lg:col-span-2">
          <h3 className="font-display text-lg text-foreground">Items</h3>
          <ul className="mt-3 divide-y divide-border">
            {items.map((i) => (
              <li key={i.slug} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-semibold">{i.name}</p>
                  {i.makerName && <p className="text-xs text-muted-foreground">Made by {i.makerName}</p>}
                </div>
                <p className="shrink-0 tabular-nums">× {i.qty} · {inr(i.price * i.qty)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal (incl. GST)</dt><dd className="tabular-nums">{inr(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="tabular-nums">{order.shipping === 0 ? "Free" : inr(order.shipping)}</dd></div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold"><dt>Total</dt><dd className="tabular-nums">{inr(order.total)}</dd></div>
          </dl>
        </section>

        <div className="space-y-6">
          {/* customer */}
          <section className="rounded-md border border-border bg-card p-5">
            <h3 className="font-display text-lg text-foreground">Customer</h3>
            <p className="mt-2 text-sm font-semibold">{order.name}</p>
            <p className="text-sm text-muted-foreground">{order.email}</p>
            <p className="text-sm text-muted-foreground">{order.phone}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Payment · {order.paymentMethod.toUpperCase()}</p>
          </section>

          {/* delivery */}
          {address && (
            <section className="rounded-md border border-border bg-card p-5">
              <h3 className="font-display text-lg text-foreground">Deliver to</h3>
              <p className="mt-2 text-sm leading-relaxed">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
                <br />
                {address.city}, {address.state} — {address.pincode}
              </p>
            </section>
          )}

          {/* gift */}
          {order.isGift && order.giftMessage && (
            <section className="rounded-md border border-border bg-card p-5">
              <h3 className="font-display text-lg text-foreground">Gift note</h3>
              <p className="mt-2 text-sm italic leading-relaxed">"{order.giftMessage}"</p>
              <p className="mt-2 text-xs text-muted-foreground">Hand-write this on the seed-paper card. No invoice in the box.</p>
            </section>
          )}

          {/* trees */}
          <section className="rounded-md border border-border bg-card p-5">
            <h3 className="font-display text-lg text-foreground">Trees from this order</h3>
            <ul className="mt-2 space-y-2">
              {trees.map((t) => (
                <li key={t.treeNo} className="text-sm">
                  <span className="font-mono text-xs font-semibold text-clay">{t.treeNo}</span> · {t.species}
                  {t.recipientName && <span className="text-muted-foreground"> — for {t.recipientName}</span>}
                  <span className="block text-xs capitalize text-muted-foreground">
                    {t.status} · {t.site ?? "site pending"}
                  </span>
                </li>
              ))}
              {trees.length === 0 && <li className="text-sm text-muted-foreground">None registered.</li>}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function safeJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
