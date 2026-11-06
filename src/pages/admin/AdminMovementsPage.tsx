import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";

const REASONS = ["sale", "manual", "restock", "adjust", "order_cancelled", "order_reopened", "create", "delete"] as const;

const reasonLabel: Record<string, string> = {
  sale: "Sale",
  manual: "Manual set",
  restock: "Restock",
  adjust: "Adjustment",
  order_cancelled: "Order cancelled",
  order_reopened: "Order reopened",
  create: "Created",
  delete: "Deleted",
};

export default function AdminMovementsPage() {
  const [q, setQ] = useState("");
  const [reason, setReason] = useState("");
  const [productId, setProductId] = useState("");
  const id = parseInt(productId, 10);
  const movements = trpc.admin.stockMovements.useQuery({ productId: Number.isInteger(id) && id > 0 ? id : undefined });

  const rows = (movements.data ?? []).filter(
    (m) =>
      (!reason || m.reason === reason) &&
      (!q || m.productName.toLowerCase().includes(q.toLowerCase()) || m.actor.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-foreground">Stock movements</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every unit in and out — sales, restocks, cancellations, manual edits — with who did it.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            value={productId}
            onChange={(e) => setProductId(e.target.value.replace(/\D/g, ""))}
            placeholder="Product ID"
            className="focus-ring h-11 w-28 rounded-md border border-input bg-card px-3 text-sm tabular-nums"
            title="Filter by product ID (from the products grid URL)"
          />
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="focus-ring h-11 rounded-md border border-input bg-card px-3 text-sm">
            <option value="">All reasons</option>
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {reasonLabel[r]}
              </option>
            ))}
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by product / actor"
            className="focus-ring h-11 w-56 rounded-md border border-input bg-card px-3 text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 text-right font-semibold">Change</th>
              <th className="px-4 py-3 text-right font-semibold">On hand</th>
              <th className="px-4 py-3 font-semibold">By</th>
              <th className="px-4 py-3 font-semibold">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((m) => (
              <tr key={m.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(m.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-3">
                  <Link to={`/admin/products/${m.productId}`} className="text-primary hover:text-clay">
                    {m.productName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs">{reasonLabel[m.reason] ?? m.reason}</td>
                <td className={`px-4 py-3 text-right font-semibold tabular-nums ${m.delta >= 0 ? "text-leaf" : "text-clay"}`}>
                  {m.delta >= 0 ? `+${m.delta}` : m.delta}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{m.resultingStock}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{m.actor}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{m.note}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No movements match. They appear here as soon as stock changes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
