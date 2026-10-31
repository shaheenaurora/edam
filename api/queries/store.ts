import { and, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { journalPosts, makers, orders, products, treeBatches, trees, subscribers } from "@db/schema";

/* ---------------- Products ---------------- */

export interface ProductFilter {
  range?: "NOURISH" | "CARE" | "DWELL" | "GROW" | "GIVE";
  q?: string;
  giftReady?: boolean;
  livePlant?: boolean;
  category?: string;
}

export async function listProducts(filter: ProductFilter = {}) {
  const db = getDb();
  const conds: ReturnType<typeof eq>[] = [];
  if (filter.range) conds.push(eq(products.range, filter.range));
  if (filter.giftReady) conds.push(eq(products.giftReady, true));
  if (filter.livePlant !== undefined) conds.push(eq(products.livePlant, filter.livePlant));
  if (filter.category) conds.push(eq(products.category, filter.category));
  if (filter.q) {
    const q = `%${filter.q}%`;
    conds.push(
      or(like(products.name, q), like(products.shortLine, q), like(products.category, q), like(products.makerName, q)) as SQL,
    );
  }
  return db
    .select()
    .from(products)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(products.hero), desc(products.featured), products.name);
}

export async function getProductBySlug(slug: string) {
  return getDb().query.products.findFirst({ where: (t, { eq }) => eq(t.slug, slug) });
}

export async function listFeaturedProducts() {
  return getDb().select().from(products).where(eq(products.featured, true)).orderBy(desc(products.hero));
}

export async function listRangeHeroes() {
  return getDb().select().from(products).where(eq(products.hero, true));
}

export async function listProductsByMaker(makerId: number) {
  return getDb().select().from(products).where(eq(products.makerId, makerId)).orderBy(products.name);
}

export async function listCategories(range?: string) {
  const db = getDb();
  const rows = await db
    .selectDistinct({ category: products.category })
    .from(products)
    .where(range ? eq(products.range, range as never) : undefined);
  return rows.map((r) => r.category);
}

/* ---------------- Makers ---------------- */

export async function listMakers() {
  return getDb().select().from(makers).orderBy(makers.name);
}

export async function getMakerBySlug(slug: string) {
  return getDb().query.makers.findFirst({ where: (t, { eq }) => eq(t.slug, slug) });
}

/* ---------------- Trees & ledger ---------------- */

export async function getTreeStats() {
  const db = getDb();
  const [planted] = await db
    .select({ total: sql<number>`COALESCE(SUM(${treeBatches.plantedCount}), 0)` })
    .from(treeBatches);
  const [survival] = await db
    .select({
      alive: sql<number>`COALESCE(SUM(${treeBatches.alive12m}), 0)`,
      measured: sql<number>`COALESCE(SUM(CASE WHEN ${treeBatches.alive12m} IS NOT NULL THEN ${treeBatches.plantedCount} ELSE 0 END), 0)`,
    })
    .from(treeBatches);
  const [pledged] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(trees)
    .where(eq(trees.status, "pledged"));
  const [totalTrees] = await db.select({ total: sql<number>`COUNT(*)` }).from(trees);
  return {
    treesPlanted: Number(planted.total),
    pledged: Number(pledged.total),
    registeredTrees: Number(totalTrees.total),
    survivalRate: Number(survival.measured) > 0 ? Math.round((Number(survival.alive) / Number(survival.measured)) * 100) : null,
    measuredBase: Number(survival.measured),
  };
}

export async function listTreeBatches() {
  return getDb().select().from(treeBatches).orderBy(treeBatches.code);
}

export async function findTree(query: string) {
  const db = getDb();
  const tree = await db.query.trees.findFirst({ where: (t, { eq }) => eq(t.treeNo, query.trim().toUpperCase()) });
  if (tree) {
    const batch = await db.query.treeBatches.findFirst({ where: (t, { eq }) => eq(t.id, tree.batchId) });
    return { tree, batch };
  }
  const order = await db.query.orders.findFirst({ where: (t, { eq }) => eq(t.orderNo, query.trim().toUpperCase()) });
  if (order) {
    const orderTrees = await db.select().from(trees).where(eq(trees.orderId, order.id));
    const withBatches = await Promise.all(
      orderTrees.map(async (t) => ({
        tree: t,
        batch: await db.query.treeBatches.findFirst({ where: (tb, { eq }) => eq(tb.id, t.batchId) }),
      })),
    );
    return { order, trees: withBatches };
  }
  return null;
}

export async function getOpenBatch() {
  return getDb().query.treeBatches.findFirst({ where: (t, { eq }) => eq(t.status, "open") });
}

/* ---------------- Orders ---------------- */

