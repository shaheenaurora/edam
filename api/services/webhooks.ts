import { createHmac, randomBytes } from "node:crypto";
import { desc, eq, sql } from "drizzle-orm";
import { webhookDeliveries, webhookEndpoints } from "@db/schema";
import { getDb } from "../queries/connection";

/**
 * Outbound webhooks — the integration hub.
 *
 * Every meaningful store event is fanned out to registered endpoints as a
 * POST with a JSON body and an `X-Edam-Signature` header:
 *   HMAC-SHA256(secret, rawBody), hex-encoded.
 * Receivers verify it the same way Razorpay/Stripe signatures are verified.
 * Deliveries are persisted first, then attempted, so nothing is ever lost
 * silently — failures are visible and retryable from the admin.
 */

export const WEBHOOK_EVENTS = [
  "order.placed",
  "order.status_changed",
  "order.cancelled",
  "payment.paid",
  "payment.failed",
] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export function signPayload(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

async function attemptDelivery(deliveryId: number) {
  const db = getDb();
  const delivery = await db.query.webhookDeliveries.findFirst({ where: (t, { eq }) => eq(t.id, deliveryId) });
  if (!delivery) return;
  const endpoint = await db.query.webhookEndpoints.findFirst({ where: (t, { eq }) => eq(t.id, delivery.endpointId) });
  if (!endpoint) return;

  const body = delivery.payload;
  try {
    const res = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-edam-event": delivery.event,
        "x-edam-signature": signPayload(endpoint.secret, body),
        "x-edam-delivery": String(delivery.id),
      },
      body,
      signal: AbortSignal.timeout(8000),
    });
    await db
      .update(webhookDeliveries)
      .set({
        status: res.ok ? "success" : "failed",
        attempts: delivery.attempts + 1,
        responseCode: res.status,
        lastError: res.ok ? null : `HTTP ${res.status}`,
        deliveredAt: new Date(),
      })
      .where(eq(webhookDeliveries.id, deliveryId));
  } catch (err) {
    await db
      .update(webhookDeliveries)
      .set({
        status: "failed",
        attempts: delivery.attempts + 1,
        lastError: err instanceof Error ? err.message.slice(0, 480) : "network error",
        deliveredAt: new Date(),
      })
      .where(eq(webhookDeliveries.id, deliveryId));
  }
}

/**
 * Persist + fan out an event. Fire-and-forget by design: the caller's request
 * must not wait on (or fail because of) someone else's server.
 */
export async function dispatchEvent(event: WebhookEvent, data: Record<string, unknown>) {
  const db = getDb();
  const endpoints = await db.select().from(webhookEndpoints).where(eq(webhookEndpoints.active, true));
  const interested = endpoints.filter((e) => {
    try {
      const events = JSON.parse(e.events) as string[];
      return events.includes(event) || events.includes("*");
    } catch {
      return false;
    }
  });
  for (const endpoint of interested) {
    const payload = JSON.stringify({ event, occurredAt: new Date().toISOString(), data });
    const result = await db
      .insert(webhookDeliveries)
      .values({ endpointId: endpoint.id, event, payload, status: "pending" });
    const deliveryId = Number(result[0].insertId);
    void attemptDelivery(deliveryId); // intentionally not awaited
  }
}

/* ---------------- Admin ---------------- */

export async function listEndpoints() {
  const db = getDb();
  const rows = await db.select().from(webhookEndpoints).orderBy(desc(webhookEndpoints.id));
  return rows.map((e) => ({ ...e, secret: e.secret.slice(0, 6) + "…" }));
}

export async function createEndpoint(url: string, events: string[]) {
  const secret = "whsec_" + randomBytes(18).toString("hex");
  const result = await getDb()
    .insert(webhookEndpoints)
    .values({ url, secret, events: JSON.stringify(events), active: true });
  // The full secret is returned exactly once — like Shopify/Stripe signing secrets.
  return { id: Number(result[0].insertId), secret };
}

export async function setEndpointActive(id: number, active: boolean) {
  await getDb().update(webhookEndpoints).set({ active }).where(eq(webhookEndpoints.id, id));
  return { ok: true };
}

export async function deleteEndpoint(id: number) {
  const db = getDb();
  await db.delete(webhookDeliveries).where(eq(webhookDeliveries.endpointId, id));
  await db.delete(webhookEndpoints).where(eq(webhookEndpoints.id, id));
  return { ok: true };
}

export async function listDeliveries(limit = 60) {
  const db = getDb();
  const rows = await db
    .select({
      id: webhookDeliveries.id,
      event: webhookDeliveries.event,
      status: webhookDeliveries.status,
      attempts: webhookDeliveries.attempts,
      responseCode: webhookDeliveries.responseCode,
      lastError: webhookDeliveries.lastError,
      createdAt: webhookDeliveries.createdAt,
      deliveredAt: webhookDeliveries.deliveredAt,
      url: webhookEndpoints.url,
    })
    .from(webhookDeliveries)
    .leftJoin(webhookEndpoints, eq(webhookDeliveries.endpointId, webhookEndpoints.id))
    .orderBy(desc(webhookDeliveries.id))
    .limit(limit);
  return rows;
}

export async function retryDelivery(id: number) {
  const db = getDb();
  await db.update(webhookDeliveries).set({ status: "pending" }).where(eq(webhookDeliveries.id, id));
  await attemptDelivery(id);
  return { ok: true };
}

export async function sendTestPing(endpointId: number) {
  const db = getDb();
  const endpoint = await db.query.webhookEndpoints.findFirst({ where: (t, { eq }) => eq(t.id, endpointId) });
  if (!endpoint) throw new Error("Endpoint not found");
  const payload = JSON.stringify({
    event: "ping",
    occurredAt: new Date().toISOString(),
    data: { message: "Edam webhook handshake — if you can read this, the wire works." },
  });
  const result = await db
    .insert(webhookDeliveries)
    .values({ endpointId, event: "ping", payload, status: "pending" });
  await attemptDelivery(Number(result[0].insertId));
  return { ok: true };
}

/** Used by the stats card: pending+failed deliveries in the last day. */
export async function countUnhealthyDeliveries() {
  const db = getDb();
  const [row] = await db
    .select({ n: sql<number>`COUNT(*)` })
    .from(webhookDeliveries)
    .where(eq(webhookDeliveries.status, "failed"));
  return Number(row?.n ?? 0);
}
