import { desc, eq } from "drizzle-orm";
import { notifications } from "@db/schema";
import { getDb } from "../queries/connection";

/**
 * Notification outbox.
 *
 * Nothing the customer is owed (order confirmation, shipping updates) is ever
 * "best effort console.log" — it lands in the outbox first. Delivery is
 * pluggable: set MAIL_WEBHOOK_URL (any email-capable webhook — Resend hook,
 * Zapier/Make catch, an internal mailer) and queued mail is POSTed there;
 * without it, mail stays visibly "queued" in admin instead of vanishing.
 */

const MAIL_WEBHOOK_URL = process.env.MAIL_WEBHOOK_URL ?? "";

async function flushNotification(id: number) {
  if (!MAIL_WEBHOOK_URL) return; // stays queued, visible in admin
  const db = getDb();
  const n = await db.query.notifications.findFirst({ where: (t, { eq }) => eq(t.id, id) });
  if (!n) return;
  try {
    const res = await fetch(MAIL_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ to: n.toEmail, subject: n.subject, text: n.body, kind: n.kind }),
      signal: AbortSignal.timeout(8000),
    });
    await db
      .update(notifications)
      .set({ status: res.ok ? "sent" : "failed", sentAt: new Date() })
      .where(eq(notifications.id, id));
  } catch {
    await db.update(notifications).set({ status: "failed" }).where(eq(notifications.id, id));
  }
}

export async function queueNotification(kind: string, toEmail: string, subject: string, body: string) {
  const result = await getDb().insert(notifications).values({ kind, toEmail, subject, body });
  const id = Number(result[0].insertId);
  void flushNotification(id); // intentionally not awaited
  return id;
}

export function mailerConfigured() {
  return MAIL_WEBHOOK_URL.length > 0;
}

export async function listNotifications(limit = 60) {
  return getDb().select().from(notifications).orderBy(desc(notifications.id)).limit(limit);
}

/* ---------------- Templates ---------------- */

export function orderConfirmationMail(input: {
  orderNo: string;
  name: string;
  total: number;
  treeNos: string[];
  isGift: boolean;
}) {
  const trees = input.treeNos.join(", ");
  return {
    subject: `Order ${input.orderNo} — thank you, ${input.name.split(" ")[0]}`,
    body: [
      `Dear ${input.name},`,
      ``,
      `Your order ${input.orderNo} (₹${input.total}) is placed and being packed in Thrissur.`,
      input.isGift ? `It's marked as a gift — no invoice inside, your note hand-written on seed paper.` : null,
      ``,
      `This order planted ${input.treeNos.length} tree${input.treeNos.length > 1 ? "s" : ""}: ${trees}.`,
      `Track them any time on the public ledger: /ledger`,
      ``,
      `Rooted in truth,`,
      `Team Edam`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export function orderStatusMail(input: { orderNo: string; name: string; status: string }) {
  const lines: Record<string, string> = {
    packed: "is packed and waiting for the courier",
    shipped: "is on its way",
    delivered: "has been delivered. We hope it earns its place in your home",
    cancelled: "has been cancelled. If you didn't ask for this, reply to this mail",
  };
  return {
    subject: `Order ${input.orderNo} ${input.status}`,
    body: [
      `Dear ${input.name},`,
      ``,
      `Your order ${input.orderNo} ${lines[input.status] ?? `is now "${input.status}"`}.`,
      ``,
      `Rooted in truth,`,
      `Team Edam`,
    ].join("\n"),
  };
}
