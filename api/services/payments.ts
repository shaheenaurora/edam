import { createHmac } from "node:crypto";

/**
 * Razorpay payment layer — env-gated, zero code changes to go live.
 *
 * Set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET in the environment and online
 * payment (UPI, cards, netbanking, wallets — one Razorpay checkout) switches
 * on across the storefront. Without keys the storefront simply never shows
 * the option, and COD/manual-UPI keep working.
 *
 * Security model:
 *  - Amounts are always computed server-side from DB prices.
 *  - Payment success is accepted only with a valid HMAC-SHA256 signature
 *    (checkout callback) or webhook signature (server-to-server).
 */

const KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";

export function razorpayConfigured() {
  return KEY_ID.length > 0 && KEY_SECRET.length > 0;
}

export function razorpayKeyId() {
  return KEY_ID; // the key *id* is public by design (it ships in Razorpay checkout.js)
}

export async function createRazorpayOrder(amountInr: number, receipt: string, notes?: Record<string, string>) {
  if (!razorpayConfigured()) throw new Error("Online payments are not configured yet.");
  const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Basic ${auth}` },
    body: JSON.stringify({
      amount: Math.round(amountInr * 100), // paise
      currency: "INR",
      receipt,
      notes: notes ?? {},
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay order creation failed: ${res.status} ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { id: string; amount: number; currency: string };
  return data;
}

/** Verify the checkout handler callback: signature = HMAC(order_id + "|" + payment_id). */
export function verifyCheckoutSignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string) {
  if (!razorpayConfigured()) return false;
  const expected = createHmac("sha256", KEY_SECRET).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
  return expected === signature;
}

/** Verify a server-to-server webhook body against X-Razorpay-Signature. */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  if (!razorpayConfigured()) return false;
  const expected = createHmac("sha256", KEY_SECRET).update(rawBody).digest("hex");
  return expected === signature;
}
