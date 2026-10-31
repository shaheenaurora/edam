import { trpc } from "@/providers/trpc";

const TREE_STATUSES = ["pledged", "planted", "verified"] as const;

export default function AdminTreesPage() {
  const trees = trpc.admin.trees.useQuery({});
  const utils = trpc.useUtils();
  const setStatus = trpc.admin.setTreeStatus.useMutation({
    onSuccess: () => utils.admin.trees.invalidate(),
  });

  const counts = (trees.data ?? []).reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl text-foreground">Tree registry</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every tree pledged by an order. Flip to <em>planted</em> when the batch goes in the ground,{" "}
          <em>verified</em> after the 12-month count — the public ledger reads from this table.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          pledged {counts.pledged ?? 0} · planted {counts.planted ?? 0} · verified {counts.verified ?? 0}
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Tree</th>
              <th className="px-4 py-3 font-semibold">Species</th>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Batch / site</th>
              <th className="px-4 py-3 font-semibold">For</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(trees.data ?? []).map((t) => (
              <tr key={t.treeNo} className="hover:bg-secondary/50">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-clay">{t.treeNo}</td>
                <td className="px-4 py-3">{t.species}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.orderNo ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {t.batchCode ?? "—"}
                  {t.site && <span className="block">{t.site}</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{t.recipientName ?? "—"}</td>
                <td className="px-4 py-3">
                  <select
                    value={t.status}
                    onChange={(e) => setStatus.mutate({ treeNo: t.treeNo, status: e.target.value as (typeof TREE_STATUSES)[number] })}
                    disabled={setStatus.isPending}
                    className="focus-ring h-9 rounded-md border border-input bg-card px-2 text-xs font-semibold capitalize"
                  >
                    {TREE_STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {(trees.data ?? []).length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No trees registered yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
