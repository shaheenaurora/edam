// Stock movement ledger: one row per stock change, whoever made it.
// Written by checkout, order cancellation, and admin actions; read by the
// admin "Movements" page.
import { desc, eq } from "drizzle-orm";
import { stockMovements } from "@db/schema";
import { getDb } from "./connection";

export type StockReason =
  | "sale"
  | "manual"
  | "restock"
  | "adjust"
  | "order_cancelled"
  | "order_reopened"
  | "create"
  | "delete";

export async function recordStockMovement(entry: {
  productId: number;
  productName: string;
  delta: number;
  resultingStock: number;
  reason: StockReason;
  note?: string | null;
  actor: string;
}) {
  await getDb().insert(stockMovements).values({ ...entry, note: entry.note ?? null });
}

export async function listStockMovements(productId?: number) {
  return getDb()
    .select()
    .from(stockMovements)
    .where(productId ? eq(stockMovements.productId, productId) : undefined)
    .orderBy(desc(stockMovements.id))
    .limit(200);
}
