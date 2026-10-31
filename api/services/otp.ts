import { createHash, randomInt, randomUUID } from "node:crypto";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "../queries/connection";
import { findUserByEmail, upsertUserByEmail } from "../queries/users";
import { signSessionToken } from "./session";
import { queueNotification } from "./notify";

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

// Codes are stored hashed, like passwords. A database read should never be
// enough to log in as someone.
function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function issueLoginCode(rawEmail: string): Promise<void> {
  const email = rawEmail.trim().toLowerCase();
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await getDb().insert(schema.loginCodes).values({
    email,
    code: hashCode(code),
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  });

  await queueNotification(
    "login_code",
    email,
    `Your Edam sign-in code: ${code}`,
    [
      `Hello,`,
      ``,
      `Your Edam sign-in code is ${code}. It expires in 10 minutes.`,
      ``,
      `If you didn't ask for this, you can ignore the email. No one can sign in without it.`,
      ``,
      `Edam, Thrissur`,
    ].join("\n"),
  );
}

export class LoginError extends Error {}

/**
 * Verifies the latest unused, unexpired code for the email. Single-use,
 * attempt-capped. On success returns the session token and the user.
 */
export async function verifyLoginCode(
  rawEmail: string,
  rawCode: string,
): Promise<{ token: string; user: schema.User }> {
  const email = rawEmail.trim().toLowerCase();
  const code = rawCode.trim();

  const rows = await getDb()
    .select()
    .from(schema.loginCodes)
    .where(
      and(
        eq(schema.loginCodes.email, email),
        isNull(schema.loginCodes.usedAt),
        gt(schema.loginCodes.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(schema.loginCodes.createdAt))
    .limit(1);

  const row = rows.at(0);
  if (!row) {
    throw new LoginError("No active code for this email. Request a fresh one.");
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    throw new LoginError("Too many tries. Request a fresh code.");
  }

  if (row.code !== hashCode(code)) {
    await getDb()
      .update(schema.loginCodes)
      .set({ attempts: row.attempts + 1 })
      .where(eq(schema.loginCodes.id, row.id));
    throw new LoginError("That code doesn't match. Check the email and try again.");
  }

  await getDb()
    .update(schema.loginCodes)
    .set({ usedAt: new Date() })
    .where(eq(schema.loginCodes.id, row.id));

  const existing = await findUserByEmail(email);
  const userId = existing?.unionId ?? `email:${randomUUID()}`;
  await upsertUserByEmail({ unionId: userId, email, name: existing?.name ?? null });

  const user = await findUserByEmail(email);
  if (!user) throw new LoginError("Sign-in failed. Please try again.");

  const token = await signSessionToken({ unionId: user.unionId });
  return { token, user };
}
