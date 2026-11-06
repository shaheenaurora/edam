import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { inr } from "@/lib/format";
import { Pencil, Plus, Search, Star, Trash2 } from "lucide-react";

export default function AdminProductsPage() {
  const [q, setQ] = useState("");
  const stock = trpc.admin.stock.useQuery({ q: q || undefined });
  const utils = trpc.useUtils();
  const setFeatured = trpc.admin.setFeatured.useMutation({ onSuccess: () => utils.admin.stock.invalidate() });
  const remove = trpc.admin.deleteProduct.useMutation({ onSuccess: () => utils.admin.stock.invalidate() });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-foreground">Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add, edit or retire catalogue items. Stock at zero shows "Sold out" and blocks checkout.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products"
              className="focus-ring h-11 w-full rounded-md border border-input bg-card pl-10 pr-4 text-sm"
            />
          </div>
          <Link
            to="/admin/products"
            className="focus-ring inline-flex h-11 items-center gap-2 bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-forest-deep"
          >
            <Plus className="h-4 w-4" /> Add product
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Range</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Featured</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(stock.data ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt="" className="h-11 w-11 rounded-md border border-border object-cover" />
                    <div>
                      {p.name}
                      <span className="block text-xs text-muted-foreground">{p.slug}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">{p.range}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{p.category}</td>
                <td className="px-4 py-3 tabular-nums">{inr(p.price)}</td>
                <td className={`px-4 py-3 tabular-nums ${p.stock <= 5 ? "text-clay" : ""}`}>{p.stock}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setFeatured.mutate({ id: p.id, featured: !p.featured })}
                    aria-label={p.featured ? `Remove ${p.name} from featured` : `Feature ${p.name}`}
                    className={`focus-ring flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
                      p.featured ? "border-sand bg-sand/15 text-sand" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Star className="h-4 w-4" fill={p.featured ? "currentColor" : "none"} />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex">
                    <Link
                      to={`/admin/products/${p.id}`}
                      aria-label={`Edit ${p.name}`}
                      className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) remove.mutate({ id: p.id });
                      }}
                      aria-label={`Delete ${p.name}`}
                      className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(stock.data ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No products match. Add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
