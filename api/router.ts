import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { authRouter } from "./auth-router";
import * as store from "./queries/store";
import * as admin from "./queries/admin";

const addressSchema = z.object({
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
});

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
          isGift: z.boolean().optional(),
          giftMessage: z.string().max(500).optional(),
          recipientAddress: addressSchema.optional(),
          recipientName: z.string().max(120).optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        return store.createOrder({ ...input, userId: ctx.user?.id });
      }),
    byOrderNo: publicQuery.input(z.object({ orderNo: z.string() })).query(({ input }) => store.getOrderByNo(input.orderNo)),
    mine: authedQuery.query(({ ctx }) => store.listOrdersForUser(ctx.user.id, ctx.user.email)),
  }),

  admin: createRouter({
    stats: adminQuery.query(() => admin.getAdminStats()),
    orders: adminQuery
      .input(
        z.object({
          q: z.string().optional(),
          status: z.enum(["placed", "packed", "shipped", "delivered"]).optional(),
        }),
      )
      .query(({ input }) => admin.listOrdersAdmin(input.q, input.status)),
    order: adminQuery.input(z.object({ orderNo: z.string() })).query(({ input }) => admin.getOrderAdmin(input.orderNo)),
    setOrderStatus: adminQuery
      .input(z.object({ orderNo: z.string(), status: z.enum(["placed", "packed", "shipped", "delivered"]) }))
      .mutation(({ input }) => admin.setOrderStatus(input.orderNo, input.status)),
    customers: adminQuery.input(z.object({ q: z.string().optional() })).query(({ input }) => admin.listCustomersAdmin(input.q)),
    subscribers: adminQuery.query(() => admin.listSubscribersAdmin()),
    removeSubscriber: adminQuery.input(z.object({ id: z.number() })).mutation(({ input }) => admin.removeSubscriber(input.id)),
    trees: adminQuery.input(z.object({ batchCode: z.string().optional() })).query(({ input }) => admin.listTreesAdmin(input.batchCode)),
    setTreeStatus: adminQuery
      .input(z.object({ treeNo: z.string(), status: z.enum(["pledged", "planted", "verified"]) }))
      .mutation(({ input }) => admin.setTreeStatus(input.treeNo, input.status)),
    stock: adminQuery.input(z.object({ q: z.string().optional() })).query(({ input }) => admin.listStockAdmin(input.q)),
    setStock: adminQuery.input(z.object({ id: z.number(), stock: z.number().int().min(0) })).mutation(({ input }) => admin.setStock(input.id, input.stock)),
    setFeatured: adminQuery.input(z.object({ id: z.number(), featured: z.boolean() })).mutation(({ input }) => admin.setFeatured(input.id, input.featured)),
    users: adminQuery.query(() => admin.listUsersAdmin()),
  }),
});

export type AppRouter = typeof appRouter;
