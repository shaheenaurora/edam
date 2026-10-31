import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";

export default function AdminSettingsPage() {
  const utils = trpc.useUtils();
  const settings = trpc.admin.settings.useQuery();
  const save = trpc.admin.saveSettings.useMutation({
    onSuccess: (res) => {
      utils.admin.settings.invalidate();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      // keep local state in sync with the server's authoritative values
      setFreeShipping(String(res.freeShippingAbove));
      setShippingFee(String(res.shippingFee));
      setUpiId(res.upiId);
      setSupportEmail(res.supportEmail);
    },
  });

  const [freeShipping, setFreeShipping] = useState("1499");
  const [shippingFee, setShippingFee] = useState("79");
  const [upiId, setUpiId] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (settings.data && !hydrated) {
      setFreeShipping(String(settings.data.freeShippingAbove));
      setShippingFee(String(settings.data.shippingFee));
      setUpiId(settings.data.upiId);
      setSupportEmail(settings.data.supportEmail);
      setHydrated(true);
    }
  }, [settings.data, hydrated]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    save.mutate({
      freeShippingAbove: parseInt(freeShipping, 10) || 0,
      shippingFee: parseInt(shippingFee, 10) || 0,
      upiId: upiId.trim(),
      supportEmail: supportEmail.trim(),
    });
  };

  const input = "focus-ring h-11 w-full rounded-md border border-input bg-card px-3 text-sm";
  const label = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";

  if (settings.isLoading) return <p className="text-sm text-muted-foreground">Loading settings…</p>;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="font-display text-2xl text-foreground">Store settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The server is authoritative. These values drive what checkout actually charges, not just what it displays.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6 rounded-md border border-border bg-card p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="set-free" className={label}>Free shipping above (₹)</label>
            <input id="set-free" type="number" min={0} value={freeShipping} onChange={(e) => setFreeShipping(e.target.value)} className={input} />
          </div>
          <div>
            <label htmlFor="set-fee" className={label}>Shipping fee (₹)</label>
            <input id="set-fee" type="number" min={0} value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} className={input} />
          </div>
        </div>
        <div>
          <label htmlFor="set-upi" className={label}>UPI ID for manual payments</label>
          <input id="set-upi" placeholder="edam@okhdfcbank" value={upiId} onChange={(e) => setUpiId(e.target.value)} className={`${input} font-mono`} />
          <p className="mt-1.5 text-xs text-muted-foreground">Shown at checkout when a customer picks manual UPI and no gateway is connected.</p>
        </div>
        <div>
          <label htmlFor="set-email" className={label}>Support email</label>
          <input id="set-email" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className={input} />
        </div>
        <div className="flex items-center gap-4">
          <button type="submit" disabled={save.isPending} className="focus-ring h-11 bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-forest-deep disabled:opacity-50">
            {save.isPending ? "Saving…" : "Save settings"}
          </button>
          {saved && <span className="text-sm font-semibold text-primary">Saved. Live on the next order.</span>}
          {save.error && <span className="text-sm text-destructive">{save.error.message}</span>}
        </div>
      </form>
    </div>
  );
}
