import { Link } from "react-router";
import { Leaf, TreePine } from "lucide-react";
import type { Product } from "@contracts/types";
import { inr } from "@/lib/format";
import { useCart } from "@/context/CartContext";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const out = product.stock <= 0;

  return (
    <article className="group flex flex-col">
      <Link
        to={`/product/${product.slug}`}
        className="focus-ring relative block aspect-square overflow-hidden rounded-md bg-secondary"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="img-fade h-full w-full object-cover group-hover:scale-[1.04]"
        />
        {product.livePlant && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 bg-background/95 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-primary">
            <Leaf className="h-3 w-3" /> Live plant
          </span>
        )}
        {out && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm font-semibold text-foreground">
            Currently out of stock
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col pt-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-clay">{product.category}</span>
        <Link to={`/product/${product.slug}`} className="focus-ring mt-1">
          <h3 className="font-display text-lg leading-snug text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{product.shortLine}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Made by <span className="font-semibold text-foreground/80">{product.makerName}</span>
        </p>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="whitespace-nowrap text-base font-semibold tabular-nums">{inr(product.price)}</span>
          <span className="truncate text-xs text-muted-foreground">· {product.unit}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() =>
              add({
                slug: product.slug,
                name: product.name,
                price: product.price,
                unit: product.unit,
                image: product.image,
                range: product.range,
              })
            }
            disabled={out}
            className="focus-ring h-11 flex-1 whitespace-nowrap border border-foreground text-[11px] font-semibold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-40 sm:text-[13px] sm:tracking-[0.08em]"
          >
            {out ? "Out of stock" : "Add to basket"}
          </button>
          <span className="flex h-11 w-11 items-center justify-center text-primary" title="Every order plants a tree">
            <TreePine className="h-5 w-5" strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </article>
  );
}
