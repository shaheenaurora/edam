import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { authRouter } from "./auth-router";
import * as store from "./queries/store";

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
});

export type AppRouter = typeof appRouter;
