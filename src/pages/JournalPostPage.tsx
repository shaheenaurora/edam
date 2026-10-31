import { Link, useParams } from "react-router";
import { ArrowLeft, Clock } from "lucide-react";
import { trpc } from "@/providers/trpc";
import NotFound from "./NotFound";

export default function JournalPostPage() {
  const { slug = "" } = useParams();
  const { data: post, isLoading } = trpc.journal.bySlug.useQuery({ slug }, { staleTime: 60_000 });
  const more = trpc.journal.list.useQuery(undefined, { staleTime: 60_000 });

  if (isLoading) return <div className="mx-auto max-w-2xl px-4 py-20"><div className="h-64 animate-pulse rounded-md bg-secondary" /></div>;
  if (!post) return <NotFound />;

  const others = (more.data ?? []).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link to="/journal" className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Journal
      </Link>
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-clay">{post.tag}</p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-foreground">{post.title}</h1>
      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" /> {post.readingMinutes} min read · {post.publishedOn}
      </p>
      <img src={post.image} alt="" className="mt-8 w-full rounded-md object-cover" />
      <div className="mt-10 space-y-5 text-[16px] leading-relaxed text-foreground/90">
        {post.body.split("\n\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {others.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="font-display text-2xl text-foreground">Keep reading</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-3">
            {others.map((p) => (
              <Link key={p.slug} to={`/journal/${p.slug}`} className="focus-ring group">
                <img src={p.image} alt="" loading="lazy" className="aspect-[16/10] w-full rounded-md object-cover" />
                <h3 className="mt-3 font-display text-lg leading-snug text-foreground group-hover:text-primary">{p.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
