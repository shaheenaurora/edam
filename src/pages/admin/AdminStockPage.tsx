import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { inr } from "@/lib/format";
import { Search, Star } from "lucide-react";

export default function AdminStockPage() {
  const [q, setQ] = useState("");
  const stock = trpc.admin.stock.useQuery({ q: q || undefined });
  const utils = trpc.useUtils();
  const setStock = trpc.admin.setStock.useMutation({ onSuccess: () => utils.admin.stock.invalidate() });
  const setFeatured = trpc.admin.setFeatured.useMutation({ onSuccess: () => utils.admin.stock.invalidate() });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-foreground">Catalogue & stock</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Lowest stock first. Stock at zero shows "Sold out" on the storefront and blocks checkout.
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            className="focus-ring h-11 w-full rounded-md border border-input bg-card pl-10 pr-4 text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Range</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Featured</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(stock.data ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3">
                  {p.name}
                  <span className="block text-xs text-muted-foreground">{p.category}</span>
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">{p.range}</td>
                <td className="px-4 py-3 tabular-nums">{inr(p.price)}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    defaultValue={p.stock}
                    key={`${p.id}-${p.stock}`}
                    onBlur={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!Number.isNaN(v) && v !== p.stock) setStock.mutate({ id: p.id, stock: v });
                    }}
                    className={`focus-ring h-9 w-20 rounded-md border border-input bg-card px-2 text-sm tabular-nums ${
                      p.stock <= 5 ? "border-clay text-clay" : ""
                    }`}
                  />
                </td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
