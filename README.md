# ShopEasy — E-commerce Store

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Free & open-source.** A complete, ready-to-run online store you can download, run on your own computer, launch on the internet, and keep managing — all from a simple admin panel. No coding needed to run or manage it.

> 🛍️ **Live demo:** https://ecommerce-store-shop-easy.vercel.app/

- **Storefront** — home page, 108 demo products in 9 categories, search + filters, product pages with galleries, full shopping cart, checkout
- **Typing-based live search** — instant product & category suggestions as you type (keyboard-friendly)
- **Admin dashboard** — manage products, stock, order statuses, and customers
- **Accounts** — email/password login plus **passwordless email OTP** sign-in
- **Payments** — Razorpay (UPI / cards / net banking), optional demo mode without keys, plus **Cash on Delivery**
- **Real inventory** — per-product stock, auto-decremented on orders, never oversells
- **Email** — OTP login codes and **order confirmation receipts** (free via Brevo, 300 emails/day)
- **Secure** — hashed passwords, httpOnly cookies, rotating session tokens, server-side price checks
- **Re-brandable** — store name, colors, and pricing controlled from one settings file
- **Light & dark theme** — one-click header toggle, remembered per visitor
- **Self-service order cancellation** — customers can cancel pending/processing orders from My Orders; stock is restored automatically
- **Wishlist hearts** — save products from any product card (stored in the browser)

## Quick start (5 minutes)

1. Install **Node.js** (https://nodejs.org, LTS version)
2. Install **MongoDB** (https://www.mongodb.com/try/download/community) — or use a free cloud database at https://www.mongodb.com/atlas
3. Download this repo (ZIP, or `git clone`), then:

```sh
npm install
copy .env.example .env     # Windows — or:  cp .env.example .env  (Mac/Linux)
npm run dev
```

4. Open the `.env` file and set `JWT_SECRET` (see below), `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.

```sh
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"   # paste the output into JWT_SECRET
```

Open http://localhost:5173 for the store. The admin panel is a **separate app** in the `admin-app/` folder (run `npm install && npm run dev` inside it, or deploy it on its own); admins are auto-redirected there from the storefront after signing in.

> **Your secrets stay private.** Everything personal (database address, email key, payment keys, admin password) lives in your local `.env` file, which is **never uploaded** to GitHub — so the open-source code never exposes your keys. Anyone who clones the repo uses their own keys from `.env.example`. Full explanation: [DOCUMENTATION.md](DOCUMENTATION.md) → *Part 3*.

## Where to find your own free keys (optional)

| Service | What it's for | Where to get it |
| --- | --- | --- |
| Brevo | Email OTP + order receipts (300/day free) | brevo.com → Settings → API Keys |
| Razorpay | Online payments (optional) | dashboard.razorpay.com → API Keys |
| MongoDB Atlas | Cloud database (optional) | mongodb.com/atlas → free cluster |

## Documentation

- **[DOCUMENTATION.md](DOCUMENTATION.md)** — everything:
  - **Part 1** — every feature explained in plain English (what / how / benefit)
  - **Part 2** — run it yourself, step by step
  - **Part 3** — how your secrets stay secret
  - **Part 4+** — full technical reference: architecture, data models, API endpoints, deployment

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the store + API together (http://localhost:5173) |
| `npm run dev:web` | Storefront only |
| `npm run dev:api` | API only (with auto-restart) |
| `npm run build` | Builds the storefront for production |
| `npm run start` | Runs in production mode (serves the built store) |
| `npm run lint` | Checks code quality |

## Security & acknowledgments

ShopEasy takes security seriously. Thank you to the researchers who report issues responsibly.

- **Mrutyunjaya Jena** ([@mrutyunjaya-jena](https://github.com/mrutyunjaya-jena)) — reported the unauthenticated order-creation vulnerability on `POST /api/orders` (CWE-306). Fixed: order creation now requires authentication and is rate-limited.

## License

[MIT](LICENSE) — free to use, modify, and share.
