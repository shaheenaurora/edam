import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { ArrowLeft } from "lucide-react";

const RANGES = ["NOURISH", "CARE", "DWELL", "GROW", "GIVE"] as const;
type Range = (typeof RANGES)[number];

const input = "focus-ring h-11 rounded-md border border-input bg-card px-3 text-sm";
const textarea = "focus-ring min-h-28 w-full rounded-md border border-input bg-card px-3 py-2 text-sm";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const productId = Number(id);
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const existing = trpc.admin.product.useQuery({ id: productId }, { enabled: !isNew && Number.isInteger(productId) });
  const makers = trpc.admin.makersForSelect.useQuery();
  const create = trpc.admin.createProduct.useMutation({
    onSuccess: () => {
      utils.admin.stock.invalidate();
      navigate("/admin/products");
    },
  });
  const update = trpc.admin.updateProduct.useMutation({
    onSuccess: () => {
      utils.admin.stock.invalidate();
      navigate("/admin/products");
    },
  });

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [range, setRange] = useState<Range>("NOURISH");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("0");
  const [unit, setUnit] = useState("");
  const [shortLine, setShortLine] = useState("");
  const [description, setDescription] = useState("");
  const [usage, setUsage] = useState("");
  const [image, setImage] = useState("/images/");
  const [makerId, setMakerId] = useState("");
  const [makerName, setMakerName] = useState("");
  const [giftReady, setGiftReady] = useState(false);
  const [livePlant, setLivePlant] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [hero, setHero] = useState(false);
  const [stock, setStock] = useState("50");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = existing.data;
    if (!p) return;
    setName(p.name);
    setSlug(p.slug);
    setRange(p.range as Range);
    setCategory(p.category);
    setPrice(String(p.price));
    setUnit(p.unit);
    setShortLine(p.shortLine);
    setDescription(p.description);
    setUsage(p.usage ?? "");
    setImage(p.image);
    setMakerId(String(p.makerId));
    setMakerName(p.makerName);
    setGiftReady(p.giftReady);
    setLivePlant(p.livePlant);
    setFeatured(p.featured);
    setHero(p.hero);
    setStock(String(p.stock));
  }, [existing.data]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      slug: slugify(slug),
      name: name.trim(),
      range,
      category: category.trim(),
      price: Math.max(0, parseInt(price, 10) || 0),
      unit: unit.trim(),
      shortLine: shortLine.trim(),
      description: description.trim(),
      usage: usage.trim() || null,
      image: image.trim(),
      makerId: parseInt(makerId, 10),
      makerName,
      giftReady,
      livePlant,
      featured,
      hero,
      stock: Math.max(0, parseInt(stock, 10) || 0),
    };
    const onError = { onError: (err: { message: string }) => setError(err.message) };
    if (isNew) create.mutate(payload, onError);
    else update.mutate({ id: productId, ...payload }, onError);
  };

  const check = "h-4 w-4 accent-foreground";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-foreground">
            {isNew ? "Add product" : `Edit · ${existing.data?.name ?? "…"}`}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything here is public on the storefront except stock.
          </p>
        </div>
        <Link
          to="/admin/products"
          className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to products
        </Link>
      </div>

      <form onSubmit={submit} className="rounded-md border border-border bg-card p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            required
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (isNew && !slug) setSlug(slugify(name));
            }}
            className={input}
          />
          <input
            required
            placeholder="Slug (url)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            onBlur={() => setSlug(slugify(slug))}
            className={`${input} font-mono`}
          />
          <select value={range} onChange={(e) => setRange(e.target.value as Range)} className={input}>
            {RANGES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Category (e.g. Spices & blends)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={input}
          />
          <input
            required
            type="number"
            min={0}
            placeholder="Price ₹ (GST incl.)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={input}
          />
          <input
            required
            placeholder="Unit (e.g. 250 g jar)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className={input}
          />
          <select
            required
            value={makerId}
            onChange={(e) => {
              setMakerId(e.target.value);
              const m = makers.data?.find((x) => String(x.id) === e.target.value);
              if (m) setMakerName(m.name);
            }}
            className={input}
          >
            <option value="" disabled>
              Maker…
            </option>
            {(makers.data ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Image path"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className={`${input} font-mono`}
            title="e.g. /images/pepper.jpg — add new files under public/images in the repo"
          />
          <input
            type="number"
            min={0}
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={input}
          />
          <input
            required
            placeholder="Short line"
            value={shortLine}
            onChange={(e) => setShortLine(e.target.value)}
            className={`${input} sm:col-span-2 lg:col-span-3`}
          />
          <textarea
            required
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${textarea} sm:col-span-2 lg:col-span-3`}
          />
          <textarea
            placeholder="Usage / care (optional)"
            value={usage}
            onChange={(e) => setUsage(e.target.value)}
            className={`${textarea} sm:col-span-2 lg:col-span-3`}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-5 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={giftReady} onChange={(e) => setGiftReady(e.target.checked)} className={check} />
            Gift-ready
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={livePlant} onChange={(e) => setLivePlant(e.target.checked)} className={check} />
            Live plant
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className={check} />
            Featured
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={hero} onChange={(e) => setHero(e.target.checked)} className={check} />
            Range hero
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={create.isPending || update.isPending}
          className="focus-ring mt-5 inline-flex h-11 items-center gap-2 bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-forest-deep disabled:opacity-50"
        >
          {isNew ? "Create product" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
