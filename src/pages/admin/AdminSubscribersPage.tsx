import { trpc } from "@/providers/trpc";
import { Download, Trash2 } from "lucide-react";

export default function AdminSubscribersPage() {
  const subs = trpc.admin.subscribers.useQuery();
  const utils = trpc.useUtils();
  const remove = trpc.admin.removeSubscriber.useMutation({
    onSuccess: () => utils.admin.subscribers.invalidate(),
  });

  const exportCsv = () => {
    const rows = subs.data ?? [];
    const csv = ["email,consent,subscribed_on", ...rows.map((s) => `${s.email},${s.consent},${new Date(s.createdAt).toISOString()}`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "edam-field-notes-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-foreground">Field Notes subscribers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {subs.data?.length ?? 0} consented emails. Export for your newsletter tool; honour removals immediately.
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={(subs.data ?? []).length === 0}
          className="focus-ring inline-flex h-11 items-center gap-2 border border-foreground px-5 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-40"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <ul className="divide-y divide-border">
          {(subs.data ?? []).map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold">{s.email}</p>
                <p className="text-xs text-muted-foreground">
                  since {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <button
                onClick={() => remove.mutate({ id: s.id })}
                aria-label={`Remove ${s.email}`}
                className="focus-ring flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {(subs.data ?? []).length === 0 && (
            <li className="px-4 py-10 text-center text-sm text-muted-foreground">No subscribers yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
