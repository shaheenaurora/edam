# Edam

Rooted in truth. An eco-conscious hospitality and D2C store from Thrissur, Kerala: every product names its maker, every order plants a tree, and the ledger is public.

Full-stack storefront and admin:

- **Storefront** — catalogue across five ranges (Nourish, Care, Dwell, Grow, Give), cart, checkout, build-your-own hamper, gifting, tree ledger with public batch and survival reporting, journal, maker stories
- **Admin** — orders, customers, trees, stock, subscribers, discount codes, integrations, store settings, audit log
- **Backend** — server-authoritative pricing, discount engine, Razorpay-ready payments (signature-verified checkout + inbound webhook), outbound webhook hub with signed deliveries and retry, notification outbox, cancellation with stock restore

## Stack

React 19 + TypeScript + Vite + Tailwind + shadcn/ui on the front; Hono + tRPC 11 + Drizzle ORM + MySQL on the back. Kimi OAuth for accounts and admin.

## Develop

```bash
npm install
cp .env.example .env   # fill in values
npm run db:push        # sync schema to your MySQL
npx tsx db/seed.ts     # catalogue, makers, tree batches, journal
npm run dev            # http://localhost:3000
```

Useful scripts: `npm run check` (types), `npm run test`, `npm run build`, `npm start` (production).

## Deploy to Railway

The repo ships with `railway.toml`; Railway builds with Nixpacks and starts with `npm start`.

1. **Create the project.** Railway → New Project → Deploy from GitHub repo → pick `edam`.
2. **Add MySQL.** In the same project: New → Database → MySQL.
3. **Set variables** on the app service (Variables tab). Required:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | `${{MySQL.MYSQL_URL}}` (reference the MySQL service) |
   | `APP_ID` / `APP_SECRET` | your app credentials |
   | `KIMI_AUTH_URL` / `KIMI_OPEN_URL` | Kimi platform URLs |
   | `VITE_KIMI_AUTH_URL` / `VITE_APP_ID` | same auth URL / app id, for the browser bundle |
   | `OWNER_UNION_ID` | union id of the account that should become admin on first login |

   Optional, enable when ready: `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` (turns on online UPI/card checkout), `MAIL_WEBHOOK_URL` (delivers queued notification mail).

4. **Generate a public domain** under Settings → Networking.
5. **Seed the database** once, from your machine or Railway's shell:

   ```bash
   railway run npx tsx db/seed.ts
   ```

   The seed is idempotent (upserts by slug), safe to re-run.

Deploys trigger automatically on every push to `main`. Health check: `/api/health`.

## Notes

- The build produces a self-contained bundle at `dist/boot.js`; production needs only `dist/`, `package.json`, and env vars.
- Razorpay webhook URL, once keys are set: `https://<your-domain>/api/webhooks/razorpay`.
- `.env` is never committed; keep all secrets in Railway variables.
