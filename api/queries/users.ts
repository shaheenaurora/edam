import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function findUserByEmail(email: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.trim().toLowerCase()))
    .limit(1);
  return rows.at(0);
}

function isAdmin(email: string): boolean {
  return env.adminEmails.includes(email.trim().toLowerCase());
}

/** Insert or touch a user identified by email. Admin allowlist grants the role. */
export async function upsertUserByEmail(data: {
  unionId: string;
  email: string;
  name: string | null;
}) {
  const email = data.email.trim().toLowerCase();
  const role = isAdmin(email) ? ("admin" as const) : ("user" as const);
  await getDb()
    .insert(schema.users)
    .values({ unionId: data.unionId, email, name: data.name, role, lastSignInAt: new Date() })
    .onDuplicateKeyUpdate({
      set: { email, role, lastSignInAt: new Date() },
    });
}
