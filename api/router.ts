import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { authRouter } from "./auth-router";
import * as store from "./queries/store";
import * as admin from "./queries/admin";
import * as discountService from "./services/discounts";
import * as webhookService from "./services/webhooks";
import * as settingsService from "./services/settings";
import * as paymentService from "./services/payments";
import * as notifyService from "./services/notify";
import { recordAudit, listAudit } from "./services/audit";
import { getOrderByNo } from "./queries/store";

const addressSchema = z.object({
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
});

/** Who is acting — recorded on every admin mutation. */
function actor(ctx: { user?: { name: string | null; email: string | null } | null }) {
  return ctx.user?.name ?? ctx.user?.email ?? "unknown";
}

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,

  catalogue: createRouter({
    products: publicQuery
      .input(
        z
          .object({
            range: z.enum(["NOURISH", "CARE", "DWELL", "GROW", "GIVE"]).optional(),
            q: z.string().optional(),
            giftReady: z.boolean().optional(),
            livePlant: z.boolean().optional(),
            category: z.string().optional(),
          })
          .optional(),
      )
      .query(({ input }) => store.listProducts(input ?? {})),
    product: publicQuery.input(z.object({ slug: z.string() })).query(({ input }) => store.getProductBySlug(input.slug)),
    featured: publicQuery.query(() => store.listFeaturedProducts()),
    categories: publicQuery.input(z.object({ range: z.string().optional() })).query(({ input }) => store.listCategories(input.range)),
    byMaker: publicQuery.input(z.object({ makerId: z.number() })).query(({ input }) => store.listProductsByMaker(input.makerId)),
  }),

  makers: createRouter({
    list: publicQuery.query(() => store.listMakers()),
    bySlug: publicQuery.input(z.object({ slug: z.string() })).query(({ input }) => store.getMakerBySlug(input.slug)),
  }),

  trees: createRouter({
    stats: publicQuery.query(() => store.getTreeStats()),
    batches: publicQuery.query(() => store.listTreeBatches()),
    find: publicQuery.input(z.object({ q: z.string().min(3) })).query(({ input }) => store.findTree(input.q)),
  }),

  journal: createRouter({
    list: publicQuery.query(() => store.listJournalPosts()),
    bySlug: publicQuery.input(z.object({ slug: z.string() })).query(({ input }) => store.getJournalPost(input.slug)),
  }),

  newsletter: createRouter({
    subscribe: publicQuery
      .input(z.object({ email: z.string().email(), consent: z.literal(true) }))
      .mutation(({ input }) => store.addSubscriber(input.email, input.consent)),
  }),

  orders: createRouter({
    create: publicQuery
      .input(
        z.object({
          email: z.string().email(),
          name: z.string().min(2),
          phone: z.string().min(10),
          address: addressSchema,
          items: z.array(z.object({ slug: z.string(), qty: z.number().int().min(1).max(20) })).min(1),
          paymentMethod: z.enum(["upi", "card", "cod"]),
          discountCode: z.string().max(40).optional(),
          isGift: z.boolean().optional(),
          giftMessage: z.string().max(500).optional(),
          recipientAddress: addressSchema.optional(),
          recipientName: z.string().max(120).optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        try {
          return await store.createOrder({ ...input, userId: ctx.user?.id });
        } catch (err) {
          if (err instanceof store.BusinessError) {
            throw new TRPCError({ code: "BAD_REQUEST", message: err.message });
          }
          throw err;
        }
      }),
    byOrderNo: publicQuery.input(z.object({ orderNo: z.string() })).query(({ input }) => store.getOrderByNo(input.orderNo)),
    mine: authedQuery.query(({ ctx }) => store.listOrdersForUser(ctx.user.id, ctx.user.email)),
  }),

  /* Public store config (shipping thresholds etc. — server stays authoritative) */
  config: createRouter({
    public: publicQuery.query(async () => {
      const s = await settingsService.getSettings();
      return {
        freeShippingAbove: s.freeShippingAbove,
        shippingFee: s.shippingFee,
        upiId: s.upiId,
        supportEmail: s.supportEmail,
      };
    }),
  }),

  discounts: createRouter({
    validate: publicQuery
      .input(
        z.object({
          code: z.string().min(2).max(40),
          items: z.array(z.object({ slug: z.string(), qty: z.number().int().min(1).max(20) })).min(1),
        }),
      )
      .query(async ({ input }) => {
        // Price the basket from the DB, then ask the discount engine
        let subtotal = 0;
        for (const item of input.items) {
          const p = await store.getProductBySlug(item.slug);
          if (!p) return { ok: false as const, reason: `Unknown product: ${item.slug}`, amount: 0 };
          subtotal += p.price * item.qty;
        }
        const check = await discountService.checkDiscount(input.code, subtotal);
        return {
          ok: check.ok,
          reason: check.reason,
          amount: check.amount,
          code: check.ok ? check.discount!.code : undefined,
        };
      }),
  }),

  payments: createRouter({
    status: publicQuery.query(() => ({
      provider: "razorpay" as const,
      configured: paymentService.razorpayConfigured(),
      keyId: paymentService.razorpayConfigured() ? paymentService.razorpayKeyId() : null,
    })),
    // Create a Razorpay order for an already-placed Edam order; amount comes from OUR database.
    begin: publicQuery
      .input(z.object({ orderNo: z.string() }))
      .mutation(async ({ input }) => {
        const found = await getOrderByNo(input.orderNo);
        if (!found) throw new Error("Order not found");
        if (found.order.paymentStatus === "paid") throw new Error("This order is already paid.");
        const rp = await paymentService.createRazorpayOrder(found.order.total, found.order.orderNo, {
          orderNo: found.order.orderNo,
        });
        return { rpOrderId: rp.id, amountInr: found.order.total, keyId: paymentService.razorpayKeyId() };
      }),
    // Checkout.js callback lands here; accepted only with a valid signature.
    confirm: publicQuery
      .input(
        z.object({
          orderNo: z.string(),
          razorpayOrderId: z.string(),
          razorpayPaymentId: z.string(),
          signature: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const valid = paymentService.verifyCheckoutSignature(
          input.razorpayOrderId,
          input.razorpayPaymentId,
          input.signature,
        );
        if (!valid) throw new Error("Payment signature mismatch — not marking this paid.");
        await admin.setPaymentStatus(input.orderNo, "paid", input.razorpayPaymentId);
        return { ok: true };
      }),
  }),

  admin: createRouter({
    stats: adminQuery.query(() => admin.getAdminStats()),
    orders: adminQuery
      .input(
        z.object({
          q: z.string().optional(),
          status: z.enum(["placed", "packed", "shipped", "delivered", "cancelled"]).optional(),
        }),
      )
      .query(({ input }) => admin.listOrdersAdmin(input.q, input.status)),
    order: adminQuery.input(z.object({ orderNo: z.string() })).query(({ input }) => admin.getOrderAdmin(input.orderNo)),
    setOrderStatus: adminQuery
      .input(z.object({ orderNo: z.string(), status: z.enum(["placed", "packed", "shipped", "delivered", "cancelled"]) }))
      .mutation(async ({ input, ctx }) => {
        const res = await admin.setOrderStatus(input.orderNo, input.status);
        await recordAudit(actor(ctx), "order.status", `${input.orderNo} → ${input.status}`);
        return res;
      }),
    setPaymentStatus: adminQuery
      .input(z.object({ orderNo: z.string(), paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]) }))
      .mutation(async ({ input, ctx }) => {
        const res = await admin.setPaymentStatus(input.orderNo, input.paymentStatus);
        await recordAudit(actor(ctx), "order.payment", `${input.orderNo} → ${input.paymentStatus}`);
        return res;
      }),
    customers: adminQuery.input(z.object({ q: z.string().optional() })).query(({ input }) => admin.listCustomersAdmin(input.q)),
    subscribers: adminQuery.query(() => admin.listSubscribersAdmin()),
    removeSubscriber: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const res = await admin.removeSubscriber(input.id);
      await recordAudit(actor(ctx), "subscriber.remove", `id ${input.id}`);
      return res;
    }),
    trees: adminQuery.input(z.object({ batchCode: z.string().optional() })).query(({ input }) => admin.listTreesAdmin(input.batchCode)),
    setTreeStatus: adminQuery
      .input(z.object({ treeNo: z.string(), status: z.enum(["pledged", "planted", "verified"]) }))
      .mutation(async ({ input, ctx }) => {
        const res = await admin.setTreeStatus(input.treeNo, input.status);
        await recordAudit(actor(ctx), "tree.status", `${input.treeNo} → ${input.status}`);
        return res;
      }),
    stock: adminQuery.input(z.object({ q: z.string().optional() })).query(({ input }) => admin.listStockAdmin(input.q)),
    setStock: adminQuery.input(z.object({ id: z.number(), stock: z.number().int().min(0) })).mutation(async ({ input, ctx }) => {
      const res = await admin.setStock(input.id, input.stock);
      await recordAudit(actor(ctx), "stock.set", `product ${input.id} → ${input.stock}`);
      return res;
    }),
    setFeatured: adminQuery.input(z.object({ id: z.number(), featured: z.boolean() })).mutation(async ({ input, ctx }) => {
      const res = await admin.setFeatured(input.id, input.featured);
      await recordAudit(actor(ctx), "product.featured", `product ${input.id} → ${input.featured}`);
      return res;
    }),
    users: adminQuery.query(() => admin.listUsersAdmin()),

    /* ---------------- Discount codes ---------------- */
    discounts: adminQuery.query(() => discountService.listDiscounts()),
    createDiscount: adminQuery
      .input(
        z.object({
          code: z.string().min(3).max(40),
          kind: z.enum(["percent", "fixed"]),
          value: z.number().int().min(1).max(100000),
          minSubtotal: z.number().int().min(0).default(0),
          maxUses: z.number().int().min(1).nullable().default(null),
          expiresAt: z.string().datetime().nullable().default(null),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const res = await discountService.createDiscount({
          ...input,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        });
        await recordAudit(actor(ctx), "discount.create", input.code.toUpperCase());
        return res;
      }),
    setDiscountActive: adminQuery
      .input(z.object({ id: z.number(), active: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        const res = await discountService.setDiscountActive(input.id, input.active);
        await recordAudit(actor(ctx), "discount.toggle", `id ${input.id} → ${input.active}`);
        return res;
      }),
    deleteDiscount: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const res = await discountService.deleteDiscount(input.id);
      await recordAudit(actor(ctx), "discount.delete", `id ${input.id}`);
      return res;
    }),

    /* ---------------- Integration hub (webhooks, mailer) ---------------- */
    webhooks: adminQuery.query(() => webhookService.listEndpoints()),
    createWebhook: adminQuery
      .input(z.object({ url: z.string().url(), events: z.array(z.string()).min(1) }))
      .mutation(async ({ input, ctx }) => {
        const res = await webhookService.createEndpoint(input.url, input.events);
        await recordAudit(actor(ctx), "webhook.create", input.url);
        return res;
      }),
    setWebhookActive: adminQuery
      .input(z.object({ id: z.number(), active: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        const res = await webhookService.setEndpointActive(input.id, input.active);
        await recordAudit(actor(ctx), "webhook.toggle", `id ${input.id} → ${input.active}`);
        return res;
      }),
    deleteWebhook: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const res = await webhookService.deleteEndpoint(input.id);
      await recordAudit(actor(ctx), "webhook.delete", `id ${input.id}`);
      return res;
    }),
    webhookDeliveries: adminQuery.query(() => webhookService.listDeliveries()),
    retryWebhook: adminQuery.input(z.object({ id: z.number() })).mutation(({ input }) => webhookService.retryDelivery(input.id)),
    testWebhook: adminQuery.input(z.object({ id: z.number() })).mutation(({ input }) => webhookService.sendTestPing(input.id)),
    notifications: adminQuery.query(() => notifyService.listNotifications()),
    integrationStatus: adminQuery.query(() => ({
      razorpay: paymentService.razorpayConfigured(),
      mailer: notifyService.mailerConfigured(),
    })),

    /* ---------------- Store settings ---------------- */
    settings: adminQuery.query(() => settingsService.getSettings()),
    saveSettings: adminQuery
      .input(
        z.object({
          freeShippingAbove: z.number().int().min(0).optional(),
          shippingFee: z.number().int().min(0).optional(),
          upiId: z.string().max(80).optional(),
          supportEmail: z.string().email().optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const res = await settingsService.setSettings(input);
        await recordAudit(actor(ctx), "settings.save", Object.keys(input).join(", "));
        return res;
      }),

    audit: adminQuery.query(() => listAudit()),
  }),
});

export type AppRouter = typeof appRouter;
