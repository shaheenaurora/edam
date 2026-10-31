import { desc } from "drizzle-orm";
import { auditLog } from "@db/schema";
import { getDb } from "../queries/connection";

/** Every privileged mutation leaves a line here — who did what, when. */
export async function recordAudit(actorName: string, action: string, detail?: string) {
  await getDb()
    .insert(auditLog)
    .values({ actorName, action, detail: detail ?? null });
}

export async function listAudit(limit = 40) {
  return getDb().select().from(auditLog).orderBy(desc(auditLog.id)).limit(limit);
}
