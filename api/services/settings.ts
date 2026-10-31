import { eq } from "drizzle-orm";
import { settings } from "@db/schema";
import { getDb } from "../queries/connection";

/**
 * Store settings: operator-editable key-values with hard-coded fallbacks.
 * The server is authoritative — the storefront only ever *displays* these;
 * every rupee is recomputed here at order time.
 */

export interface StoreSettings {
  freeShippingAbove: number;
  shippingFee: number;
  upiId: string;
  supportEmail: string;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  freeShippingAbove: 1499,
  shippingFee: 79,
  upiId: "",
  supportEmail: "hello@edam.in",
};

export async function getSettings(): Promise<StoreSettings> {
  const db = getDb();
  const rows = await db.select().from(settings);
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const num = (k: string, fallback: number) => {
    const raw = map.get(k);
    const n = raw ? Number(JSON.parse(raw)) : NaN;
    return Number.isFinite(n) ? n : fallback;
  };
  const str = (k: string, fallback: string) => {
    const raw = map.get(k);
    return raw ? String(JSON.parse(raw)) : fallback;
  };
  return {
    freeShippingAbove: num("freeShippingAbove", DEFAULT_SETTINGS.freeShippingAbove),
    shippingFee: num("shippingFee", DEFAULT_SETTINGS.shippingFee),
    upiId: str("upiId", DEFAULT_SETTINGS.upiId),
    supportEmail: str("supportEmail", DEFAULT_SETTINGS.supportEmail),
  };
}

export async function setSettings(patch: Partial<StoreSettings>) {
  const db = getDb();
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    const encoded = JSON.stringify(value);
    const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    if (existing.length) {
      await db.update(settings).set({ value: encoded }).where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({ key, value: encoded });
    }
  }
  return getSettings();
}