interface AddressInput {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItemInput {
  slug: string;
  qty: number;
}

export interface CreateOrderInput {
  email: string;
  name: string;
  phone: string;
  address: AddressInput;
  items: OrderItemInput[];
  paymentMethod: "upi" | "card" | "cod";
  isGift?: boolean;
  giftMessage?: string;
  recipientAddress?: AddressInput;
  recipientName?: string;
  userId?: number;
}

const FREE_SHIPPING_ABOVE = 1499;
const SHIPPING_FEE = 79;

export async function createOrder(input: CreateOrderInput) {
  const db = getDb();

  // Price from the database, never the client
  const detailedList: { product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>; qty: number }[] = [];
  for (const item of input.items) {
    const product = await getProductBySlug(item.slug);
    if (!product) throw new Error(`Unknown product: ${item.slug}`);
    if (product.stock < item.qty) throw new Error(`${product.name} is out of stock`);
    detailedList.push({ product, qty: item.qty });
  }

  const subtotal = detailedList.reduce((s, { product, qty }) => s + product.price * qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const [{ count }] = await db.select({ count: sql<number>`COUNT(*)` }).from(orders);
  const orderNo = `EDM-2026-${String(Number(count) + 1).padStart(4, "0")}`;

  const result = await db.insert(orders).values({
    orderNo,
    userId: input.userId ?? null,
    email: input.email,
    name: input.name,
    phone: input.phone,
    address: JSON.stringify(input.address),
    items: JSON.stringify(
      detailedList.map(({ product, qty }) => ({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        qty,
        price: product.price,
        unit: product.unit,
        makerName: product.makerName,
      })),
    ),
    subtotal,
    shipping,
    total,
    paymentMethod: input.paymentMethod,
    isGift: input.isGift ?? false,
    giftMessage: input.giftMessage ?? null,
    recipientAddress: input.recipientAddress ? JSON.stringify(input.recipientAddress) : null,
    status: "placed",
  });

  const orderId = Number(result[0].insertId);

  // Decrement stock
  for (const { product, qty } of detailedList) {
    await db
      .update(products)
      .set({ stock: sql`${products.stock} - ${qty}` })
      .where(eq(products.id, product.id));
  }

  // ---- Tree obligations: every order plants a tree; "a tree in their name" adds one per unit ----
  const openBatch = await getOpenBatch();
  if (!openBatch) throw new Error("No open tree batch configured");

  const [{ treeCount }] = await db.select({ treeCount: sql<number>`COUNT(*)` }).from(trees);
  let nextTreeNo = Number(treeCount) + 1;
  const mkTreeNo = () => `TR-${String(nextTreeNo++).padStart(6, "0")}`;

  const createdTrees: { treeNo: string; species: string }[] = [];
  const treeSpecies = ["Wild jack", "Neem", "Kanjiram", "Silver oak", "Wild mango"];

  // one tree for the order itself
  const orderTreeNo = mkTreeNo();
  await db.insert(trees).values({
    treeNo: orderTreeNo,
    species: treeSpecies[detailedList.length % treeSpecies.length],
    batchId: openBatch.id,
    orderId,
    status: "pledged",
  });
  createdTrees.push({ treeNo: orderTreeNo, species: treeSpecies[detailedList.length % treeSpecies.length] });

  // additional trees from "a tree in their name" gifts
  for (const { product, qty } of detailedList) {
    if (product.slug === "a-tree-in-their-name") {
      for (let i = 0; i < qty; i++) {
        const treeNo = mkTreeNo();
        const species = treeSpecies[(nextTreeNo + i) % treeSpecies.length];
        await db.insert(trees).values({
          treeNo,
          species,
          batchId: openBatch.id,
          orderId,
          recipientName: input.recipientName ?? null,
          status: "pledged",
        });
        createdTrees.push({ treeNo, species });
      }
    }
  }

  return { orderNo, orderId, subtotal, shipping, total, trees: createdTrees };
}

export async function getOrderByNo(orderNo: string) {
  const db = getDb();
  const order = await db.query.orders.findFirst({ where: (t, { eq }) => eq(t.orderNo, orderNo) });
  if (!order) return null;
  const orderTrees = await db.select().from(trees).where(eq(trees.orderId, order.id));
  return { order, trees: orderTrees };
}

export async function listOrdersForUser(userId: number, email?: string | null) {
  const db = getDb();
  const conds = email ? or(eq(orders.userId, userId), eq(orders.email, email)) : eq(orders.userId, userId);
  const userOrders = await db.select().from(orders).where(conds).orderBy(desc(orders.createdAt));
  return Promise.all(
    userOrders.map(async (o) => ({
      order: o,
      trees: await db.select().from(trees).where(eq(trees.orderId, o.id)),
    })),
  );
}

/* ---------------- Journal ---------------- */

export async function listJournalPosts() {
  return getDb().select().from(journalPosts).orderBy(desc(journalPosts.publishedOn));
}

export async function getJournalPost(slug: string) {
  return getDb().query.journalPosts.findFirst({ where: (t, { eq }) => eq(t.slug, slug) });
}

/* ---------------- Subscribers ---------------- */

export async function addSubscriber(email: string, consent: boolean) {
  const db = getDb();
  const existing = await db.query.subscribers.findFirst({ where: (t, { eq }) => eq(t.email, email) });
  if (existing) return { already: true };
  await db.insert(subscribers).values({ email, consent });
  return { already: false };
}
