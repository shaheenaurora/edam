import { Link, NavLink, useNavigate } from "react-router";
import { Menu, Search, ShoppingBag, User, X, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { inr } from "@/lib/format";
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

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-primary" />
        <path
          d="M16 25c0-6 0-9 0-12m0 0c0-4 3-7 7-7 0 4-3 7-7 7Zm0 3c0-3.4-2.6-6-6.5-6 0 3.8 2.6 6 6.5 6Z"
          fill="none"
          stroke="#faf7ef"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-display text-2xl tracking-wide text-foreground">Edam</span>
    </span>
  );
}

export function CartDrawer() {
  const { items, subtotal, open, setOpen, setQty, remove } = useCart();
  const navigate = useNavigate();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col bg-background sm:max-w-md">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="font-display text-xl">Your basket</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" strokeWidth={1.25} />
            <p className="max-w-[26ch] text-sm text-muted-foreground">
              Nothing here yet. Every order plants a tree — when you're ready.
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
            <div className="flex-1 overflow-y-auto py-4">
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
                            className="focus-ring flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:bg-secondary"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums">{item.qty}</span>
                          <button
                            aria-label={`Increase quantity of ${item.name}`}
                            onClick={() => setQty(item.slug, item.qty + 1)}
                            className="focus-ring flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:bg-secondary"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          aria-label={`Remove ${item.name} from basket`}
                          onClick={() => remove(item.slug)}
                          className="focus-ring flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border pt-4">
              <div className="mb-3 flex items-start gap-2 rounded-md bg-secondary p-3 text-xs leading-relaxed text-secondary-foreground">
                <TreePine className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                <span>
                  This order plants <strong>a tree with our named Kerala partner</strong> — included in the price, never an
                  add-on. Your tree ID arrives with the confirmation.
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal (incl. GST)</span>
                <span className="font-semibold tabular-nums">{inr(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {subtotal >= 1499 ? "Free shipping unlocked." : `Free shipping above ${inr(1499)}.`}
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
      <div className="bg-primary py-1.5 text-center text-[11px] font-medium tracking-[0.18em] text-primary-foreground uppercase">
        Rooted in truth · Named makers · Plastic-free · A tree in every order
      </div>
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <button
            className="focus-ring -ml-2 flex h-11 w-11 items-center justify-center lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="focus-ring shrink-0" aria-label="Edam — home">
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
        <SheetContent side="left" className="w-[85vw] max-w-sm bg-background p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-between border-b border-border p-4">
            <Wordmark />
            <button
              className="focus-ring flex h-11 w-11 items-center justify-center"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col p-4" aria-label="Mobile">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `focus-ring border-b border-border/60 py-4 font-display text-2xl ${
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
              className="focus-ring py-4 font-display text-2xl text-foreground"
            >
              Account
            </NavLink>
          </nav>
        </SheetContent>
      </Sheet>

      <CartDrawer />
    </header>
  );
}
