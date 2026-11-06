import { useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { ArrowDown, ArrowUp, Copy, Download, Pencil, Plus, Search, Star, Trash2, Upload } from "lucide-react";

type Range = "NOURISH" | "CARE" | "DWELL" | "GROW" | "GIVE";
type StockRow = {
  id: number;
  slug: string;
  name: string;
  range: Range;
  category: string;
  price: number;
  unit: string;
  shortLine: string;
  description: string;
  usage: string | null;
  image: string;
  makerId: number;
  makerName: string;
  giftReady: boolean;
  livePlant: boolean;
  featured: boolean;
  hero: boolean;
  stock: number;
};
type ProductInput = Omit<StockRow, "id">;

const RANGES = ["NOURISH", "CARE", "DWELL", "GROW", "GIVE"] as const;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* ---------------- inline cells ---------------- */

function TextCell({
  value,
  onCommit,
  mono = false,
  placeholder = "—",
}: {
  value: string;
  onCommit: (v: string) => void;
  mono?: boolean;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        title="Click to edit"
        className={`focus-ring block min-h-9 w-full rounded px-2 py-1.5 text-left hover:bg-secondary/60 ${
          value ? "" : "text-muted-foreground"
        } ${mono ? "font-mono text-xs" : ""}`}
      >
        {value || placeholder}
      </button>
    );
  }
  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setEditing(false);
        if (draft !== value) onCommit(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      className={`focus-ring h-9 w-full rounded border border-input bg-background px-2 text-sm ${mono ? "font-mono" : ""}`}
    />
  );
}

function NumberCell({ value, onCommit, warn = false }: { value: number; onCommit: (v: number) => void; warn?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(String(value));
          setEditing(true);
        }}
        title="Click to edit"
        className={`focus-ring block min-h-9 w-full rounded px-2 py-1.5 text-left tabular-nums hover:bg-secondary/60 ${
          warn ? "text-clay" : ""
        }`}
      >
        {value}
      </button>
    );
  }
  return (
    <input
      autoFocus
      type="number"
      min={0}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setEditing(false);
        const v = parseInt(draft, 10);
        if (!Number.isNaN(v) && v >= 0 && v !== value) onCommit(v);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") {
          setDraft(String(value));
          setEditing(false);
        }
      }}
      className="focus-ring h-9 w-full rounded border border-input bg-background px-2 text-sm tabular-nums"
    />
  );
}

function SelectCell<T extends string>({
  value,
  options,
  onCommit,
  labels,
}: {
  value: T;
  options: readonly T[];
  onCommit: (v: T) => void;
  labels?: Record<string, string>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onCommit(e.target.value as T)}
      title="Click to change"
      className="focus-ring h-9 w-full cursor-pointer rounded border border-transparent bg-transparent px-2 text-sm hover:border-input"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {labels?.[o] ?? o}
        </option>
      ))}
    </select>
  );
}

