import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { eq } from "drizzle-orm";
import { orders } from "@db/schema";
import { getDb } from "../queries/connection";
import { verifyWebhookSignature, razorpayConfigured } from "../services/payments";
import { dispatchEvent } from "../services/webhooks";
import { log } from "../lib/logger";

/**
 * Inbound payment webhooks (Razorpay → us). Server-to-server: the ONLY
 * trusted signal that money moved. Registered in boot.ts above the 404
 * catch-all; bodyLimit is scoped to this route on purpose.
 */
export const paymentWebhookRoutes = new Hono();

paymentWebhookRoutes.post(
  "/razorpay",
  bodyLimit({ maxSize: 256 * 1024, onError: (c) => c.body(null, 413) }),
  async (c) => {
    if (!razorpayConfigured()) return c.json({ error: "payments not configured" }, 400);

    const rawBody = await c.req.text();
    const signature = c.req.header("x-razorpay-signature") ?? "";
    if (!verifyWebhookSignature(rawBody, signature)) {
      log.warn("razorpay webhook signature mismatch");
      return c.json({ error: "invalid signature" }, 400);
    }

    let body: {
      event?: string;
      payload?: { payment?: { entity?: { id?: string; notes?: { orderNo?: string } } } };
    };
    try {
      body = JSON.parse(rawBody);
    } catch {
      return c.json({ error: "invalid json" }, 400);
    }

    const payment = body.payload?.payment?.entity;
    const orderNo = payment?.notes?.orderNo;

    if ((body.event === "payment.captured" || body.event === "payment.failed") && orderNo && payment?.id) {
      const db = getDb();
      const [order] = await db.select().from(orders).where(eq(orders.orderNo, orderNo)).limit(1);
      if (order) {
        const paymentStatus = body.event === "payment.captured" ? "paid" : "failed";
        await db.update(orders).set({ paymentStatus, paymentRef: payment.id }).where(eq(orders.orderNo, orderNo));
        void dispatchEvent(body.event === "payment.captured" ? "payment.paid" : "payment.failed", {
          orderNo,
          paymentRef: payment.id,
          total: order.total,
        });
      }
    }
    // Always 200 on a verified call — Razorpay retries non-2xx aggressively.
    return c.json({ ok: true });
  },
);
