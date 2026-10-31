import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { inr } from "@/lib/format";
import { Plus, Trash2 } from "lucide-react";

export default function AdminDiscountsPage() {
  const utils = trpc.useUtils();
  const discounts = trpc.admin.discounts.useQuery();
  const invalidate = () => utils.admin.discounts.invalidate();

  const create = trpc.admin.createDiscount.useMutation({ onSuccess: () => { invalidate(); resetForm(); } });
  const toggle = trpc.admin.setDiscountActive.useMutation({ onSuccess: invalidate });
  const remove = trpc.admin.deleteDiscount.useMutation({ onSuccess: invalidate });

  const [code, setCode] = useState("");
  const [kind, setKind] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("10");
  const [minSubtotal, setMinSubtotal] = useState("0");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => { setCode(""); setValue("10"); setMinSubtotal("0"); setMaxUses(""); setExpiresAt(""); };
  const resetForm = reset;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    create.mutate(
      {
        code,
        kind,
        value: parseInt(value, 10) || 0,
        minSubtotal: parseInt(minSubtotal, 10) || 0,
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
        expiresAt: expiresAt ? new Date(expiresAt + "T23:59:59").toISOString() : null,
      },
      { onError: (err) => setError(err.message) },
    );
  };

  const input = "focus-ring h-11 rounded-md border border-input bg-card px-3 text-sm";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl text-foreground">Discount codes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Validated and priced on the server at order time. A customer can never talk the total down from their browser.
        </p>
      </div>

      <form onSubmit={submit} className="rounded-md border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground">New code</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input required placeholder="Code (e.g. ONAM10)" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className={`${input} font-mono uppercase`} />
          <select value={kind} onChange={(e) => setKind(e.target.value as "percent" | "fixed")} className={input}>
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed ₹ off</option>
          </select>
          <input required type="number" min={1} max={kind === "percent" ? 90 : 100000} placeholder={kind === "percent" ? "% off" : "₹ off"} value={value} onChange={(e) => setValue(e.target.value)} className={input} />
          <input type="number" min={0} placeholder="Min subtotal ₹ (0 = none)" value={minSubtotal} onChange={(e) => setMinSubtotal(e.target.value)} className={input} />
          <input type="number" min={1} placeholder="Max uses (blank = unlimited)" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} className={input} />
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={input} title="Expiry date (optional)" />
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={create.isPending} className="focus-ring mt-4 inline-flex h-11 items-center gap-2 bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-forest-deep disabled:opacity-50">
          <Plus className="h-4 w-4" /> Create code
        </button>
      </form>

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Value</th>
              <th className="px-4 py-3 font-semibold">Rules</th>
              <th className="px-4 py-3 font-semibold">Used</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(discounts.data ?? []).map((d) => (
              <tr key={d.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 font-mono font-semibold">{d.code}</td>
                <td className="px-4 py-3 tabular-nums">{d.kind === "percent" ? `${d.value}% off` : `${inr(d.value)} off`}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {d.minSubtotal > 0 && <span className="block">min {inr(d.minSubtotal)}</span>}
                  {d.maxUses !== null && <span className="block">max {d.maxUses} uses</span>}
                  {d.expiresAt && <span className="block">expires {new Date(d.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                  {d.minSubtotal === 0 && d.maxUses === null && !d.expiresAt && "No conditions"}
                </td>
                <td className="px-4 py-3 tabular-nums">{d.usedCount}{d.maxUses !== null ? ` / ${d.maxUses}` : ""}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggle.mutate({ id: d.id, active: !d.active })}
                    className={`focus-ring rounded-full px-3 py-1 text-xs font-semibold ${d.active ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}
                  >
                    {d.active ? "Active" : "Paused"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove.mutate({ id: d.id })} aria-label={`Delete ${d.code}`} className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {(discounts.data ?? []).length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No codes yet. ONAM10 is a fine place to start.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
