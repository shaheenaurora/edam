import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { inr } from "@/lib/format";

export default function AdminOverviewPage() {
  const stats = trpc.admin.stats.useQuery();
  const recent = trpc.admin.orders.useQuery({});

  if (stats.isLoading) return <p className="text-sm text-muted-foreground">Loading the day's numbers…</p>;
  const s = stats.data;
  if (!s) return <p className="text-sm text-destructive">Could not load stats.</p>;

  const cards = [
    { label: "Revenue (all time)", value: inr(s.revenue), note: `${s.totalOrders} orders` },
    { label: "Open orders", value: String(s.openOrders), note: "placed, not yet packed" },
    { label: "Customers", value: String(s.customers), note: "unique emails" },
    { label: "Field Notes subscribers", value: String(s.subscribers), note: "consented" },
    { label: "Trees registered", value: String(s.registeredTrees), note: "linked to orders" },
    { label: "Low stock", value: String(s.lowStock), note: `of ${s.products} products ≤ 5 units` },
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-md border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-display text-3xl text-foreground">{c.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">Latest orders</h2>
          <Link to="/admin/orders" className="text-xs font-semibold uppercase tracking-[0.14em] text-primary hover:text-clay">
            All orders →
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(recent.data ?? []).slice(0, 8).map((o) => (
                <tr key={o.orderNo} className="hover:bg-secondary/50">
                  <td className="px-4 py-3">
                    <Link to={`/admin/orders/${o.orderNo}`} className="font-mono text-xs font-semibold text-primary hover:text-clay">
                      {o.orderNo}
                    </Link>
                    <span className="block text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </td>
                  <td className="px-4 py-3">{o.name}</td>
                  <td className="px-4 py-3 tabular-nums">{inr(o.total)}</td>
                  <td className="px-4 py-3 uppercase">{o.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={o.status} />
                  </td>
                </tr>
              ))}
              {(recent.data ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No orders yet — they'll land here the moment someone checks out.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    placed: "bg-clay/15 text-clay",
    packed: "bg-sand/20 text-foreground",
    shipped: "bg-leaf/20 text-foreground",
    delivered: "bg-primary/10 text-primary",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status] ?? "bg-secondary text-foreground"}`}>
      {status}
    </span>
  );
}
