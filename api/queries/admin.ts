import { desc, eq, sql, like, or, count, sum } from "drizzle-orm";
import { orders, products, subscribers, trees, treeBatches, users } from "@db/schema";
import { getDb } from "./connection";

export type OrderStatus = "placed" | "packed" | "shipped" | "delivered";

/* ---------------- Overview stats ---------------- */

export async function getAdminStats() {
  const db = getDb();
  const [orderAgg] = await db
    .select({
      totalOrders: count(orders.id),
      revenue: sum(orders.total),
    })
    .from(orders);
  const [placedAgg] = await db
    .select({ n: count(orders.id) })
    .from(orders)
    .where(eq(orders.status, "placed"));
  const [subAgg] = await db.select({ n: count(subscribers.id) }).from(subscribers);
  const [customerAgg] = await db
    .select({ n: sql<number>`COUNT(DISTINCT ${orders.email})` })
    .from(orders);
  const [treeAgg] = await db.select({ n: count(trees.id) }).from(trees);
  const [productAgg] = await db.select({ n: count(products.id) }).from(products);
  const [lowStockAgg] = await db
    .select({ n: count(products.id) })
    .from(products)
    .where(sql`${products.stock} <= 5`);

  return {
    totalOrders: Number(orderAgg?.totalOrders ?? 0),
    revenue: Number(orderAgg?.revenue ?? 0),
    openOrders: Number(placedAgg?.n ?? 0),
    subscribers: Number(subAgg?.n ?? 0),
    customers: Number(customerAgg?.n ?? 0),
    registeredTrees: Number(treeAgg?.n ?? 0),
    products: Number(productAgg?.n ?? 0),
    lowStock: Number(lowStockAgg?.n ?? 0),
  };
}

/* ---------------- Orders ---------------- */

export async function listOrdersAdmin(q?: string, status?: OrderStatus) {
  const db = getDb();
  const conds = [];
  if (status) conds.push(eq(orders.status, status));
  if (q) {
    const pat = `%${q}%`;
    conds.push(
      or(like(orders.orderNo, pat), like(orders.name, pat), like(orders.email, pat))!,
    );
  }
  return db
    .select()
    .from(orders)
    .where(conds.length ? sql.join(conds, sql` AND `) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(200);
}

export async function getOrderAdmin(orderNo: string) {
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.orderNo, orderNo)).limit(1);
  if (!order) return null;
  const orderTrees = await db
    .select({
      treeNo: trees.treeNo,
      species: trees.species,
      status: trees.status,
      recipientName: trees.recipientName,
      batchCode: treeBatches.code,
      site: treeBatches.site,
    })
    .from(trees)
    .leftJoin(treeBatches, eq(trees.batchId, treeBatches.id))
    .where(eq(trees.orderId, order.id));
  return { order, trees: orderTrees };
}

export async function setOrderStatus(orderNo: string, status: OrderStatus) {
  const db = getDb();
  await db.update(orders).set({ status }).where(eq(orders.orderNo, orderNo));
  return { ok: true };
}

/* ---------------- Customers (light CRM) ---------------- */

export async function listCustomersAdmin(q?: string) {
  const db = getDb();
  const pat = q ? `%${q}%` : null;
  const rows = await db
    .select({
      email: orders.email,
      name: sql<string>`MAX(${orders.name})`,
      phone: sql<string>`MAX(${orders.phone})`,
      ordersCount: count(orders.id),
      totalSpent: sum(orders.total),
      lastOrderAt: sql<Date>`MAX(${orders.createdAt})`,
    })
    .from(orders)
    .where(pat ? or(like(orders.email, pat), like(orders.name, pat)) : undefined)
    .groupBy(orders.email)
    .orderBy(sql`MAX(${orders.createdAt}) DESC`)
    .limit(200);
  return rows;
}

/* ---------------- Subscribers ---------------- */

export async function listSubscribersAdmin() {
  return getDb().select().from(subscribers).orderBy(desc(subscribers.createdAt)).limit(500);
}

export async function removeSubscriber(id: number) {
  await getDb().delete(subscribers).where(eq(subscribers.id, id));
  return { ok: true };
}

/* ---------------- Trees ---------------- */

export async function listTreesAdmin(batchCode?: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: trees.id,
      treeNo: trees.treeNo,
      species: trees.species,
      status: trees.status,
      recipientName: trees.recipientName,
      createdAt: trees.createdAt,
      orderNo: orders.orderNo,
      batchCode: treeBatches.code,
      site: treeBatches.site,
    })
    .from(trees)
    .leftJoin(orders, eq(trees.orderId, orders.id))
    .leftJoin(treeBatches, eq(trees.batchId, treeBatches.id))
    .orderBy(desc(trees.id))
    .limit(300);
  return batchCode ? rows.filter((r) => r.batchCode === batchCode) : rows;
}

export async function setTreeStatus(treeNo: string, status: "pledged" | "planted" | "verified") {
  await getDb().update(trees).set({ status }).where(eq(trees.treeNo, treeNo));
  return { ok: true };
}

/* ---------------- Catalogue / stock ---------------- */

export async function listStockAdmin(q?: string) {
  const db = getDb();
  const pat = q ? `%${q}%` : null;
  return db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      range: products.range,
      category: products.category,
      price: products.price,
      stock: products.stock,
      featured: products.featured,
    })
    .from(products)
    .where(pat ? like(products.name, pat) : undefined)
    .orderBy(sql`${products.stock} ASC`, products.name)
    .limit(300);
}

export async function setStock(id: number, stock: number) {
  await getDb().update(products).set({ stock }).where(eq(products.id, id));
  return { ok: true };
}

export async function setFeatured(id: number, featured: boolean) {
  await getDb().update(products).set({ featured }).where(eq(products.id, id));
  return { ok: true };
}

/* ---------------- Registered users ---------------- */

export async function listUsersAdmin() {
  return getDb()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      lastSignInAt: users.lastSignInAt,
    })
    .from(users)
    .orderBy(desc(users.lastSignInAt))
    .limit(200);
}