function FlagChip({ label, on, title, onToggle }: { label: string; on: boolean; title: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={title}
      className={`focus-ring h-7 min-w-7 rounded px-1.5 text-[11px] font-bold ${
        on ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

/* ---------------- csv ---------------- */

const CSV_HEADER = [
  "id",
  "slug",
  "name",
  "range",
  "category",
  "price",
  "unit",
  "shortLine",
  "description",
  "usage",
  "image",
  "makerId",
  "makerName",
  "giftReady",
  "livePlant",
  "featured",
  "hero",
  "stock",
];

const parseCsv = (text: string): Record<string, string>[] => {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
};

const toBool = (v: string | undefined) => ["true", "1", "yes"].includes((v ?? "").trim().toLowerCase());

const csvToInput = (r: Record<string, string>): ProductInput | null => {
  const slug = slugify(r.slug ?? "");
  const name = (r.name ?? "").trim();
  const category = (r.category ?? "").trim();
  const unit = (r.unit ?? "").trim();
  const shortLine = (r.shortline ?? "").trim();
  const description = (r.description ?? "").trim();
  const image = (r.image ?? "").trim();
  const makerId = parseInt(r.makerid ?? "", 10);
  const makerName = (r.makername ?? "").trim();
  const range = (r.range ?? "").toUpperCase();
  if (!slug || !name || !category || !unit || !shortLine || !description || !image || !Number.isInteger(makerId) || !makerName) return null;
  if (!RANGES.includes(range as Range)) return null;
  return {
    slug,
    name,
    range: range as Range,
    category,
    price: Math.max(0, parseInt(r.price ?? "0", 10) || 0),
    unit,
    shortLine,
    description,
    usage: (r.usage ?? "").trim() || null,
    image,
    makerId,
    makerName,
    giftReady: toBool(r.giftready),
    livePlant: toBool(r.liveplant),
    featured: toBool(r.featured),
    hero: toBool(r.hero),
    stock: Math.max(0, parseInt(r.stock ?? "0", 10) || 0),
  };
};

/* ---------------- page ---------------- */

type SortKey = "name" | "range" | "category" | "makerName" | "price" | "stock";

export default function AdminProductsPage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "name", dir: 1 });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ name: string; price: string; stock: string; makerId: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const stock = trpc.admin.stock.useQuery({ q: q || undefined });
  const makers = trpc.admin.makersForSelect.useQuery();
  const utils = trpc.useUtils();
  const invalidate = () => utils.admin.stock.invalidate();
  const update = trpc.admin.updateProduct.useMutation({ onSuccess: invalidate, onError: (e) => setError(e.message) });
  const remove = trpc.admin.deleteProduct.useMutation({ onSuccess: invalidate, onError: (e) => setError(e.message) });
  const create = trpc.admin.createProduct.useMutation({
    onSuccess: () => {
      invalidate();
      setDraft(null);
      setError(null);
    },
    onError: (e) => setError(e.message),
  });
  const dup = trpc.admin.duplicateProduct.useMutation({
    onSuccess: () => {
      invalidate();
      setNotice("Product duplicated — find the “(copy)” row and edit it.");
    },
    onError: (e) => setError(e.message),
  });
  const bulk = trpc.admin.bulkUpsertProducts.useMutation({
    onSuccess: (r) =>
      setNotice(`Import done: ${r.created} created, ${r.updated} updated${r.errors.length ? `, ${r.errors.length} failed (${r.errors.map((e) => `row ${e.row}`).join(", ")})` : ""}.`),
    onError: (e) => setError(e.message),
  });

  const rows = useMemo(() => {
    const data = stock.data ?? [];
    return [...data].sort((a, b) => {
      const va = a[sort.key];
      const vb = b[sort.key];
      const cmp = typeof va === "string" ? va.localeCompare(String(vb)) : Number(va) - Number(vb);
      return cmp * sort.dir;
    });
  }, [stock.data, sort]);

  const toPayload = (r: StockRow): ProductInput => ({
    slug: r.slug,
    name: r.name,
    range: r.range,
    category: r.category,
    price: r.price,
    unit: r.unit,
    shortLine: r.shortLine,
    description: r.description,
    usage: r.usage,
    image: r.image,
    makerId: r.makerId,
    makerName: r.makerName,
    giftReady: r.giftReady,
    livePlant: r.livePlant,
    featured: r.featured,
    hero: r.hero,
    stock: r.stock,
  });

  const patch = (r: StockRow, changes: Partial<ProductInput>) => update.mutate({ id: r.id, ...toPayload(r), ...changes });

  const saveDraft = () => {
    if (!draft) return;
    const maker = makers.data?.find((m) => String(m.id) === draft.makerId) ?? makers.data?.[0];
    if (!maker) {
      setError("No makers yet. Seed the database first.");
      return;
    }
    const name = draft.name.trim();
    if (!name) return;
    create.mutate({
      slug: slugify(name) || `product-${Date.now()}`,
      name,
      range: "NOURISH",
      category: "Uncategorized",
      price: Math.max(0, parseInt(draft.price, 10) || 0),
      unit: "1 pc",
      shortLine: name,
      description: "Add the full description via the row’s edit (pencil) icon.",
      usage: null,
      image: "/images/product-tea.jpg",
      makerId: maker.id,
      makerName: maker.name,
      giftReady: false,
      livePlant: false,
      featured: false,
      hero: false,
      stock: Math.max(0, parseInt(draft.stock, 10) || 0),
    });
  };

  const exportCsv = () => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [CSV_HEADER.join(",")];
    for (const r of stock.data ?? []) {
      lines.push(CSV_HEADER.map((h) => esc(r[h as keyof StockRow])).join(","));
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    a.download = "edam-products.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importFile = async (file: File) => {
    setError(null);
    setNotice(null);
    const records = parseCsv(await file.text());
    if (records.length === 0) {
      setError("That file has no data rows.");
      return;
    }
    const rowsToSend: ProductInput[] = [];
    const skipped: number[] = [];
    records.forEach((r, i) => {
      const row = csvToInput(r);
      if (row) rowsToSend.push(row);
      else skipped.push(i + 2);
    });
    if (rowsToSend.length === 0) {
      setError("No valid rows. Export first and use that file as the template.");
      return;
    }
    bulk.mutate({ rows: rowsToSend });
    if (skipped.length) setNotice(`Skipped rows (missing required fields): ${skipped.join(", ")}`);
  };

  const sortHeader = (key: SortKey, label: string) => (
    <button
      type="button"
      onClick={() => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }))}
      className="focus-ring inline-flex items-center gap-1 uppercase"
    >
      {label}
      {sort.key === key && (sort.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
    </button>
  );

  const draftInput = "focus-ring h-9 w-full rounded border border-input bg-background px-2 text-sm";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-foreground">Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Click any cell to edit it. F = featured, H = range hero, G = gift-ready, L = live plant.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-52">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products"
              className="focus-ring h-11 w-full rounded-md border border-input bg-card pl-10 pr-4 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="focus-ring inline-flex h-11 items-center gap-2 border border-border bg-card px-4 text-sm font-semibold hover:bg-secondary/60"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={bulk.isPending}
            className="focus-ring inline-flex h-11 items-center gap-2 border border-border bg-card px-4 text-sm font-semibold hover:bg-secondary/60 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" /> Import CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importFile(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => setDraft({ name: "", price: "0", stock: "50", makerId: String(makers.data?.[0]?.id ?? "") })}
            className="focus-ring inline-flex h-11 items-center gap-2 bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-forest-deep"
          >
            <Plus className="h-4 w-4" /> Quick add
          </button>
        </div>
      </div>

      {error && <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}
      {notice && <p className="rounded-md border border-border bg-card px-4 py-2 text-sm text-muted-foreground">{notice}</p>}

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[1500px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs tracking-[0.12em] text-muted-foreground">
              <th className="px-3 py-3 font-semibold" />
              <th className="px-2 py-3 font-semibold">{sortHeader("name", "Product")}</th>
              <th className="px-2 py-3 font-semibold">Short line</th>
              <th className="px-2 py-3 font-semibold">Slug</th>
              <th className="px-2 py-3 font-semibold">{sortHeader("range", "Range")}</th>
              <th className="px-2 py-3 font-semibold">{sortHeader("category", "Category")}</th>
              <th className="px-2 py-3 font-semibold">{sortHeader("makerName", "Maker")}</th>
              <th className="px-2 py-3 font-semibold">{sortHeader("price", "Price ₹")}</th>
              <th className="px-2 py-3 font-semibold">Unit</th>
              <th className="px-2 py-3 font-semibold">{sortHeader("stock", "Stock")}</th>
              <th className="px-2 py-3 text-center font-semibold">F</th>
              <th className="px-2 py-3 text-center font-semibold">H</th>
              <th className="px-2 py-3 text-center font-semibold">G</th>
              <th className="px-2 py-3 text-center font-semibold">L</th>
              <th className="px-2 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {draft && (
              <tr className="bg-secondary/30">
                <td className="px-3 py-2 text-xs text-muted-foreground">new</td>
                <td className="px-2 py-2">
                  <input
                    autoFocus
                    placeholder="Name"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && saveDraft()}
                    className={draftInput}
                  />
                </td>
                <td className="px-2 py-2 text-xs text-muted-foreground" colSpan={4}>
                  Slug, category and the rest are editable inline after creation.
                </td>
                <td className="px-2 py-2">
                  <select value={draft.makerId} onChange={(e) => setDraft({ ...draft, makerId: e.target.value })} className={draftInput}>
                    {(makers.data ?? []).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    min={0}
                    placeholder="₹"
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                    className={draftInput}
                  />
                </td>
                <td className="px-2 py-2 text-xs text-muted-foreground">1 pc</td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    min={0}
                    value={draft.stock}
                    onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
                    className={draftInput}
                  />
                </td>
                <td className="px-2 py-2 text-center" colSpan={4}>
                  <button type="button" onClick={saveDraft} disabled={create.isPending} className="focus-ring h-9 rounded bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-50">
                    Save
                  </button>{" "}
                  <button type="button" onClick={() => setDraft(null)} className="focus-ring h-9 rounded border border-border px-3 text-xs">
                    Cancel
                  </button>
                </td>
                <td />
              </tr>
            )}

            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/40">
                <td className="px-3 py-2">
                  <img src={p.image} alt="" className="h-10 w-10 rounded border border-border object-cover" />
                </td>
                <td className="min-w-[180px] px-2 py-1">
                  <TextCell value={p.name} onCommit={(v) => v.trim() && patch(p, { name: v.trim() })} />
                </td>
                <td className="min-w-[200px] px-2 py-1">
                  <TextCell value={p.shortLine} onCommit={(v) => patch(p, { shortLine: v.trim() || p.shortLine })} />
                </td>
                <td className="min-w-[160px] px-2 py-1">
                  <TextCell
                    value={p.slug}
                    mono
                    onCommit={(v) => {
                      const s = slugify(v);
                      if (s) patch(p, { slug: s });
                    }}
                  />
                </td>
                <td className="w-[130px] px-2 py-1">
                  <SelectCell value={p.range} options={RANGES} onCommit={(v) => patch(p, { range: v })} />
                </td>
                <td className="min-w-[150px] px-2 py-1">
                  <TextCell value={p.category} onCommit={(v) => v.trim() && patch(p, { category: v.trim() })} />
                </td>
                <td className="min-w-[170px] px-2 py-1">
                  <SelectCell
                    value={String(p.makerId)}
                    options={(makers.data ?? []).map((m) => String(m.id))}
                    labels={Object.fromEntries((makers.data ?? []).map((m) => [String(m.id), m.name]))}
                    onCommit={(v) => {
                      const m = makers.data?.find((x) => String(x.id) === v);
                      if (m) patch(p, { makerId: m.id, makerName: m.name });
                    }}
                  />
                </td>
                <td className="w-[100px] px-2 py-1">
                  <NumberCell value={p.price} onCommit={(v) => patch(p, { price: v })} />
                </td>
                <td className="min-w-[110px] px-2 py-1">
                  <TextCell value={p.unit} onCommit={(v) => v.trim() && patch(p, { unit: v.trim() })} />
                </td>
                <td className="w-[90px] px-2 py-1">
                  <NumberCell value={p.stock} warn={p.stock <= 5} onCommit={(v) => patch(p, { stock: v })} />
                </td>
                <td className="px-2 py-1 text-center">
                  <button
                    type="button"
                    onClick={() => patch(p, { featured: !p.featured })}
                    aria-label={p.featured ? `Unfeature ${p.name}` : `Feature ${p.name}`}
                    title="Featured"
                    className={`focus-ring inline-flex h-7 w-7 items-center justify-center rounded ${
                      p.featured ? "text-sand" : "text-muted-foreground/40 hover:text-muted-foreground"
                    }`}
                  >
                    <Star className="h-4 w-4" fill={p.featured ? "currentColor" : "none"} />
                  </button>
                </td>
                <td className="px-2 py-1 text-center">
                  <FlagChip label="H" on={p.hero} title="Range hero" onToggle={() => patch(p, { hero: !p.hero })} />
                </td>
                <td className="px-2 py-1 text-center">
                  <FlagChip label="G" on={p.giftReady} title="Gift-ready" onToggle={() => patch(p, { giftReady: !p.giftReady })} />
                </td>
                <td className="px-2 py-1 text-center">
                  <FlagChip label="L" on={p.livePlant} title="Live plant" onToggle={() => patch(p, { livePlant: !p.livePlant })} />
                </td>
                <td className="px-2 py-1 text-right">
                  <div className="inline-flex">
                    <button
                      type="button"
                      onClick={() => dup.mutate({ id: p.id })}
                      aria-label={`Duplicate ${p.name}`}
                      title="Duplicate product"
                      className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <Link
                      to={`/admin/products/${p.id}`}
                      aria-label={`Full edit ${p.name}`}
                      title="Full edit (description, usage, image)"
                      className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) remove.mutate({ id: p.id });
                      }}
                      aria-label={`Delete ${p.name}`}
                      className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && !draft && (
              <tr>
                <td colSpan={15} className="px-4 py-8 text-center text-muted-foreground">
                  No products match. Quick-add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
