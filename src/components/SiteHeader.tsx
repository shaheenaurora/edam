import { Link, NavLink, useNavigate } from "react-router";
import { Menu, Search, ShoppingBag, User, X, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { inr, FREE_SHIPPING_ABOVE } from "@/lib/format";
import { RANGES } from "@/lib/ranges";
import { trpc } from "@/providers/trpc";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TreePine } from "lucide-react";

const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/gifting", label: "Gifting" },
  { to: "/the-tree", label: "The Tree" },
  { to: "/makers", label: "Our Makers" },
  { to: "/the-stay", label: "The Stay" },
  { to: "/journal", label: "Journal" },
  { to: "/our-story", label: "Our Story" },
];

export function Wordmark({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={light ? "/brand/icon-cream.png" : "/brand/icon-forest.png"}
        alt=""
        className="h-9 w-auto"
        width={578}
        height={603}
      />
      <span
        className={`font-display text-[26px] font-semibold lowercase leading-none tracking-tight ${
          light ? "text-cream" : "text-foreground"
        }`}
      >
        edam
      </span>
    </span>
  );
}

export function CartDrawer() {
  const { items, subtotal, open, setOpen, setQty, remove } = useCart();
  const navigate = useNavigate();
  const config = trpc.config.public.useQuery(undefined, { staleTime: 60_000 });
  const freeAbove = config.data?.freeShippingAbove ?? FREE_SHIPPING_ABOVE;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col bg-background sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 pb-4 pt-5">
          <SheetTitle className="font-display text-xl">Your basket</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" strokeWidth={1.25} />
            <p className="max-w-[26ch] text-sm text-muted-foreground">
              Nothing here yet. Every order plants a tree, whenever you're ready.
            </p>
            <button
              onClick={() => {
                setOpen(false);
                navigate("/shop");
              }}
              className="focus-ring mt-2 border border-foreground px-6 py-3 text-sm font-semibold tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Browse the ranges
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.slug} className="flex gap-4 py-4">
                    <Link
                      to={`/product/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="focus-ring block h-20 w-20 shrink-0 overflow-hidden rounded-md bg-secondary"
                    >
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={() => setOpen(false)}
                          className="focus-ring text-sm font-semibold leading-snug text-foreground"
                        >
                          {item.name}
                        </Link>
                        <span className="shrink-0 text-sm font-semibold">{inr(item.price * item.qty)}</span>
                      </div>
                      <span className="mt-0.5 text-xs text-muted-foreground">{item.unit}</span>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center border border-border">
                          <button
                            aria-label={`Decrease quantity of ${item.name}`}
                            onClick={() => setQty(item.slug, item.qty - 1)}
                            className="focus-ring flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:bg-secondary"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums">{item.qty}</span>
                          <button
                            aria-label={`Increase quantity of ${item.name}`}
                            onClick={() => setQty(item.slug, item.qty + 1)}
                            className="focus-ring flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:bg-secondary"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          aria-label={`Remove ${item.name} from basket`}
                          onClick={() => remove(item.slug)}
                          className="focus-ring flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border px-5 pt-4" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
              <div className="mb-3 flex items-start gap-2 rounded-md bg-secondary p-3 text-xs leading-relaxed text-secondary-foreground">
                <TreePine className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                <span>
                  This order plants <strong>a tree with our named Kerala partner</strong>. Included in the price, never
                  an add-on. Your tree ID arrives with the confirmation.
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal (incl. GST)</span>
                <span className="font-semibold tabular-nums">{inr(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {subtotal >= freeAbove ? "Free shipping unlocked." : `Free shipping above ${inr(freeAbove)}.`}
              </p>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/checkout");
                }}
                className="focus-ring mt-4 w-full bg-primary py-3.5 text-sm font-semibold tracking-wide text-primary-foreground transition-colors hover:bg-forest-deep"
              >
                Proceed to checkout
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function SiteHeader() {
  const { count, setOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-primary px-4 py-1.5 text-center text-[10px] font-medium uppercase leading-relaxed tracking-[0.14em] text-primary-foreground sm:text-[11px] sm:tracking-[0.18em]">
        <span className="block sm:inline">Rooted in truth · Named makers</span>
        <span className="block sm:inline">
          <span className="hidden sm:inline"> · </span>Plastic-free · A tree in every order
        </span>
      </div>
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <button
            className="focus-ring -ml-2 flex h-11 w-11 items-center justify-center lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="focus-ring shrink-0" aria-label="Edam home">
            <Wordmark />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `focus-ring text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors ${
                    isActive ? "text-clay" : "text-foreground/80 hover:text-foreground"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              className="focus-ring flex h-11 w-11 items-center justify-center text-foreground/80 transition-colors hover:text-foreground"
              aria-label="Search the store"
              onClick={() => navigate("/shop?focus=search")}
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <Link
              to="/account"
              className="focus-ring hidden h-11 w-11 items-center justify-center text-foreground/80 transition-colors hover:text-foreground sm:flex"
              aria-label="Your account"
            >
              <User className="h-5 w-5" strokeWidth={1.75} />
            </Link>
            <button
              className="focus-ring relative flex h-11 w-11 items-center justify-center text-foreground/80 transition-colors hover:text-foreground"
              aria-label={`Open basket, ${count} item${count === 1 ? "" : "s"}`}
              onClick={() => setOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-clay text-[10px] font-bold text-accent-foreground">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-sm gap-0 bg-background p-0 [&>button]:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <Wordmark />
            <button
              className="focus-ring -mr-2 flex h-11 w-11 items-center justify-center"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col px-5 py-2" aria-label="Mobile">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `focus-ring border-b border-border/60 py-3.5 font-display text-[22px] leading-tight ${
                    isActive ? "text-clay" : "text-foreground"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/account"
              onClick={() => setMobileOpen(false)}
              className="focus-ring py-3.5 font-display text-[22px] leading-tight text-foreground"
            >
              Account
            </NavLink>
          </nav>
          <div
            className="mt-2 border-t border-border px-5 pt-4"
            style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Shop by range</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {RANGES.map((r) => (
                <NavLink
                  key={r.key}
                  to={`/shop/${r.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="focus-ring rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground/80 transition-colors hover:border-foreground hover:text-foreground"
                >
                  {r.name}
                </NavLink>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground">
              <NavLink to="/corporate-gifting" onClick={() => setMobileOpen(false)} className="focus-ring py-1 hover:text-foreground">
                Corporate gifting
              </NavLink>
              <NavLink to="/policies" onClick={() => setMobileOpen(false)} className="focus-ring py-1 hover:text-foreground">
                Shipping, returns & contact
              </NavLink>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <CartDrawer />
    </header>
  );
}
