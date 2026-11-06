import { desc, eq, gte, sql, like, or, count, sum } from "drizzle-orm";
import { makers, orders, products, subscribers, trees, treeBatches, users } from "@db/schema";
import { getDb } from "./connection";
import { recordStockMovement, listStockMovements } from "./stock-ledger";
import { dispatchEvent } from "../services/webhooks";
import { queueNotification, orderStatusMail } from "../services/notify";

export type OrderStatus = "placed" | "packed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

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
  const [order] = await db.select().from(orders).where(eq(orders.orderNo, orderNo)).limit(1);
  if (!order) throw new Error("Order not found");
  if (order.status === status) return { ok: true };

  // Cancelling puts units back on the shelf — and re-opening a cancelled order
  // takes them off again. Both transitions run at most once per crossing.
  if (status === "cancelled" && order.status !== "cancelled") {
    const items = JSON.parse(order.items) as { slug: string; qty: number }[];
    for (const item of items) {
      const [before] = await db
        .select({ id: products.id, name: products.name, stock: products.stock })
        .from(products)
        .where(eq(products.slug, item.slug))
        .limit(1);
      await db
        .update(products)
        .set({ stock: sql`${products.stock} + ${item.qty}` })
        .where(eq(products.slug, item.slug));
      if (before) {
        await recordStockMovement({
          productId: before.id,
          productName: before.name,
          delta: item.qty,
          resultingStock: before.stock + item.qty,
          reason: "order_cancelled",
          actor: `order:${orderNo}`,
        });
      }
    }
  }
  if (order.status === "cancelled" && status !== "cancelled") {
    const items = JSON.parse(order.items) as { slug: string; qty: number }[];
    for (const item of items) {
      const [before] = await db
        .select({ id: products.id, name: products.name, stock: products.stock })
        .from(products)
        .where(eq(products.slug, item.slug))
        .limit(1);
      await db
        .update(products)
        .set({ stock: sql`${products.stock} - ${item.qty}` })
        .where(eq(products.slug, item.slug));
      if (before) {
        const next = before.stock - item.qty;
        await recordStockMovement({
          productId: before.id,
          productName: before.name,
          delta: -item.qty,
          resultingStock: next,
          reason: "order_reopened",
          actor: `order:${orderNo}`,
        });
        if (before.stock > 5 && next <= 5) await alertIfLowStock(before.name, next);
      }
    }
  }

  await db.update(orders).set({ status }).where(eq(orders.orderNo, orderNo));

  void dispatchEvent(status === "cancelled" ? "order.cancelled" : "order.status_changed", {
    orderNo,
    previousStatus: order.status,
    status,
    email: order.email,
  });
  const mail = orderStatusMail({ orderNo, name: order.name, status });
  void queueNotification("order_status", order.email, mail.subject, mail.body);
  return { ok: true };
}

export async function setPaymentStatus(orderNo: string, paymentStatus: PaymentStatus, paymentRef?: string) {
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.orderNo, orderNo)).limit(1);
  if (!order) throw new Error("Order not found");
  await db
    .update(orders)
    .set({ paymentStatus, paymentRef: paymentRef ?? order.paymentRef })
    .where(eq(orders.orderNo, orderNo));
  if (paymentStatus === "paid" && order.paymentStatus !== "paid") {
    void dispatchEvent("payment.paid", { orderNo, total: order.total, paymentRef: paymentRef ?? order.paymentRef });
  }
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
    .select()
    .from(products)
    .where(pat ? like(products.name, pat) : undefined)
    .orderBy(sql`${products.stock} ASC`, products.name)
    .limit(300);
}

/* Low-stock alert: fires when stock crosses down through the threshold. */
export async function alertIfLowStock(productName: string, stock: number) {
  if (stock > 5) return;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const to of admins) {
    void queueNotification(
      "low_stock",
      to,
      `Low stock: ${productName}`,
      `${productName} is down to ${stock} units. Restock soon — checkout blocks at zero. The movement ledger shows the history.`,
    );
  }
}

export async function setStock(id: number, stock: number, actorName = "admin") {
  const db = getDb();
  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!row) throw new Error("Product not found");
  await db.update(products).set({ stock }).where(eq(products.id, id));
  const delta = stock - row.stock;
  if (delta !== 0) {
    await recordStockMovement({
      productId: id,
      productName: row.name,
      delta,
      resultingStock: stock,
      reason: delta > 0 ? "restock" : "adjust",
      actor: actorName,
    });
    if (row.stock > 5 && stock <= 5) await alertIfLowStock(row.name, stock);
  }
  return { ok: true };
}

