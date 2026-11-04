// Bootstrap helper: insert a sign-in code directly so an admin can log in
// when mail delivery (MAIL_WEBHOOK_URL) is not configured yet.
// The code behaves like a normal one: single-use, 10-minute expiry.
// Usage: BOOTSTRAP_CODE=274910 node scripts/make-login-code.js
const crypto = require("node:crypto");
const mysql = require("mysql2/promise");

const email = (process.env.BOOTSTRAP_EMAIL || "edamhospitality2026@gmail.com").toLowerCase();
const code = process.env.BOOTSTRAP_CODE || String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

(async () => {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  await conn.execute(
    "INSERT INTO loginCodes (email, code, expiresAt) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))",
    [email, crypto.createHash("sha256").update(code).digest("hex")],
  );
  await conn.end();
  console.log(`Login code for ${email}: ${code} (expires in 10 minutes)`);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
