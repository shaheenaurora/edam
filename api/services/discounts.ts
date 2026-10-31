import { eq, sql } from "drizzle-orm";
import { discounts, type Discount } from "@db/schema";
import { getDb } from "../queries/connection";

/**
 * Discount engine. All validation happens server-side against database prices;
 * the storefront's "apply code" is only a preview of what this module decides.
 */

export interface DiscountCheck {
  ok: boolean;
  reason?: string;
  discount?: Discount;
  amount: number; // INR off
}

export async function checkDiscount(code: string, subtotal: number): Promise<DiscountCheck> {
  const db = getDb();
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, reason: "Enter a code first.", amount: 0 };

  const discount = await db.query.discounts.findFirst({ where: (t, { eq }) => eq(t.code, normalized) });
  if (!discount || !discount.active) return { ok: false, reason: "That code isn't valid.", amount: 0 };
  if (discount.expiresAt && discount.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "That code has expired.", amount: 0 };
  }
  if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
    return { ok: false, reason: "That code has been fully used.", amount: 0 };
  }
  if (subtotal < discount.minSubtotal) {
    return { ok: false, reason: `This code needs a subtotal of at least ₹${discount.minSubtotal}.`, amount: 0 };
  }

  const raw = discount.kind === "percent" ? Math.floor((subtotal * discount.value) / 100) : discount.value;
  const amount = Math.min(raw, subtotal); // never discount below zero
  return { ok: true, discount, amount };
}

export async function redeemDiscount(discountId: number) {
  await getDb()
    .update(discounts)
    .set({ usedCount: sql`${discounts.usedCount} + 1` })
    .where(eq(discounts.id, discountId));
}

/* ---------------- Admin ---------------- */

export async function listDiscounts() {
  return getDb().select().from(discounts).orderBy(discounts.code);
}

export async function createDiscount(input: {
  code: string;
  kind: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  maxUses: number | null;
  expiresAt: Date | null;
}) {
  const db = getDb();
  const code = input.code.trim().toUpperCase();
  const existing = await db.query.discounts.findFirst({ where: (t, { eq }) => eq(t.code, code) });
  if (existing) throw new Error(`Code ${code} already exists.`);
  await db.insert(discounts).values({
    code,
    kind: input.kind,
    value: input.value,
    minSubtotal: input.minSubtotal,
    maxUses: input.maxUses,
    expiresAt: input.expiresAt,
    active: true,
  });
  return { ok: true };
}

export async function setDiscountActive(id: number, active: boolean) {
  await getDb().update(discounts).set({ active }).where(eq(discounts.id, id));
  return { ok: true };
}

export async function deleteDiscount(id: number) {
  await getDb().delete(discounts).where(eq(discounts.id, id));
  return { ok: true };
}
