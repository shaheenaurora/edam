import { Link } from "react-router";
import { Clock } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Reveal } from "@/components/Reveal";

export default function JournalPage() {
  const posts = trpc.journal.list.useQuery(undefined, { staleTime: 60_000 });
  const [first, ...rest] = posts.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <Reveal>
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Journal &amp; grow guides</p>
          <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">Useful things, honestly told.</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Grow guides written for Indian weather, label-reading literacy, and dispatches from the makers. Content
            that earns the inbox, not fills it.
          </p>
        </div>
      </Reveal>

      {posts.isLoading ? (
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-md bg-secondary" />
          ))}
        </div>
      ) : (
        <>
          {first && (
            <Reveal>
              <Link to={`/journal/${first.slug}`} className="focus-ring group mt-12 grid gap-6 lg:grid-cols-2">
                <div className="overflow-hidden rounded-md">
                  <img src={first.image} alt="" className="img-fade aspect-[16/10] w-full object-cover group-hover:scale-[1.03]" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{first.tag}</p>
                  <h2 className="mt-2 font-display text-3xl leading-tight text-foreground transition-colors group-hover:text-primary">
                    {first.title}
                  </h2>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">{first.excerpt}</p>
                  <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {first.readingMinutes} min · {first.publishedOn}
                  </p>
                </div>
              </Link>
            </Reveal>
          )}
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 60}>
                <Link to={`/journal/${p.slug}`} className="focus-ring group block">
                  <div className="overflow-hidden rounded-md">
                    <img src={p.image} alt="" loading="lazy" className="img-fade aspect-[16/10] w-full object-cover group-hover:scale-[1.03]" />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-clay">{p.tag}</p>
                  <h3 className="mt-1.5 font-display text-xl leading-snug text-foreground transition-colors group-hover:text-primary">{p.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {p.readingMinutes} min · {p.publishedOn}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
