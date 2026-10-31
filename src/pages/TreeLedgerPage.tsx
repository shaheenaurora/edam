import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowRight, MapPin, Search, TreePine } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Reveal } from "@/components/Reveal";
import { TreeCounter } from "@/components/TreeCounter";

export default function TreeLedgerPage() {
  const [params] = useSearchParams();
  const stats = trpc.trees.stats.useQuery(undefined, { staleTime: 60_000 });
  const batches = trpc.trees.batches.useQuery(undefined, { staleTime: 60_000 });
  const [q, setQ] = useState(params.get("find") ?? "");
  const [submitted, setSubmitted] = useState(params.get("find") ?? "");
  const find = trpc.trees.find.useQuery({ q: submitted }, { enabled: submitted.length >= 3 });

  useEffect(() => {
    const initial = params.get("find");
    if (initial) {
      setQ(initial);
      setSubmitted(initial);
    }
  }, [params]);

  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img src="/images/tree-planting.png" alt="Hands planting a native sapling in Kerala soil" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-forest-deep/70" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B38A56]">The Tree Ledger</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight text-cream sm:text-5xl">
            Everyone says they plant trees. We'll show you ours — where, which, and whether they lived.
          </h1>
          <div className="mt-10">
            <TreeCounter dark />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
          {[
            { n: "01", t: "Included, never added on", d: "Every stay and every order plants a tree — inside the price. The moment it becomes a checkbox, it becomes a donation, and the mechanic collapses. So it isn't one." },
            { n: "02", t: "A named partner, a named site", d: "We plant with the Nilambur Vanam Trust and the Chalakudy River Guardians, at sites you can find on a map. No third-party offset platform, no anonymous fund." },
            { n: "03", t: "Survival, published", d: "Twelve months after each planting we count what lived and publish the number — including when it disappoints. The March batch at Nilambur: 87%." },
          ].map((s) => (
            <Reveal key={s.n}>
              <div>
                <span className="font-display text-sm text-clay">{s.n}</span>
                <h2 className="mt-2 font-display text-xl text-foreground">{s.t}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Find your tree */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Reveal>
            <h2 className="font-display text-3xl text-foreground">Find your tree</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Enter the tree ID from your certificate (e.g. TR-000123) or your order number (e.g. EDM-2026-0001).
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (q.trim().length >= 3) setSubmitted(q.trim());
              }}
              className="mt-6 flex max-w-lg gap-3"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="TR-000123 or EDM-2026-0001"
                  className="focus-ring h-12 w-full rounded-md border border-input bg-card pl-10 pr-4 text-sm"
                  aria-label="Tree ID or order number"
                />
              </div>
              <button type="submit" className="focus-ring h-12 bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-forest-deep">
                Look up
              </button>
            </form>

            {submitted && find.data === null && !find.isLoading && (
              <p className="mt-4 text-sm text-muted-foreground">
                Nothing found for “{submitted}”. Check the ID — or <Link to="/policies#contact" className="focus-ring font-semibold text-primary underline underline-offset-2">write to us</Link> and we'll find it together.
              </p>
            )}
            {find.data && "tree" in find.data && find.data.tree && (
              <div className="mt-6 max-w-lg rounded-md border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <TreePine className="h-6 w-6 text-primary" strokeWidth={1.5} />
                  <span className="font-mono font-semibold text-primary">{find.data.tree.treeNo}</span>
                </div>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Species</dt><dd>{find.data.tree.species}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd className="capitalize">{find.data.tree.status}</dd></div>
                  {find.data.tree.recipientName && <div className="flex justify-between"><dt className="text-muted-foreground">In the name of</dt><dd>{find.data.tree.recipientName}</dd></div>}
                  {find.data.batch && (
                    <>
                      <div className="flex justify-between"><dt className="text-muted-foreground">Site</dt><dd className="text-right">{find.data.batch.site}</dd></div>
                      <div className="flex justify-between"><dt className="text-muted-foreground">Partner</dt><dd>{find.data.batch.partner}</dd></div>
                      <div className="flex justify-between"><dt className="text-muted-foreground">Batch</dt><dd className="font-mono text-xs">{find.data.batch.code}</dd></div>
                    </>
                  )}
                </dl>
              </div>
            )}
            {find.data && "order" in find.data && find.data.order && (
              <div className="mt-6 max-w-lg rounded-md border border-border bg-card p-5">
                <p className="text-sm font-semibold">Order {find.data.order.orderNo} — {find.data.trees.length} tree{find.data.trees.length === 1 ? "" : "s"}</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {find.data.trees.map(({ tree, batch }) => (
                    <li key={tree.treeNo} className="rounded border border-border bg-background px-4 py-3">
                      <span className="font-mono font-semibold text-primary">{tree.treeNo}</span> · {tree.species} ·{" "}
                      <span className="capitalize">{tree.status}</span>
                      {batch && <span className="block text-xs text-muted-foreground">{batch.site}, {batch.district}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* Batches */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl text-foreground">Sites &amp; batches</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Every batch is a real planting at a real place. The count is never rounded up.
              </p>
            </div>
            {stats.data && (
              <div className="flex gap-8 text-sm">
                <div>
                  <span className="block font-display text-2xl tabular-nums text-foreground">{stats.data.treesPlanted.toLocaleString("en-IN")}</span>
                  <span className="text-muted-foreground">planted</span>
                </div>
                <div>
                  <span className="block font-display text-2xl tabular-nums text-foreground">{stats.data.pledged.toLocaleString("en-IN")}</span>
                  <span className="text-muted-foreground">pledged, awaiting the window</span>
                </div>
                {stats.data.survivalRate !== null && (
                  <div>
                    <span className="block font-display text-2xl tabular-nums text-foreground">{stats.data.survivalRate}%</span>
                    <span className="text-muted-foreground">12-month survival (measured)</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Reveal>

        <div className="mt-10 space-y-6">
          {(batches.data ?? []).map((b) => (
            <Reveal key={b.code}>
              <article className="grid gap-6 rounded-md border border-border bg-card p-6 sm:p-8 md:grid-cols-[240px_1fr]">
                {b.image && <img src={b.image} alt={b.site} loading="lazy" className="aspect-[4/3] w-full rounded-md object-cover" />}
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-clay">{b.code}</span>
                    <span className={`px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${b.status === "open" ? "bg-clay/15 text-clay" : "bg-primary/10 text-primary"}`}>
                      {b.status === "open" ? "Open — collecting pledges" : "Planted"}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-2xl text-foreground">{b.site}</h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {b.district}</span>
                    <span>with {b.partner}</span>
                  </p>
                  <dl className="mt-4 grid max-w-md grid-cols-3 gap-4 text-sm">
                    <div><dt className="text-xs text-muted-foreground">Species</dt><dd className="mt-0.5">{b.species}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">{b.status === "open" ? "Window" : "Planted"}</dt><dd className="mt-0.5">{b.plantedOn}</dd></div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Trees</dt>
                      <dd className="mt-0.5 tabular-nums">
                        {b.plantedCount.toLocaleString("en-IN")}
                        {b.alive12m !== null && <span className="block text-xs text-muted-foreground">{b.alive12m} alive at 12 months</span>}
                      </dd>
                    </div>
                  </dl>
                  {b.note && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80">{b.note}</p>}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-14 rounded-md bg-forest-deep p-8 text-center sm:p-12">
            <h2 className="font-display text-3xl text-cream">Plant your first tree</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-cream/75">
              It happens automatically with any order — or plant one deliberately, in someone's name.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/shop" className="focus-ring inline-flex h-12 items-center justify-center bg-cream px-8 text-sm font-semibold text-foreground hover:bg-white">
                Shop the store <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link to="/product/a-tree-in-their-name" className="focus-ring inline-flex h-12 items-center justify-center border border-cream/50 px-8 text-sm font-semibold text-cream hover:bg-cream/10">
                Gift a tree
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
