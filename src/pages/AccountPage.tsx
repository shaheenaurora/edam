import { Link } from "react-router";
import { Package, TreePine, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { inr } from "@/lib/format";

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const orders = trpc.orders.mine.useQuery(undefined, { enabled: isAuthenticated });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24">
        <div className="h-8 w-48 animate-pulse rounded bg-secondary" />
        <div className="mt-6 h-40 animate-pulse rounded-md bg-secondary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
        <User className="h-10 w-10 text-primary" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-3xl text-foreground">Your Edam account</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Sign in to see your orders and your trees: every order you've placed and the tree IDs that came with them.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          You never need an account to shop or check out. This one is just for keeping your history in one place.
        </p>
        <Link
          to="/login"
          className="focus-ring mt-6 inline-block bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-forest-deep"
        >
          Sign in with email
        </Link>
        <p className="mt-6 text-xs text-muted-foreground">
          Just ordered as a guest? Your tree ID is on your confirmation page and in the email. Or{" "}
          <Link to="/the-tree" className="focus-ring font-semibold text-primary underline underline-offset-2">look it up on the ledger</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-foreground">Hello, {user?.name?.split(" ")[0] ?? "friend"}.</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <button onClick={logout} className="focus-ring border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary">
          Sign out
        </button>
      </div>

      {user?.role === "admin" && (
        <section className="mt-6 rounded-md border border-primary/30 bg-secondary/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Store owner</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Orders, customers, trees and stock live in the admin area.
          </p>
          <Link to="/admin" className="focus-ring mt-3 inline-block bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-forest-deep">
            Open store management
          </Link>
        </section>
      )}

      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
          <Package className="h-5 w-5 text-clay" /> Orders
        </h2>
        {orders.isLoading ? (
          <div className="mt-4 h-32 animate-pulse rounded-md bg-secondary" />
        ) : orders.data && orders.data.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {orders.data.map(({ order, trees }) => {
              const items = JSON.parse(order.items) as { name: string; qty: number }[];
              return (
                <li key={order.orderNo} className="rounded-md border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Link to={`/order/${order.orderNo}`} className="focus-ring font-mono text-sm font-semibold text-primary hover:text-clay">
                        {order.orderNo}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
                        <span className="capitalize">{order.status}</span>
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{inr(order.total)}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {items.map((i) => `${i.name} × ${i.qty}`).join(" · ")}
                  </p>
                  {trees.length > 0 && (
                    <p className="mt-3 flex items-center gap-2 rounded bg-secondary px-3 py-2 text-xs text-secondary-foreground">
                      <TreePine className="h-4 w-4 shrink-0 text-primary" />
                      {trees.map((t) => t.treeNo).join(" · ")} · {trees.length > 1 ? "trees" : "tree"} {trees[0].status}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">No orders yet. The first one plants a tree.</p>
            <Link to="/shop" className="focus-ring mt-4 inline-block bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-forest-deep">
              Browse the store
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