export async function adjustStock(id: number, delta: number, note: string | null, actorName: string) {
  const db = getDb();
  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!row) throw new Error("Product not found");
  const next = row.stock + delta;
  if (next < 0) throw new Error(`Only ${row.stock} in stock — cannot remove ${Math.abs(delta)}.`);
  await db.update(products).set({ stock: next }).where(eq(products.id, id));
  await recordStockMovement({
    productId: id,
    productName: row.name,
    delta,
    resultingStock: next,
    reason: delta >= 0 ? "restock" : "adjust",
    note,
    actor: actorName,
  });
  if (row.stock > 5 && next <= 5) await alertIfLowStock(row.name, next);
  return { ok: true, stock: next };
}

export { listStockMovements };

export async function setFeatured(id: number, featured: boolean) {
  await getDb().update(products).set({ featured }).where(eq(products.id, id));
  return { ok: true };
}

/* ---------------- Products ---------------- */

export type ProductInput = {
  slug: string;
  name: string;
  range: "NOURISH" | "CARE" | "DWELL" | "GROW" | "GIVE";
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

export async function getProductAdmin(id: number) {
  const db = getDb();
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function findProductBySlug(slug: string) {
  const db = getDb();
  const rows = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function createProductAdmin(input: ProductInput, actorName = "admin") {
  const result = await getDb().insert(products).values(input);
  const id = Number(result[0].insertId);
  if (input.stock !== 0) {
    await recordStockMovement({
      productId: id,
      productName: input.name,
      delta: input.stock,
      resultingStock: input.stock,
      reason: "create",
      actor: actorName,
    });
  }
  return { id, ...input };
}

export async function updateProductAdmin(id: number, input: ProductInput) {
  await getDb().update(products).set(input).where(eq(products.id, id));
  return { id, ...input };
}

export async function deleteProductAdmin(id: number, actorName = "admin") {
  const [row] = await getDb().select().from(products).where(eq(products.id, id)).limit(1);
  if (row) {
    await recordStockMovement({
      productId: id,
      productName: row.name,
      delta: -row.stock,
      resultingStock: 0,
      reason: "delete",
      actor: actorName,
    });
  }
  await getDb().delete(products).where(eq(products.id, id));
  return { ok: true };
}

export async function duplicateProductAdmin(id: number) {
  const db = getDb();
  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!row) throw new Error("Product not found");
  const base = row.slug.replace(/(-copy)+$/u, "");
  let slug = `${base}-copy`;
  let n = 2;
  while (await findProductBySlug(slug)) {
    slug = `${base}-copy-${n}`;
    n += 1;
  }
  const { id: _id, createdAt: _createdAt, ...rest } = row;
  const result = await db.insert(products).values({ ...rest, slug, name: `${row.name} (copy)`, stock: 0, featured: false, hero: false });
  return { id: Number(result[0].insertId), slug };
}

export async function bulkUpsertProducts(rows: ProductInput[], actorName: string) {
  const results = { created: 0, updated: 0, errors: [] as { row: number; message: string }[] };
  for (let i = 0; i < rows.length; i++) {
    try {
      const row = rows[i];
      const existingBySlug = await findProductBySlug(row.slug);
      if (existingBySlug) {
        await getDb().update(products).set(row).where(eq(products.id, existingBySlug.id));
        results.updated += 1;
      } else {
        await createProductAdmin(row, actorName);
        results.created += 1;
      }
    } catch (e) {
      results.errors.push({ row: i + 1, message: e instanceof Error ? e.message : String(e) });
    }
  }
  return results;
}

export async function getSalesAnalytics() {
  const db = getDb();
  const since = new Date(Date.now() - 29 * 86_400_000);
  const recent = await db.select().from(orders).where(gte(orders.createdAt, since));
  const active = recent.filter((o) => o.status !== "cancelled");

  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (const o of active) {
    const key = o.createdAt.toISOString().slice(0, 10);
    const e = byDay.get(key) ?? { revenue: 0, orders: 0 };
    e.revenue += Number(o.total);
    e.orders += 1;
    byDay.set(key, e);
  }
  const days: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const key = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    const e = byDay.get(key) ?? { revenue: 0, orders: 0 };
    days.push({ date: key, revenue: e.revenue, orders: e.orders });
  }

  const qty = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of active) {
    try {
      const items = JSON.parse(o.items) as { slug: string; name: string; qty: number; price: number }[];
      for (const it of items) {
        const e = qty.get(it.slug) ?? { name: it.name, qty: 0, revenue: 0 };
        e.qty += it.qty;
        e.revenue += it.price * it.qty;
        qty.set(it.slug, e);
      }
    } catch {
      // skip malformed legacy rows
    }
  }
  const top = [...qty.entries()]
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);

  const totals30 = days.reduce(
    (a, d) => ({ revenue: a.revenue + d.revenue, orders: a.orders + d.orders }),
    { revenue: 0, orders: 0 },
  );
  return { days, top, totals30 };
}

export async function listMakersSelect() {
  return getDb().select({ id: makers.id, name: makers.name }).from(makers).orderBy(makers.name);
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
