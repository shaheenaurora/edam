import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  int,
  boolean,
  timestamp,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/* ---------------- Makers (the named sources) ---------------- */

export const makers = mysqlTable("makers", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  kind: varchar("kind", { length: 80 }).notNull(), // farmer collective, women's SHG, artisan cluster…
  place: varchar("place", { length: 160 }).notNull(),
  summary: varchar("summary", { length: 320 }).notNull(),
  story: text("story").notNull(),
  image: varchar("image", { length: 512 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Maker = typeof makers.$inferSelect;

/* ---------------- Products ---------------- */

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  range: mysqlEnum("range", ["NOURISH", "CARE", "DWELL", "GROW", "GIVE"]).notNull(),
  category: varchar("category", { length: 120 }).notNull(), // e.g. "Spices & blends"
  price: int("price").notNull(), // INR, GST-inclusive
  unit: varchar("unit", { length: 60 }).notNull(), // e.g. "250 g jar"
  shortLine: varchar("shortLine", { length: 240 }).notNull(),
  description: text("description").notNull(),
  usage: text("usage"),
  image: varchar("image", { length: 512 }).notNull(),
  makerId: bigint("makerId", { mode: "number", unsigned: true }).notNull(),
  makerName: varchar("makerName", { length: 255 }).notNull(),
  giftReady: boolean("giftReady").default(false).notNull(),
  livePlant: boolean("livePlant").default(false).notNull(),
  featured: boolean("featured").default(false).notNull(),
  hero: boolean("hero").default(false).notNull(), // range hero
  stock: int("stock").default(50).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;

/* ---------------- Orders ---------------- */

export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  orderNo: varchar("orderNo", { length: 32 }).notNull().unique(), // EDM-2026-0001
  userId: bigint("userId", { mode: "number", unsigned: true }), // nullable: guest checkout
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  address: text("address").notNull(), // JSON: line1, line2, city, state, pincode
  items: text("items").notNull(), // JSON: [{productId, slug, name, qty, price, makerName}]
  subtotal: int("subtotal").notNull(),
  discount: int("discount").default(0).notNull(), // INR off, from a discount code
  discountCode: varchar("discountCode", { length: 40 }),
  shipping: int("shipping").notNull(),
  total: int("total").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["upi", "card", "cod"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  paymentRef: varchar("paymentRef", { length: 128 }), // gateway payment id, once captured
  isGift: boolean("isGift").default(false).notNull(),
  giftMessage: text("giftMessage"),
  recipientAddress: text("recipientAddress"),
  status: mysqlEnum("status", ["placed", "packed", "shipped", "delivered", "cancelled"]).default("placed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;

/* ---------------- Tree batches (planting sites) ---------------- */

export const treeBatches = mysqlTable("treeBatches", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(), // BATCH-2026-ONAM-01
  site: varchar("site", { length: 255 }).notNull(),
  district: varchar("district", { length: 120 }).notNull(),
  partner: varchar("partner", { length: 255 }).notNull(),
  species: varchar("species", { length: 255 }).notNull(), // comma list
  plantedCount: int("plantedCount").notNull(),
  alive12m: int("alive12m"), // survival count at 12 months, null until measured
  plantedOn: varchar("plantedOn", { length: 80 }).notNull(),
  image: varchar("image", { length: 512 }),
  note: text("note"),
  status: mysqlEnum("status", ["open", "planted"]).default("planted").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TreeBatch = typeof treeBatches.$inferSelect;

/* ---------------- Trees (one per obligation) ---------------- */

export const trees = mysqlTable("trees", {
  id: serial("id").primaryKey(),
  treeNo: varchar("treeNo", { length: 32 }).notNull().unique(), // TR-000123
  species: varchar("species", { length: 120 }).notNull(),
  batchId: bigint("batchId", { mode: "number", unsigned: true }).notNull(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }),
  stayRef: varchar("stayRef", { length: 64 }), // for trees from stays
  recipientName: varchar("recipientName", { length: 255 }), // "a tree in their name"
  status: mysqlEnum("status", ["pledged", "planted", "verified"]).default("pledged").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tree = typeof trees.$inferSelect;

/* ---------------- Journal (Grow guides / Field Notes) ---------------- */

export const journalPosts = mysqlTable("journalPosts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: varchar("excerpt", { length: 320 }).notNull(),
  body: text("body").notNull(),
  tag: varchar("tag", { length: 60 }).notNull(), // Grow guide · Kerala at home · From the makers
  image: varchar("image", { length: 512 }).notNull(),
  readingMinutes: int("readingMinutes").default(4).notNull(),
  publishedOn: varchar("publishedOn", { length: 32 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JournalPost = typeof journalPosts.$inferSelect;

/* ---------------- Field Notes subscribers ---------------- */

export const subscribers = mysqlTable("subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  consent: boolean("consent").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/* ---------------- Discount codes ---------------- */

export const discounts = mysqlTable("discounts", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 40 }).notNull().unique(), // stored uppercase
  kind: mysqlEnum("kind", ["percent", "fixed"]).notNull(),
  value: int("value").notNull(), // percent (1–90) or fixed INR
  minSubtotal: int("minSubtotal").default(0).notNull(),
  maxUses: int("maxUses"), // null = unlimited
  usedCount: int("usedCount").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Discount = typeof discounts.$inferSelect;

/* ---------------- Outbound webhooks (integration hub) ---------------- */

export const webhookEndpoints = mysqlTable("webhookEndpoints", {
  id: serial("id").primaryKey(),
  url: varchar("url", { length: 512 }).notNull(),
  secret: varchar("secret", { length: 80 }).notNull(), // signs every delivery (HMAC-SHA256)
  events: text("events").notNull(), // JSON array: ["order.placed", ...]
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookEndpoint = typeof webhookEndpoints.$inferSelect;

export const webhookDeliveries = mysqlTable("webhookDeliveries", {
  id: serial("id").primaryKey(),
  endpointId: bigint("endpointId", { mode: "number", unsigned: true }).notNull(),
  event: varchar("event", { length: 60 }).notNull(),
  payload: text("payload").notNull(), // JSON body that was/will be sent
  status: mysqlEnum("status", ["pending", "success", "failed"]).default("pending").notNull(),
  attempts: int("attempts").default(0).notNull(),
  responseCode: int("responseCode"),
  lastError: varchar("lastError", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deliveredAt: timestamp("deliveredAt"),
});

export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;

/* ---------------- Notification outbox ---------------- */

export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  kind: varchar("kind", { length: 60 }).notNull(), // order_confirmation | order_status
  toEmail: varchar("toEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  status: mysqlEnum("status", ["queued", "sent", "failed"]).default("queued").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  sentAt: timestamp("sentAt"),
});

export type Notification = typeof notifications.$inferSelect;

/* ---------------- Store settings (key-value) ---------------- */

export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 80 }).primaryKey(),
  value: text("value").notNull(), // JSON-encoded
});

/* ---------------- Admin audit log ---------------- */

export const auditLog = mysqlTable("auditLog", {
  id: serial("id").primaryKey(),
  actorName: varchar("actorName", { length: 255 }).notNull(),
  action: varchar("action", { length: 120 }).notNull(),
  detail: text("detail"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditEntry = typeof auditLog.$inferSelect;

/* ---------------- Sign-in codes (email OTP) ---------------- */

export const loginCodes = mysqlTable("loginCodes", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  code: varchar("code", { length: 64 }).notNull(),
  attempts: int("attempts").default(0).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LoginCode = typeof loginCodes.$inferSelect;
