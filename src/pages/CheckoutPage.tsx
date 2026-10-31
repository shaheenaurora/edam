import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Gift, Smartphone, CreditCard, Banknote, TreePine } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/context/CartContext";
import { inr, FREE_SHIPPING_ABOVE, SHIPPING_FEE } from "@/lib/format";

interface AddressForm {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

const emptyAddress: AddressForm = { line1: "", line2: "", city: "", state: "", pincode: "" };

const STATES = [
  "Kerala", "Karnataka", "Tamil Nadu", "Maharashtra", "Delhi", "Telangana", "Andhra Pradesh", "Goa",
  "Gujarat", "West Bengal", "Punjab", "Rajasthan", "Uttar Pradesh", "Madhya Pradesh", "Other",
];

function AddressFields({ value, onChange, prefix }: { value: AddressForm; onChange: (a: AddressForm) => void; prefix: string }) {
  const set = (k: keyof AddressForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...value, [k]: e.target.value });
  const input = "focus-ring h-12 w-full rounded-md border border-input bg-card px-4 text-sm";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <input required id={`${prefix}-line1`} placeholder="Address line 1" value={value.line1} onChange={set("line1")} className={`${input} sm:col-span-2`} />
      <input id={`${prefix}-line2`} placeholder="Address line 2 (optional)" value={value.line2} onChange={set("line2")} className={`${input} sm:col-span-2`} />
      <input required id={`${prefix}-city`} placeholder="City" value={value.city} onChange={set("city")} className={input} />
      <select required id={`${prefix}-state`} value={value.state} onChange={set("state")} className={input}>
        <option value="">State</option>
        {STATES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <input
        required
        id={`${prefix}-pincode`}
        placeholder="Pincode (6 digits)"
        inputMode="numeric"
        pattern="\d{6}"
        maxLength={6}
        value={value.pincode}
        onChange={set("pincode")}
        className={input}
      />
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const createOrder = trpc.orders.create.useMutation();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState<AddressForm>(emptyAddress);
  const [shipToRecipient, setShipToRecipient] = useState(false);
  const [payment, setPayment] = useState<"upi" | "card" | "cod">("upi");
  const [error, setError] = useState<string | null>(null);

  const shipping = subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const treeGiftCount = items.filter((i) => i.slug === "a-tree-in-their-name").reduce((s, i) => s + i.qty, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-foreground">Your basket is empty</h1>
        <p className="text-sm text-muted-foreground">Add something honest first — then this page gets interesting.</p>
        <Link to="/shop" className="focus-ring bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-forest-deep">
          Browse the store
        </Link>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createOrder.mutate(
      {
        email,
        name,
        phone,
        address,
        items: items.map((i) => ({ slug: i.slug, qty: i.qty })),
        paymentMethod: payment,
        isGift,
        giftMessage: isGift && giftMessage ? giftMessage : undefined,
        recipientName: treeGiftCount > 0 && recipientName ? recipientName : undefined,
        recipientAddress: isGift && shipToRecipient ? recipientAddress : undefined,
      },
      {
        onSuccess: (res) => {
          clear();
          navigate(`/order/${res.orderNo}`);
        },
        onError: (err) => setError(err.message),
      },
    );
  };

  const input = "focus-ring h-12 w-full rounded-md border border-input bg-card px-4 text-sm";

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <Link to="/shop" className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Continue shopping
      </Link>
      <h1 className="mt-4 font-display text-4xl text-foreground">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        No account needed, no hidden costs at the last step, GST included in every price. This demo build records the
        order without charging a card.
      </p>

      <form onSubmit={submit} className="mt-10 grid gap-12 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          {/* Contact */}
          <section>
            <h2 className="font-display text-xl text-foreground">1 · Who's ordering</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input required type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={input} />
              <input required type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
              <input required type="email" placeholder="Email (tree certificate goes here)" value={email} onChange={(e) => setEmail(e.target.value)} className={`${input} sm:col-span-2`} />
            </div>
          </section>

          {/* Address */}
          <section>
            <h2 className="font-display text-2xl text-foreground">2 · Delivery address</h2>
            <div className="mt-4">
              <AddressFields value={address} onChange={setAddress} prefix="addr" />
            </div>
          </section>

          {/* Gifting */}
          <section className="rounded-md border border-border bg-secondary/60 p-5 sm:p-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
              <span>
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Gift className="h-4 w-4 text-clay" /> This is a gift
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  We pack gifts as gifts — no invoice inside, a hand-written note if you'd like one.
                </span>
              </span>
            </label>
            {isGift && (
              <div className="mt-5 space-y-4 border-t border-border pt-5">
                <textarea
                  placeholder="Gift message — we'll hand-write it on seed paper"
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="focus-ring w-full rounded-md border border-input bg-card px-4 py-3 text-sm"
                />
                <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
                  <input type="checkbox" checked={shipToRecipient} onChange={(e) => setShipToRecipient(e.target.checked)} className="h-4 w-4 accent-primary" />
                  Ship directly to the recipient
                </label>
                {shipToRecipient && (
                  <AddressFields value={recipientAddress} onChange={setRecipientAddress} prefix="recip" />
                )}
              </div>
            )}
            {treeGiftCount > 0 && (
              <div className="mt-5 border-t border-border pt-5">
                <label className="text-sm font-semibold text-foreground" htmlFor="tree-recipient">
                  Who is the tree for?
                </label>
                <input
                  id="tree-recipient"
                  placeholder="Name on the tree certificate"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className={`${input} mt-2`}
                />
              </div>
            )}
          </section>

          {/* Payment */}
          <section>
            <h2 className="font-display text-2xl text-foreground">3 · Payment</h2>
            <div className="mt-4 space-y-3">
              {(
                [
                  { id: "upi", icon: Smartphone, title: "UPI", desc: "Google Pay, PhonePe, Paytm — intent or QR. The way most of India pays." },
                  { id: "card", icon: CreditCard, title: "Card", desc: "Credit or debit, Indian and international cards welcome (hello, NRI gifters)." },
                  { id: "cod", icon: Banknote, title: "Cash on delivery", desc: "Pay the courier. Available on most pincodes for orders under ₹5,000." },
                ] as const
              ).map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-start gap-4 rounded-md border p-4 transition-colors ${
                    payment === m.id ? "border-primary bg-secondary" : "border-border bg-card hover:border-foreground/40"
                  }`}
                >
                  <input type="radio" name="payment" value={m.id} checked={payment === m.id} onChange={() => setPayment(m.id)} className="mt-1 h-4 w-4 accent-primary" />
                  <m.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{m.title}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{m.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-md border border-border bg-card p-6 lg:sticky lg:top-32">
          <h2 className="font-display text-xl text-foreground">Your order</h2>
          <ul className="mt-4 divide-y divide-border">
            {items.map((i) => (
              <li key={i.slug} className="flex items-center gap-3 py-3">
                <img src={i.image} alt="" className="h-14 w-14 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{i.name}</p>
                  <p className="text-xs text-muted-foreground">× {i.qty}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums">{inr(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal (incl. GST)</dt>
              <dd className="tabular-nums">{inr(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">{shipping === 0 ? "Free" : inr(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{inr(total)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-start gap-2 rounded-md bg-secondary p-3 text-xs leading-relaxed text-secondary-foreground">
            <TreePine className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
            <span>
              This order plants <strong>{1 + treeGiftCount} tree{treeGiftCount > 0 ? "s" : ""}</strong> — included in
              the price. Your tree ID{treeGiftCount > 0 ? "s" : ""} and the ledger link arrive with the confirmation.
            </span>
          </div>
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={createOrder.isPending}
            className="focus-ring mt-5 h-13 w-full bg-primary py-4 text-sm font-semibold uppercase tracking-[0.1em] text-primary-foreground transition-colors hover:bg-forest-deep disabled:opacity-50"
          >
            {createOrder.isPending ? "Placing your order…" : `Place order · ${inr(total)}`}
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Demo checkout — no payment is charged. Placing the order writes it to the store and registers your tree.
          </p>
        </aside>
      </form>
    </div>
  );
}
