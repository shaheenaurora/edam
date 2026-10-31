import { Link, useParams } from "react-router";
import { CheckCircle2, TreePine, ArrowRight } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { inr } from "@/lib/format";
import NotFound from "./NotFound";

export default function OrderConfirmationPage() {
  const { orderNo = "" } = useParams();
  const { data, isLoading } = trpc.orders.byOrderNo.useQuery({ orderNo }, { staleTime: 60_000 });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <div className="h-10 w-2/3 animate-pulse rounded bg-secondary" />
        <div className="mt-4 h-40 animate-pulse rounded bg-secondary" />
      </div>
    );
  }
  if (!data) return <NotFound />;

  const { order, trees } = data;
  const items = JSON.parse(order.items) as { name: string; qty: number; price: number; unit: string }[];

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-4xl text-foreground">Thank you, {order.name.split(" ")[0]}.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Order <strong className="text-foreground">{order.orderNo}</strong> is placed. A confirmation, with your tree
          certificate, is on its way to <strong className="text-foreground">{order.email}</strong>.
        </p>
      </div>

      {/* Tree certificate */}
      {trees.length > 0 && (
        <section className="mt-10 rounded-md border border-primary/30 bg-secondary p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <TreePine className="mt-1 h-8 w-8 shrink-0 text-primary" strokeWidth={1.5} />
            <div>
              <h2 className="font-display text-2xl text-foreground">Your tree{trees.length > 1 ? "s" : ""}</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                {trees.length === 1 ? "This tree is" : "These trees are"} pledged to the open batch at Vattakkad village
                commons, Thrissur, planted with the Chalakudy River Guardians in the pre-monsoon window. Not a donation,
                not an offset. Part of what you bought.
              </p>
              <ul className="mt-4 space-y-2">
                {trees.map((t) => (
                  <li key={t.treeNo} className="flex items-center justify-between rounded border border-border bg-card px-4 py-3 text-sm">
                    <span className="font-mono font-semibold tracking-wide text-primary">{t.treeNo}</span>
                    <span className="text-muted-foreground">{t.species}{t.recipientName ? ` · for ${t.recipientName}` : ""}</span>
                  </li>
                ))}
              </ul>
              <Link to={`/the-tree?find=${order.orderNo}`} className="focus-ring mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-clay">
                Find it on the public ledger <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Order summary */}
      <section className="mt-8 rounded-md border border-border p-6 sm:p-8">
        <h2 className="font-display text-xl text-foreground">What you ordered</h2>
        <ul className="mt-4 divide-y divide-border text-sm">
          {items.map((i) => (
            <li key={i.name} className="flex justify-between py-3">
              <span>{i.name} <span className="text-muted-foreground">· {i.unit} × {i.qty}</span></span>
              <span className="tabular-nums">{inr(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-2 space-y-1.5 border-t border-border pt-4 text-sm">
          {order.discount > 0 && (
            <div className="flex justify-between font-semibold text-primary">
              <dt>Discount{order.discountCode ? ` · ${order.discountCode}` : ""}</dt>
              <dd className="tabular-nums">− {inr(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{order.shipping === 0 ? "Free" : inr(order.shipping)}</dd></div>
          <div className="flex justify-between text-base font-semibold"><dt>Total (incl. GST)</dt><dd className="tabular-nums">{inr(order.total)}</dd></div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Payment</dt>
            <dd><span className="uppercase">{order.paymentMethod}</span> · <span className="capitalize">{order.paymentStatus}</span></dd>
          </div>
        </dl>
        {order.isGift && order.giftMessage && (
          <p className="mt-4 rounded-md bg-secondary p-4 text-sm italic text-foreground/85">“{order.giftMessage}”</p>
        )}
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/shop" className="focus-ring inline-flex h-12 items-center justify-center border border-foreground px-8 text-sm font-semibold hover:bg-foreground hover:text-background">
          Keep browsing
        </Link>
        <Link to="/the-stay" className="focus-ring inline-flex h-12 items-center justify-center bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-forest-deep">
          Or come stay with us
        </Link>
      </div>
    </div>
  );
}
