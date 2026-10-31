import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { LayoutDashboard, Package, Users, Mail, TreePine, Boxes, ArrowLeft, TicketPercent, Plug2, Settings2 } from "lucide-react";

const ADMIN_NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: Package, end: false },
  { to: "/admin/customers", label: "Customers", icon: Users, end: false },
  { to: "/admin/trees", label: "Trees", icon: TreePine, end: false },
  { to: "/admin/stock", label: "Catalogue & stock", icon: Boxes, end: false },
  { to: "/admin/discounts", label: "Discounts", icon: TicketPercent, end: false },
  { to: "/admin/integrations", label: "Integrations", icon: Plug2, end: false },
  { to: "/admin/settings", label: "Settings", icon: Settings2, end: false },
  { to: "/admin/subscribers", label: "Field Notes", icon: Mail, end: false },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const me = trpc.auth.me.useQuery(undefined, { retry: false });

  if (me.isLoading) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center text-sm text-muted-foreground">Checking your access…</div>
    );
  }

  const user = me.data;
  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-foreground">Admin area</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sign in with the owner account to manage orders, customers, trees and stock. Customer accounts never see
          this page.
        </p>
        <Link
          to="/account"
          className="focus-ring bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-forest-deep"
        >
          Go to sign-in
        </Link>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-foreground">Not your door</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This area is for the Edam team. Your account ({user.email ?? user.name ?? "signed in"}) is a customer
          account. Your orders and trees live under Account.
        </p>
        <button
          onClick={() => navigate("/account")}
          className="focus-ring border border-foreground px-6 py-3 text-sm font-semibold text-foreground hover:bg-foreground hover:text-background"
        >
          Back to my account
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Edam HQ</p>
          <h1 className="mt-1 font-display text-3xl text-foreground">Store management</h1>
        </div>
        <Link
          to="/"
          className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to storefront
        </Link>
      </div>

      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-border" aria-label="Admin">
        {ADMIN_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `focus-ring flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <item.icon className="h-4 w-4" strokeWidth={1.75} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="py-8">
        <Outlet />
      </div>
    </div>
  );
}
