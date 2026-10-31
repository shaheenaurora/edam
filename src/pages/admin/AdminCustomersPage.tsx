import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { inr } from "@/lib/format";
import { Search } from "lucide-react";

export default function AdminCustomersPage() {
  const [q, setQ] = useState("");
  const customers = trpc.admin.customers.useQuery({ q: q || undefined });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-foreground">Customers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Everyone who has ordered, grouped by email. Guest checkouts appear here too.
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email"
            className="focus-ring h-11 w-full rounded-md border border-input bg-card pl-10 pr-4 text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Orders</th>
              <th className="px-4 py-3 font-semibold">Lifetime value</th>
              <th className="px-4 py-3 font-semibold">Last order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(customers.data ?? []).map((c) => (
              <tr key={c.email} className="hover:bg-secondary/50">
                <td className="px-4 py-3">
                  {c.name}
                  <span className="block text-xs text-muted-foreground">{c.email}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                <td className="px-4 py-3 tabular-nums">{Number(c.ordersCount)}</td>
                <td className="px-4 py-3 font-semibold tabular-nums">{inr(Number(c.totalSpent ?? 0))}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(c.lastOrderAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
            {(customers.data ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No customers match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
