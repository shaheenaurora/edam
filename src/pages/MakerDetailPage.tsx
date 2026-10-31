import { Link, useParams } from "react-router";
import { ArrowLeft, MapPin } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import NotFound from "./NotFound";

export default function MakerDetailPage() {
  const { slug = "" } = useParams();
  const { data: maker, isLoading } = trpc.makers.bySlug.useQuery({ slug }, { staleTime: 60_000 });
  const products = trpc.catalogue.byMaker.useQuery({ makerId: maker?.id ?? 0 }, { enabled: !!maker, staleTime: 60_000 });

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-20"><div className="h-64 animate-pulse rounded-md bg-secondary" /></div>;
  }
  if (!maker) return <NotFound />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link to="/makers" className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All makers
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
        <Reveal>
          <img src={maker.image} alt={maker.name} className="w-full rounded-md object-cover" />
        </Reveal>
        <Reveal delay={100}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">{maker.kind}</p>
            <h1 className="mt-2 font-display text-4xl leading-tight text-foreground sm:text-5xl">{maker.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {maker.place}
            </p>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-foreground/85">
              {maker.story.split("\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {products.data && products.data.length > 0 && (
        <section className="mt-16 border-t border-border pt-12">
          <h2 className="font-display text-3xl text-foreground">What {maker.name} makes for Edam</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {products.data.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
