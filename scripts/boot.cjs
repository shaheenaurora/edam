// Boot wrapper: optionally seeds a sign-in code (BOOTSTRAP_CODE env var) for
// the email in BOOTSTRAP_EMAIL, then starts the app.
// Exists because Railway runs startCommand without a shell, so chains like
// `a && b` and env prefixes are not interpreted — everything happens here.
const { spawn } = require("node:child_process");

async function maybeSeedLoginCode() {
  if (!process.env.BOOTSTRAP_CODE) return;
  const crypto = require("node:crypto");
  const mysql = require("mysql2/promise");
  const email = (process.env.BOOTSTRAP_EMAIL || "edamhospitality2026@gmail.com").toLowerCase();
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  await conn.execute(
    "INSERT INTO loginCodes (email, code, expiresAt) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))",
    [email, crypto.createHash("sha256").update(process.env.BOOTSTRAP_CODE).digest("hex")],
  );
  await conn.end();
  console.log(`[boot] login code for ${email}: ${process.env.BOOTSTRAP_CODE} (expires in 10 min)`);
}

async function maybePushSchema() {
  if (process.env.BOOTSTRAP_DDL !== "1") return;
  await new Promise((resolve, reject) => {
    const child = spawn("npx", ["drizzle-kit", "push", "--force"], { stdio: "inherit" });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`drizzle-kit push exited ${code}`))));
  });
  console.log("[boot] schema push done");
}

maybePushSchema()
  .then(maybeSeedLoginCode)
  .then(() => {
    const child = spawn("npm", ["start"], { stdio: "inherit" });
    child.on("exit", (code) => process.exit(code ?? 0));
  })
  .catch((e) => {
    console.error("[boot]", e.message);
    process.exit(1);
  });
