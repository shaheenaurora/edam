import { Link } from "react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Reveal } from "@/components/Reveal";

export default function MakersPage() {
  const makers = trpc.makers.list.useQuery(undefined, { staleTime: 60_000 });

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <Reveal>
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Provenance</p>
          <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
            Behind every Edam product is a person you can name. Here they are.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Edam has no estate and no factory. Everything is sourced — which means the whole credibility of the brand
            rests on these relationships being real, and verifiable. So we publish them.
          </p>
        </div>
      </Reveal>

      {makers.isLoading ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-md bg-secondary" />
          ))}
        </div>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {(makers.data ?? []).map((m, i) => (
            <Reveal key={m.slug} delay={(i % 3) * 80}>
              <Link to={`/makers/${m.slug}`} className="focus-ring group block">
                <div className="overflow-hidden rounded-md">
                  <img
                    src={m.image}
                    alt={m.name}
                    loading="lazy"
                    className="img-fade aspect-[4/3] w-full object-cover group-hover:scale-[1.04]"
                  />
                </div>
                <div className="pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-clay">{m.kind}</p>
                  <h2 className="mt-1 font-display text-2xl text-foreground transition-colors group-hover:text-primary">{m.name}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {m.place}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{m.summary}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary group-hover:text-clay">
                    Their story <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
