import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { inr } from "@/lib/format";
import { Search } from "lucide-react";
import { StatusPill } from "./AdminOverviewPage";

const STATUSES = ["placed", "packed", "shipped", "delivered", "cancelled"] as const;

export default function AdminOrdersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number] | undefined>(undefined);
  const orders = trpc.admin.orders.useQuery({ q: q || undefined, status });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order no, name or email"
            className="focus-ring h-11 w-full rounded-md border border-input bg-card pl-10 pr-4 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterPill active={!status} onClick={() => setStatus(undefined)}>All</FilterPill>
          {STATUSES.map((s) => (
            <FilterPill key={s} active={status === s} onClick={() => setStatus(s)}>
              {s}
            </FilterPill>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Placed</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(orders.data ?? []).map((o) => (
              <tr key={o.orderNo} className="hover:bg-secondary/50">
                <td className="px-4 py-3">
                  <Link to={`/admin/orders/${o.orderNo}`} className="font-mono text-xs font-semibold text-primary hover:text-clay">
                    {o.orderNo}
                  </Link>
                  {o.isGift && <span className="ml-2 rounded-full bg-clay/15 px-2 py-0.5 text-[10px] font-semibold text-clay">gift</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  {o.name}
                  <span className="block text-xs text-muted-foreground">{o.email}</span>
                </td>
                <td className="px-4 py-3 tabular-nums">{itemCount(o.items)}</td>
                <td className="px-4 py-3 font-semibold tabular-nums">{inr(o.total)}</td>
                <td className="px-4 py-3 uppercase text-muted-foreground">{o.paymentMethod}</td>
                <td className="px-4 py-3"><StatusPill status={o.status} /></td>
              </tr>
            ))}
            {(orders.data ?? []).length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No orders match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function itemCount(itemsJson: string) {
  try {
    const items = JSON.parse(itemsJson) as { qty: number }[];
    return items.reduce((s, i) => s + i.qty, 0);
  } catch {
    return 0;
  }
}

export function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring h-9 rounded-full border px-4 text-xs font-semibold capitalize transition-colors ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-foreground/40"
      }`}
    >
      {children}
    </button>
  );
}
