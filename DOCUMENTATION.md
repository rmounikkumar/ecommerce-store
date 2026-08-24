# ShopEasy — Complete Project Documentation

**One line:** ShopEasy is a complete online store — **free, open-source, and ready to run** on your own computer or live on the internet. After it's running (or even after it's live), you keep managing products, prices, stock, and orders from a simple admin panel. No coding needed to run or manage the store.

**Two ways to read this document:**

- **Everyone (no coding needed)** → **Part 1** explains every feature in plain English, **Part 2** gets the store running in about 5 minutes, and **Part 3** explains how your private keys stay secret.
- **Developers** → **Part 4 onwards** is the full technical reference (architecture, data models, every API endpoint, deployment).

---

## PART 1 — FEATURE GUIDE (plain English)

For every feature you get three things: **What it does** → **How it works** → **Why it's useful.**

### 🛍️ A. The storefront — what your customers see

#### A1. Home page
- **What it does:** A complete landing page — brand banner, a big hero offer, clickable category tiles, deals of the day, new arrivals, bestsellers, a newsletter signup box, and About/Contact/Legal sections.
- **How it works:** Every section is data-driven: products, prices, and photos come from the database, so the page updates by itself whenever you add or change products. Nothing is hand-written per product.
- **Why it's useful:** Your store looks finished and trustworthy from the first minute. You can also re-brand everything (store name, logo, tagline, colors) from one settings file.

#### A2. Product catalog (108 demo products, 9 categories)
- **What it does:** Comes pre-loaded with 108 ready-made products across 9 categories — Mobiles, Electronics, Fashion, Footwear, Home & Kitchen, Appliances, Beauty & Grooming, Sports & Fitness, Toys & Books. Cards are clean and image-focused: photo, discount badge, wishlist heart, name, and price.
- **How it works:** The products live in the database and fill automatically on first start. Cards keep a consistent size and alignment; hovering gives a small lift with a soft glow and a slight image zoom. On desktop, the shop page also offers a list layout toggle (mobile always uses the grid for the best fit).
- **Why it's useful:** You can demo or launch instantly with a modern, professional-looking catalog, then edit prices/products whenever you like — or clear the catalog and add your own.

#### A3. Search, filters, and sorting
- **What it does:** Customers can search by name, and filter by category, price range, brand, rating, discount, and availability (in stock / out of stock). They can sort by popularity, price, newest, or rating, and switch between a grid and a list view.
- **How it works:** The search box and filters run instantly in the browser against the product data.
- **Why it's useful:** On a big catalog, customers find what they want in seconds — which means more completed purchases.

#### A4. Product detail page
- **What it does:** For each product: a photo gallery with multiple images, the price with the crossed-out MRP and discount %, offers, availability ("In Stock (N available)" or "Out of Stock"), highlights, and "recommended for you" products below.
- **How it works:** The page loads the product from the database and builds the gallery/offers/ratings automatically.
- **Why it's useful:** Customers see everything they need to decide (price, offers, availability, photos) on one page, and relevant recommendations encourage buying more.

#### A5. Shopping cart
- **What it does:** A full cart page with quantity steppers, remove buttons, a price breakdown (MRP, discount, savings, delivery), a free-delivery progress bar, and a sticky total card.
- **How it works:** **Two modes.** If the customer is signed in, the cart is saved on the server (it follows them across devices). If they're browsing as a guest, the cart is saved on their device and automatically merged into their account when they sign in.
- **Why it's useful:** Guests can shop without forcing an account (fewer abandoned carts), and signed-in customers never lose their cart. Stock limits are enforced at every step.

#### A6. Checkout
- **What it does:** A shipping-address form, a payment method choice (**Pay Online** or **Cash on Delivery**), then order placement.
- **How it works:** The customer fills in their name/address/phone and picks how to pay. Prices are **recalculated on the server** (the customer can't change them). With "Pay Online", the Razorpay popup opens (UPI, cards, net banking) — or, if no payment keys are set, orders are placed directly in demo mode. With "Cash on Delivery", the order is placed instantly with no gateway.
- **Why it's useful:** A trustworthy, secure checkout that always charges the correct amount — and gives customers the COD option most Indian shoppers expect.

#### A7. Order confirmation & history
- **What it does:** After ordering, customers see a confirmation page with the order summary and address. A "My Orders" page lists all their orders, with a **Cancel Order** button for pending/processing orders and a "Pay Now" button if an online payment is still pending.
- **How it works:** Orders are stored in the database per customer. Cancelling is confirmed with one click, the items go back to stock automatically, and cancelled orders show a clear "Cancelled" view (with refund information if the order was already paid).
- **Why it's useful:** Customers can track what they bought, finish a missed payment, or cancel by themselves — less confusion and fewer support questions.

### 🔐 B. Accounts & security

#### B1. Register, login, logout
- **What it does:** Standard account creation (name, email, password), sign-in, and sign-out.
- **How it works:** Passwords are scrambled (hashed) before storing — the app never keeps readable passwords. Session is kept in secure browser cookies.
- **Why it's useful:** Simple and safe — even if the database were ever exposed, passwords couldn't be read.

#### B2. Email OTP sign-in (no password needed)
- **What it does:** Customers can sign in with just their email: they request a code, receive a 6-digit code by email, type it in, and they're in.
- **How it works:** The code is emailed using Brevo (a free email service — up to 300 emails a day, no website domain needed) and expires in 5 minutes.
- **Why it's useful:** No password to remember or forget; a faster, modern login option that reduces "forgot password" problems.

#### B3. Profile & password change
- **What it does:** Customers can edit their name/email/phone and change their password (old password required).
- **Why it's useful:** Customers stay in control of their account.

#### B4. Customer vs Admin roles
- **What it does:** Two account types. Customers shop and manage their own orders. Admins get a separate admin panel for the whole store.
- **How it works:** Every protected action is checked server-side — a normal customer cannot reach admin features, even if they type a URL directly.
- **Why it's useful:** Only the store owner can change products, orders, or customers. Safe by design, not just by hiding buttons.

#### B5. Secret protection (your private keys)
- **What it does:** Your database address, email key, payment keys, and admin password all live in one private file (`.env`) that is **never uploaded** to GitHub and never part of the open-source code.
- **How it works:** See **Part 3** for the full explanation.
- **Why it's useful:** The project is open source — anyone can download the code — but **only you** ever see your private keys. Everyone else must use their own.

### 💳 C. Payments (Razorpay)

#### C1. Online payments — optional
- **What it does:** Accepts UPI, credit/debit cards, and net banking through Razorpay (the popular Indian payment gateway).
- **How it works:** Payments are switched on by adding free test keys (or paid live keys). Every payment is verified on the server with a cryptographic signature before the order is marked paid.
- **Why it's useful:** You control whether the store takes real money or runs as a demo. It works either way — with keys = real checkout, without keys = "place order" demo mode.

#### C2. Cash on Delivery (COD)
- **What it does:** Customers can choose to pay in cash when the order arrives instead of paying online.
- **How it works:** At checkout the customer picks "Pay Online" or "Cash on Delivery". COD orders skip the payment gateway entirely: they are stored with payment method `cod` (unpaid) and move straight to **Processing**. The confirmation page shows a "Cash on Delivery" badge and reminds the customer to keep the exact amount ready. Admins collect the cash at delivery and mark the order **Delivered** from the admin panel.
- **Why it's useful:** Most Indian shoppers expect COD — it builds trust and reaches customers who don't use online payments. If a COD order is cancelled before delivery, stock is restored automatically and nothing was ever charged.

### 📦 D. Real inventory (stock) tracking

#### D1. Live stock per product
- **What it does:** Every product has a stock count you set from the admin panel.
- **How it works:** The storefront shows real availability ("In Stock (N available)" / "Only 2 left!" / "Out of Stock"). Adding too many to the cart is blocked, and placing an order **automatically reduces the stock number**. If a product runs out mid-order, the order is refused and stock is rolled back.
- **Why it's useful:** You never oversell. The "Only 1 left!" messages also create urgency that increases sales.

### ✉️ E. Email notifications (Brevo)

#### E1. OTP login emails
- **What it does:** Sends the 6-digit login code to the customer's email.
- **How it works:** Via the free Brevo email service (300 emails/day, no domain needed — just verify your own email address as sender once).
- **Why it's useful:** Instant, free email delivery for passwordless login.

#### E2. Order confirmation emails
- **What it does:** When a customer places an order, they automatically get a receipt email with the items, prices, shipping, total, and status.
- **How it works:** The server sends it through the same Brevo service at the moment the order is created.
- **Why it's useful:** Customers get a written record of their purchase instantly — a professional touch that builds trust.

### ⚙️ F. Admin dashboard (your control room)

#### F1. Product management
- **What it does:** Add, edit, and delete products; set name, price, MRP, category, popularity, **stock**, description, and photo.
- **How it works:** A simple form in the admin panel; changes appear on the store instantly.
- **Why it's useful:** You run the whole catalog without touching code.

#### F2. Order management
- **What it does:** See every order with the customer's details and items, and move it through a status flow: **Pending → Processing → Shipped → Delivered → Cancelled**.
- **How it works:** One dropdown per order in the admin panel.
- **Why it's useful:** You control the entire order lifecycle and can tell customers exactly where their order is.

#### F3. Customer management
- **What it does:** See all registered customers and enable/disable their accounts.
- **How it works:** Disabling an account signs the customer out and blocks future logins.
- **Why it's useful:** You can block problem accounts instantly.

### 🛠️ G. Engineering quality (why you can trust it)

#### G1. Tamper-proof prices
- **What it does:** Customers can't change order totals by editing the web page.
- **How it works:** Every order's prices are recalculated from the database on the server at checkout.
- **Why it's useful:** No under-pricing, no cheating, no lost money.

#### G2. Security hardening
- **What it does:** Many small protections working together — secure httpOnly cookies, encrypted passwords, rotating session tokens, login-attempt rate limiting, security headers.
- **Why it's useful:** Standard best practices that make the store much harder to attack.

#### G3. White-label / re-branding
- **What it does:** Store name, tagline, logo, colors, and pricing (currency, delivery fee, free-delivery threshold) are all controlled from one settings file.
- **Why it's useful:** Use the same codebase to launch a store for any client or brand in minutes.

#### G4. Performance
- **What it does:** Fast, small, optimized pages.
- **How it works:** The app code is split into small chunks (React libraries load once, separately), images load lazily, and product data is cached.
- **Why it's useful:** Fast loading = better ranking and fewer visitors leaving.

#### G5. Cloud-ready
- **What it does:** Can run on your laptop, on a free cloud database (MongoDB Atlas), and deploy to free hosting (Vercel/Render).
- **Why it's useful:** You can start free and scale later — the code already supports production mode.

#### G6. Code quality
- **What it does:** Automated checks (linting) and a production build step catch mistakes before they reach users.
- **Why it's useful:** Fewer bugs, easier updates, cleaner foundation for growth.

---

## PART 2 — RUN IT YOURSELF (about 5 minutes, no coding)

Anyone with a computer can download and run this store.

**What you need (free):**

1. **Node.js** — the engine that runs the app → https://nodejs.org (install the LTS version)
2. **MongoDB** — the database → install "MongoDB Community Server" from https://www.mongodb.com/try/download/community (for testing on your machine), **or** skip local install and use a free cloud database at https://www.mongodb.com/atlas (recommended — nothing to install)

**Steps:**

```sh
# 1. Get the code (download as ZIP from GitHub, or on the command line:)
git clone <your-repo-url>
cd ecommerce-store

# 2. Install dependencies (one time)
npm install

# 3. Create your private settings file (copy the template)
copy .env.example .env        (Windows)
cp .env.example .env          (Mac / Linux)

# 4. Open ".env" in a text editor and fill in:
#    JWT_SECRET    → a long random string (one command generates one, see below)
#    MONGO_URI     → your MongoDB address (local default already works)
#    ADMIN_EMAIL / ADMIN_PASSWORD → your own admin login

# 5. Start the store
npm run dev
```

Generate a random secret key (copy the output into `JWT_SECRET`):

```sh
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**What you'll see:**

- Store (customers): http://localhost:5173
- Admin panel: sign in at http://localhost:5173/login with your admin email/password, then open http://localhost:5173/admin

On first start the app automatically creates your admin account and the 108 demo products — so it works immediately.

> **For a real launch** (your own domain, real payments, live email): see Part 4 → Deployment, and Part 3 for where each key goes.

---

## PART 3 — YOUR SECRETS STAY SECRET (important, easy to understand)

The project is **open source** — all the code is public so anyone can download, learn from, and test it. **But your private information is never part of that public code.** Here's how:

| Your private thing | Where it lives | Is it ever uploaded? |
| --- | --- | --- |
| Database address (`MONGO_URI`) | `.env` file (your computer / hosting dashboard) | ❌ Never |
| Email key (`BREVO_API_KEY`) | `.env` file | ❌ Never |
| Payment keys (`RAZORPAY_*`) | `.env` file | ❌ Never |
| Admin login | `.env` file + database | ❌ Never |
| JWT secret | `.env` file | ❌ Never |

**How it works:**

1. The `.env` file is listed in `.gitignore` — a built-in instruction that tells Git/GitHub **never** to upload it. You'll see `.env.example` in the repo (the harmless template) but never anyone's real `.env`.
2. When you deploy (Part 4), the same secrets are typed into the hosting service's **private settings page** (Render/Vercel) — not into the code.
3. Anyone else who downloads the project gets the template (`.env.example`) and must create their **own** free keys to make their copy work. They never see yours.

**Where to get your own free keys (one-time, ~10 minutes):**

- **Email (Brevo):** https://brevo.com → Settings → API Keys → *SMTP API key* → copy into `BREVO_API_KEY`. Then Senders → *Create a Sender* → verify your email address → put it in `BREVO_FROM_EMAIL`. Free = 300 emails/day, no domain needed.
- **Payments (Razorpay):** https://dashboard.razorpay.com → *Test Mode* → *API Keys* → copy into `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. Leave both empty to run without online payments.
- **Cloud database (MongoDB Atlas):** https://www.mongodb.com/atlas → create a free cluster → get the connection string (with your database user's password) → put it in `MONGO_URI`.

**Simple rule:** if a file or a value looks like a password/key/secret, it belongs in `.env` (or the hosting dashboard) — never in a code file.

---

## PART 4 — FOR DEVELOPERS (technical reference)

Full-stack, production-style e-commerce application you can reuse as a **white-label template for any client**. It includes a customer-facing storefront, an admin dashboard, authentication, cart + checkout with online payments, order management, live inventory tracking, and email notifications.

- **Frontend:** React 19, Vite 8, React Router 7
- **Backend:** Node.js, Express 5, Mongoose 9 (MongoDB)
- **Payments:** Razorpay (optional — works without it, falls back to "place order" flow)
- **Auth:** JWT access + rotating refresh tokens in httpOnly cookies, bcrypt password hashing, email OTP sign-in (Brevo, with an in-memory dev fallback)
- **Email:** Brevo — OTP codes + order confirmations (fire-and-forget, API key never exposed to the browser)
- **Inventory:** real `stock` per product, enforced on cart add/update and atomically decremented at order time

---

## 2. Tech stack (exact versions)

From `package.json`:

| Dependency | Version | Purpose |
| --- | --- | --- |
| `react` / `react-dom` | 19.x | UI |
| `react-router-dom` | 7.x | Routing |
| `vite` | 8.x | Build / dev server |
| `express` | 5.x | API server |
| `mongoose` | 9.x | MongoDB ODM |
| `jsonwebtoken` | 9.x | JWT signing |
| `bcryptjs` | 3.x | Password hashing |
| `cookie-parser` | 1.x | Cookie handling |
| `helmet` | 8.x | Security headers |
| `cors` | 2.x | Cross-origin (dev) |
| `express-rate-limit` | 8.x | Auth endpoint throttling |
| `razorpay` | 2.x | Payment gateway SDK |
| `concurrently` | 10.x | Run web + API together |
| `oxlint` | 1.x | Linting |

---

## 3. Architecture

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│  Browser (React SPA)        │  fetch  │  Express API  (localhost:5000)│
│  Vite dev @ :5173           │ ──────► │  /api/...                     │
│  (prod: served by Express)  │  cookies│  └── MongoDB (127.0.0.1:27017)│
└─────────────────────────────┘         └──────────────────────────────┘
```

- In **development**: Vite serves the SPA on `:5173` and proxies `/api` → `:5000` (see `vite.config.js`).
- In **production** (`npm run start`): Express serves the built `dist/` folder itself and falls back to `index.html` for non-API GET routes (SPA history fallback).
- The cart is **dual-mode**: signed-in users use a **server-side cart** (`/api/cart`, survives across devices); guests use a `localStorage` cart that's merged in on sign-in. Orders are always **server-side** (prices recomputed on the server — the client never sends its own prices for checkout).

---

## 4. Complete folder structure

```
ecommerce-store/
├── index.html                  # Vite entry HTML (root div, favicon, title)
├── package.json                # Scripts + dependencies
├── vite.config.js              # Vite config + /api proxy to :5000
├── .env.example                # Template for environment variables
├── .env                        # Your actual secrets (never commit)
├── .oxlintrc.json              # Lint rules (react hooks, export rules)
├── public/
│   └── favicon.svg             # Browser tab icon
│
├── server/                     # ══ BACKEND (Express + Mongoose) ══
│   ├── index.js                # App bootstrap: middleware, routes, SPA serving, startup
│   ├── seeds.js                # First-boot seeding: admin account + demo products
│   ├── config/
│   │   ├── env.js              # Reads + validates .env into `env` object
│   │   └── db.js               # connectDB / disconnectDB (Mongoose)
│   ├── models/
│   │   ├── User.js             # name/email/phone/passwordHash/role/...  + toSafeJSON()
│   │   ├── Product.js          # name/price/mrp/images/popularity/...     + toSafeJSON()
│   │   └── Order.js            # items/shippingInfo/payment/status/...    + toSafeJSON()
│   ├── routes/
│   │   ├── auth.routes.js      # /api/auth/*     (public + rate-limited)
│   │   ├── product.routes.js   # /api/products/* (admin guarded writes)
│   │   ├── order.routes.js     # /api/orders/*   (signed-in; admin guarded)
│   │   ├── user.routes.js      # /api/users/*    (profile + admin customer mgmt)
│   │   └── cart.routes.js      # /api/cart/*     (signed-in; server-side cart)
│   ├── controllers/
│   │   ├── authController.js   # register/login/logout/me/refresh/otp
│   │   ├── productController.js# list/get/create/update/delete
│   │   ├── orderController.js  # create/verify-payment/mine/all/get/status
│   │   ├── userController.js   # updateProfile/changePassword/customers
│   │   └── cartController.js   # get/add/update/remove/clear/merge (enriched from Product)
│   ├── middleware/
│   │   ├── auth.js             # requireAuth (JWT), requireAdmin (role)
│   │   └── error.js            # notFound + centralized errorHandler
│   └── utils/
│       ├── tokens.js           # signAccess/RefreshToken, hashToken, cookieOptions
│       ├── otp.js              # dev-fallback in-memory OTP store (create/verify, 5-min TTL)
│       ├── brevo.js            # Brevo API: sendOtpEmail (OTP), sendOrderConfirmationEmail (receipt)
│       ├── validators.js       # email/name/phone/password/product/order validation
│       └── razorpay.js         # SDK init, signature verification (timing-safe)
│
└── src/                        # ══ FRONTEND (React SPA) ══
    ├── main.jsx                # Entry: injects theme CSS vars + renders <App/>
    ├── App.jsx                 # Provider nesting + all routes + layout shell
    ├── App.css                 # Global layout (footer etc.)
    ├── index.css               # Design tokens (:root CSS variables), resets
    ├── api/
    │   └── client.js           # fetch wrapper: /api base, credentials, auto token refresh
    ├── config/
    │   └── site.js             # ★ THE config file: site name/tagline, theme vars,
    │                           #   layout flags, pricing, navigation
    ├── context/
    │   ├── AuthContext.jsx     # user state, login/register/otp/profile/password
    │   ├── CartContext.jsx     # dual-mode cart: server (/api/cart) when signed in, localStorage for guests
    │   ├── ProductsContext.jsx # products state, add/update/delete
    │   └── OrdersContext.jsx   # orders state (mine or all by role), place/verify/status
    ├── data/
    │   └── products.js         # ★ 108 seed products (name/price/mrp/image/desc/category)
    ├── hooks/
    │   └── useInView.js        # IntersectionObserver hook (scroll-reveal animations)
    ├── utils/
    │   ├── format.js           # formatCurrency (₹1,234.00), discountPercent
    │   ├── catalog.js          # formatCompactCurrency, deterministic getBrand/Rating/
    │   │                       #   ReviewCount/Stock/Specs/Offer/Delivery/Date
    │   ├── validation.js       # client-side email/name/phone/password checks
    │   └── razorpay.js         # loads checkout.js, opens Razorpay popup
    ├── components/
    │   ├── Header.jsx/.css     # logo, search, nav, account menu, cart link, mobile menu
    │   ├── ProductCard.jsx/.css# product card, variants: 'classic' and 'flipkart'
    │   ├── Ambassadors.jsx/.css# sponsored ambassador carousel (auto-rotate 5s)
    │   ├── AccountTabs.jsx/.css# My Orders / Profile Settings tabs
    │   ├── UserRoute.jsx       # guard: redirect to /login if signed out
    │   ├── AdminRoute.jsx      # guard: admin role only
    │   ├── Reveal.jsx          # scroll-reveal wrapper
    │   └── ScrollToSection.jsx # hash-scroll + scroll-to-top on route change
    └── pages/
        ├── Home.jsx/.css       # Ambassadors → hero → categories → deals → arrivals →
        │                       #   bestsellers → newsletter → about → contact → legal
        ├── ProductListing.jsx/.css  # search, filters, sort, grid/list views
        ├── ProductDetail.jsx/.css   # gallery, price block, offers, specs, recommendations
        ├── Cart.jsx/.css       # full /cart page (dark theme, price-details card)
        ├── Checkout.jsx/.css   # shipping form + Razorpay + order placement
        ├── OrderConfirmation.jsx/.css  # order result + Pay Now if pending
        ├── OrderHistory.jsx/.css        # list of user orders
        ├── Profile.jsx/.css             # edit profile / change password
        ├── AdminDashboard.jsx/.css      # products/orders/customers tabs
        ├── Login.jsx, Register.jsx, OtpLogin.jsx + auth.css
```

---

## 5. Environment variables (`.env`)

| Variable | Default | Notes |
| --- | --- | --- |
| `NODE_ENV` | `development` | `production` enables static `dist/` serving + hides demo OTP code |
| `PORT` | `5000` | API port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/shopEasy` | Local MongoDB |
| `JWT_SECRET` | — (required) | Long random string (see command below) |
| `JWT_ACCESS_TTL` | `15m` | Access token lifetime |
| `JWT_REFRESH_TTL` | `7d` | Refresh token lifetime |
| `ADMIN_NAME` | `Admin` | Seeded admin name |
| `ADMIN_EMAIL` | — (required) | Seeded admin email |
| `ADMIN_PASSWORD` | — (required) | Seeded admin password |
| `COOKIE_SECURE` | `false` | Set `true` only over HTTPS |
| `CORS_ORIGINS` | empty | Comma-separated list of frontend origins allowed to call the API directly (e.g. `https://store.vercel.app,https://admin.vercel.app`). Localhost is always allowed in development. In production, origins not listed get no CORS headers. |
| `SEED_PRODUCTS` | `true` | Seed demo products while collection is empty |
| `CURRENCY` | `INR` | Payment currency |
| `SHIPPING_FEE` | `49` | Flat shipping below threshold |
| `FREE_SHIPPING_THRESHOLD` | `999` | Orders ≥ this ship free |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | empty | Both empty = payments disabled (orders placed directly) |
| `BREVO_API_KEY` | empty | Email delivery (OTP codes **and** order confirmations) via Brevo API (free = 300/day, **no domain needed**) — verify your own email at Senders → Create a Sender |
| `BREVO_FROM_EMAIL` | empty | The verified Brevo sender email (required when using Brevo) |
| `BREVO_FROM_NAME` | `ShopEasy` | Sender name for Brevo emails |

Generate a JWT secret:

```sh
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 6. Setup from scratch (first run)

**Prerequisites:** Node.js 18+, MongoDB running locally (`mongodb://127.0.0.1:27017`).

```sh
# 1. Install dependencies
npm install

# 2. Create env file and fill it in
cp .env.example .env

# 3. Run web + API together
npm run dev
```

- Web app → http://localhost:5173
- API → http://localhost:5000 (`/api/health` for a ping)

**First boot** (automatic in `server/index.js` + `server/seeds.js`):
1. Connects to MongoDB, syncs indexes.
2. Seeds the **admin** account from `ADMIN_EMAIL`/`ADMIN_PASSWORD` (only if no admin exists).
3. Seeds the **108 demo products** (only if the products collection is empty; disable with `SEED_PRODUCTS=false`).

Sign in at `/login` with the admin credentials to reach `/admin`.

> **Email — provider precedence:**
>
> 1. **Brevo API** (`BREVO_API_KEY` + `BREVO_FROM_EMAIL` set) — the server generates a 6-digit OTP (hashed in memory, 5-min TTL), emails it via Brevo (`POST /v3/smtp/email`), and verifies it against the in-memory store. Order confirmations are also emailed through Brevo automatically when an order is created. Free = 300 emails/day to **any** recipient; **no domain needed**.
> 2. **Simulated** (not configured) — OTP codes are generated in-memory and logged to the **server console** in dev (`[otp] dev code for ...`). Dev only.
>
> In both paths the verified email is **upserted** into MongoDB (existing account → logs in; new email → creates a passwordless `user`) and the normal JWT cookie session is issued. Password sign-in stays independent.
>
> **Brevo setup:** add `BREVO_API_KEY` (https://brevo.com → Settings → API Keys → "SMTP API key") and set `BREVO_FROM_EMAIL` to an email you can receive a confirmation link at (Brevo → Senders → Create a Sender → verify). Once verified, any recipient can receive codes/receipts — no domain purchase required.

---

## 7. Data models

### User (`server/models/User.js`)
| Field | Type | Notes |
| --- | --- | --- |
| `name` | String (2–60) | required |
| `email` | String | unique (partial index, only when present), lowercased |
| `phone` | String | unique (partial index), 10-digit |
| `passwordHash` | String | bcrypt (12 rounds) |
| `role` | `'user' \| 'admin'` | default `user` |
| `passwordless` | Boolean | true when account was created via OTP |
| `isActive` | Boolean | disabled accounts can't sign in |
| `refreshTokenHash` | String | sha256 of current refresh token (rotation) |
| `cart[]` | { product (ObjectId ref Product), quantity (1–99) } | server-side cart; enriched with live product data when read |

Methods: `setPassword(plain)`, `verifyPassword(plain)`, `toSafeJSON()` (never exposes hash).

### Product (`server/models/Product.js`)
| Field | Type | Notes |
| --- | --- | --- |
| `name` | String (≤200) | required |
| `price` | Number | required, ≥ 0 |
| `mrp` | Number | optional; must be ≥ price |
| `description` | String (≤2000) | |
| `category` | String (≤100) | required |
| `image` | String (URL) | required |
| `images` | [String] | gallery (falls back to `[image]`) |
| `popularity` | Number (0–100) | used for ranking "popular" |
| `stock` | Number (0–9999) | live inventory; decremented on order, edited via admin |
| `dateAdded` | String (YYYY-MM-DD) | used for "newest" sorting |

### Order (`server/models/Order.js`)
| Field | Type | Notes |
| --- | --- | --- |
| `user` | ObjectId ref User | null for guest-placed (future) |
| `orderNumber` | String | unique, e.g. `ORD-xxxx` |
| `items[]` | { product, name, price, quantity (1–99), image } | snapshot at purchase time |
| `subtotal` / `shipping` / `total` | Number | server-computed |
| `status` | `Pending / Processing / Shipped / Delivered / Cancelled` | |
| `shippingInfo` | { firstName, lastName, email, phone, address, city, zip } | |
| `payment` | { method: `'razorpay' \| 'cod' \| ''`, razorpayOrderId, razorpayPaymentId, razorpaySignature, paid, paidAt } | COD orders store `method:'cod'`, `paid:false` |

---

## 8. Authentication & security

**Flow:**
1. Login/register/OTP → server signs an **access token** (15 min) and a **refresh token** (7 days).
2. Both are set as **httpOnly, SameSite=Strict** cookies (`secure` in production).
3. The refresh token is stored on the user as a **sha256 hash**; each `POST /auth/refresh` **rotates** it (new pair, old hash replaced) — stolen refresh tokens die on reuse.
4. `requireAuth` middleware verifies the access token and loads the user; disabled users are rejected.
5. Frontend `api/client.js` auto-retries once with `/auth/refresh` on a `401` (except for auth paths), via a shared single-flight promise.

**OTP sub-flow:** `/otp/request` emails a 6-digit code via Brevo (or logs it to the server console when Brevo isn't configured) → `/otp/verify` checks it against the in-memory store → the user is upserted in MongoDB by that email and a normal JWT session is issued. Brevo never issues the app's session.

**Other security:**
- `helmet` security headers; CORS **allowlist** (only the origins in `CORS_ORIGINS`, plus localhost in dev — unknown origins are denied, no headers sent).
- Rate limiting: `/api/auth` 60 req / 15 min, **login + OTP verify 10 req / 15 min**, **order creation 10 req / 15 min per IP plus a store-wide cap of 60 / 15 min**.
- bcrypt password hashing; passwords limited to ≤72 chars.
- Order prices are **recomputed server-side** from the database — the client can't alter totals.
- Payment signature verification uses `crypto.timingSafeEqual`.
- `errorHandler` normalizes errors (CastError, ValidationError, duplicate keys → friendly messages) and hides internal error details in production.

---

## 9. API reference

Base URL: `/api` (proxied to `:5000` in dev; same origin in prod).

### Auth (`/api/auth`)
| Method | Route | Access | Body | Returns |
| --- | --- | --- | --- | --- |
| POST | `/register` | public | `{ name, email, password }` | `{ user }` |
| POST | `/login` | public | `{ email, password }` | `{ user }` |
| POST | `/logout` | signed in | — | `{ ok: true }` |
| GET | `/me` | public | — | `{ user \| null }` |
| POST | `/refresh` | public | — | `{ user }` (rotates tokens) |
| POST | `/otp/request` | public | `{ email }` | `{ ok: true }` (code is emailed; in dev it's also logged to the server console when no email provider is configured) |
| POST | `/otp/verify` | public | `{ email, code }` | `{ user }` |

### Products (`/api/products`)
| Method | Route | Access | Notes |
| --- | --- | --- | --- |
| GET | `/` | public | list, sorted newest first |
| GET | `/:id` | public | single product |
| POST | `/` | admin | create |
| PUT | `/:id` | admin | update |
| DELETE | `/:id` | admin | delete |

Product body: `{ name, price, mrp?, description?, category, image, images?, popularity?, stock? }`.

### Orders (`/api/orders`)
| Method | Route | Access | Notes |
| --- | --- | --- | --- |
| POST | `/` | signed in | create order (+ Razorpay order when paying online); `{ order, payment }` |
| POST | `/:id/verify-payment` | owner/admin | verify Razorpay signature |
| GET | `/mine` | signed in | current user's orders |
| GET | `/all` | admin | all orders |
| GET | `/:id` | owner/admin | order detail |
| POST | `/:id/cancel` | owner/admin | cancel a Pending/Processing order; items are restocked automatically |
| PATCH | `/:id/status` | admin | `{ status }` |

Create-order body: `{ items: [{ product, quantity }], shippingInfo: { firstName, lastName, email, phone?, address, city, zip }, paymentMethod?: 'online' \| 'cod' }`. The server re-fetches products, validates **stock** (rejects over-stock/out-of-stock line items with a clear error), computes `subtotal`/`shipping`/`total` itself, **atomically decrements stock**, creates the order (+ a Razorpay order only when paying online with keys configured — COD orders skip the gateway), and emails a confirmation receipt via Brevo.

### Users (`/api/users`)
| Method | Route | Access | Notes |
| --- | --- | --- | --- |
| PATCH | `/me` | signed in | `{ name, email?, phone? }` |
| PATCH | `/me/password` | signed in | `{ currentPassword, newPassword }` |
| GET | `/customers` | admin | list customers |
| PATCH | `/customers/:id` | admin | `{ isActive: boolean }` |

### Cart (`/api/cart`) — signed-in, server-side
| Method | Route | Body | Response |
| --- | --- | --- | --- |
| GET | `/` | — | `{ items: [{ id, name, price, mrp, image, category, stock, quantity }] }` (live product data) |
| POST | `/items` | `{ product, quantity }` | `{ items }` (increments quantity if already present) |
| POST | `/merge` | `{ items: [{ product, quantity }] }` | `{ items }` (bulk add, used to merge the guest's localStorage cart on sign-in) |
| PATCH | `/items/:productId` | `{ quantity }` | `{ items }` (`quantity ≤ 0` removes the item) |
| DELETE | `/items/:productId` | — | `{ items }` |
| DELETE | `/` | — | `{ ok: true }` (clears the cart) |

---

## 10. Frontend architecture

### Config-driven app (`src/config/site.js`)
This is the single place to rebrand for a client. It exports:

- `site` — `name`, `tagline`, `logo` (shown in the header/title).
- `theme` — every CSS variable (colors, gradients, radii, shadows). `main.jsx` copies these onto `:root` at startup, so they also appear in `index.css` and drive all component styles via `var(--...)`.
- `layout` — feature toggles: sticky header, max width, show search/cart/account/hamburger, search placeholder.
- `pricing` — currency, free-shipping threshold, shipping fee.
- `nav` — main links, guest actions, and the role-based account menu.

### Global state (Context)
Providers are nested in `App.jsx`:

```
AuthProvider → CartProvider → OrdersProvider → ProductsProvider → Router
```

| Context | State | Key actions |
| --- | --- | --- |
| Auth | `user`, `loading` | register, login, logout, requestOtp, verifyOtp, updateProfile, changePassword, `isAdmin` |
| Cart | `cartItems`, `isCartOpen` | addToCart, removeFromCart, updateQuantity, clearCart, `cartTotal`, `cartCount`, toggleCart |
| Products | `products`, `loading`, `error` | loadProducts, addProduct, updateProduct, deleteProduct |
| Orders | `orders` (mine or all by role), `loading` | addOrder, verifyOrderPayment, updateOrderStatus, getOrder |

Cart items are full product snapshots + `quantity`. **Signed in** → state is kept in sync with `/api/cart` (write-through mutations, merge of the guest cart on sign-in). **Signed out** → persisted to `localStorage` (key `shopeasy-cart`).

### Routing (`src/App.jsx`)
| Route | Page | Guard |
| --- | --- | --- |
| `/` | Home | — |
| `/products` | ProductListing | — |
| `/product/:id` | ProductDetail | — |
| `/cart` | Cart | — |
| `/login` `/register` `/otp` | auth pages | redirect if signed in |
| `/checkout` | Checkout | `UserRoute` |
| `/order/:id` | OrderConfirmation | `UserRoute` |
| `/account/orders` | OrderHistory | `UserRoute` |
| `/account/profile` | Profile | `UserRoute` |
| `/admin` | AdminDashboard | `AdminRoute` |

Guards (`UserRoute`/`AdminRoute`) render `null` while auth is loading, then `Navigate` to `/login` (remembering the origin via `location.state.from`) when unauthorized.

### Deterministic product extras
Real products store name/price/mrp/description/category/images/popularity/**stock**. Everything else "storefront-flavored" is derived deterministically from the product id via `src/utils/catalog.js`:
- `getBrand()` — pick from a category-based brand pool.
- `getRating()` / `getReviewCount()` — stable pseudo-random values.
- `getStock()` / `getStockCount()` — reads the **real `product.stock` field** (legacy products without one fall back to a deterministic pseudo-random value). `'out'` = 0, `'low'` = 1–2, else `'in'`.
- `getSpecs()`, `getOffer()`, `getDelivery()`, `getDeliveryDate()`.

This means you only manage a catalog of real fields (plus live stock); the card/detail UI always has data. Stock gates add-to-cart on the card, the detail page, and the cart, and the server enforces it at order time.

### Theming / design system
- Dark "neo-glass" palette: page `#0B1020`, surfaces `#141B34` / `#1A2340`, purple gradient `#7C3AED → #A855F7`, blue gradient `#2563EB → #06B6D4`, green accents `#22C55E`.
- All component CSS uses `var(--color-*)`, `var(--gradient-*)`, `var(--radius-*)`, etc. Rebranding = editing `theme` in `site.js` (or `index.css`).
- Reusable bits: `Reveal` scroll animations (`useInView`), `.btn-primary/.btn-secondary` button classes, scroll-to-section on hash links.

---

## 11. Cart & checkout flow (end-to-end)

1. **Add to cart** (any `ProductCard`, or ProductDetail) → `addToCart(product)` → count badge updates. **Signed in:** written to `/api/cart` (server). **Signed out:** persisted to `localStorage`.
2. **`/cart` page** → qty steppers (`updateQuantity`), remove, clear, MRP/discount/savings math, free-delivery progress bar. "Place Order" → `/checkout` (redirects to `/login` if signed out).
3. **Checkout** (`UserRoute`) → shipping form validates → `addOrder()` POSTs items + shipping info.
   - Server recomputes prices, creates the order, and (if Razorpay keys exist) creates a Razorpay order.
   - Cart is cleared immediately.
4. **Payment** → Razorpay popup opens (loaded lazily). On success, `verifyOrderPayment` verifies the signature server-side and marks the order paid → status `Processing`. If payment is dismissed/fails, the order stays `Pending` with a **Pay Now** button on the confirmation page.
5. **Order confirmation** → `/order/:id` shows success state, order summary, shipping address, and Pay Now when pending.

---

## 12. Admin dashboard (`/admin`)

Three tabs:

1. **Products** — table of all products (with live stock column); "Add Product" form + inline Edit/Delete. Fields: name, price, MRP, category, popularity (0–100), **stock (units)**, description, image URL.
2. **Orders** — expandable order cards: customer info, items, totals, and a status dropdown (`Pending → Processing → Shipped → Delivered → Cancelled`).
3. **Customers** — list of users with Enable/Disable. Disabling a user also clears their refresh token (kills their session).

---

## 13. Rebranding for a client (checklist)

1. **Brand identity** → `src/config/site.js`: `site.name`, `tagline`, `logo`; `theme` colors/gradients/fonts; `layout` toggles.
2. **Index metadata** → `index.html`: `<title>`, meta description, favicon (`public/favicon.svg`).
3. **Contact info** → `src/pages/Home.jsx` contact section (email/phone/hours) + footer links in `App.css`/`Home.jsx` legal copy.
4. **Currency & shipping** → `pricing` in `site.js` **and** `SHIPPING_FEE`/`FREE_SHIPPING_THRESHOLD`/`CURRENCY` in `.env` (server uses the env values).
5. **Catalog** → replace `src/data/products.js` (or add products via the admin dashboard) — seeds only run when the collection is empty.
6. **Payments** → set Razorpay keys in `.env`. Without keys, checkout works in "place order" mode.
7. **OTP email** → set `BREVO_API_KEY` + `BREVO_FROM_EMAIL` in `.env` (free 300 emails/day to any recipient, no domain needed — just verify your own email as sender at Brevo → Senders). Without keys, the dev fallback logs the code to the server console.
8. **Ambassador banner** → edit `AMBASSADORS` in `src/components/Ambassadors.jsx` (name, role, tagline, quote, image, collection, gradient colors) — or remove `<Ambassadors />` from `Home.jsx`.
9. **Footer/legal** → static sections in `src/pages/Home.jsx`.

---

## 14. Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs Vite + API together |
| `npm run dev:web` | Vite dev server only |
| `npm run dev:api` | Express API with `--watch` |
| `npm run build` | Production build into `dist/` |
| `npm run start` | API in production (serves `dist/`) |
| `npm run lint` | oxlint |
| `npm run preview` | Preview the built app |

---

## 15. Deployment (Vercel + Render)

The recommended production setup splits the app the way it's designed:

- **Frontend (store) → Vercel** (free) — serves the built React app.
- **API → Render** (free) — runs the Express server, which connects to MongoDB Atlas.
- **One domain illusion:** Vercel *rewrites* `/api/*` to the Render URL (see `vercel.json`), so the browser treats the whole store as **one site**. This keeps `SameSite=Strict` + `httpOnly` cookie auth working. (For the separate admin app on another domain, set `CORS_ORIGINS` on Render to that domain so its cross-origin logins are allowed.)

```
Browser → https://store.vercel.app          (frontend, Vercel)
              └── /api/*  ──rewrite──►  https://api.onrender.com/api/*   (Express, Render)
                                              └── MongoDB Atlas
```

The two config files already in the repo make this almost one-click:

| File | What it does |
| --- | --- |
| `vercel.json` | Rewrites `/api/:path*` → your Render URL, e.g. `https://shopeasy-api.onrender.com/api/:path*` (edit the destination if your Render URL differs) |
| `render.yaml` | Render blueprint for the API: Node runtime, build + start commands, health check, env vars (secrets use `sync: false` so you type them in the Render dashboard — never in the repo) |

### Step 1 — Deploy the API to Render

1. Go to https://dashboard.render.com → **New** → **Blueprint**.
2. Pick the **ecommerce-store** GitHub repo. Render reads `render.yaml` and creates a web service called `shopeasy-api`.
3. During setup Render asks for the `sync: false` variables. Fill them from your private `.env` (**generate a brand-new `JWT_SECRET`** — don't reuse the dev one):
   - `MONGO_URI` — your Atlas connection string (see Step 3)
   - `JWT_SECRET` — new random value: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — admin login (if the account already exists in Atlas, rotate it with the tool below instead)
   - `BREVO_API_KEY` / `BREVO_FROM_EMAIL` — your Brevo sender values
   - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — leave empty to run without online payments
   - `CORS_ORIGINS` — the exact frontend URLs (store + admin) that may call the API directly
4. Click **Apply**. Wait for the deploy; when it's green, open `https://<your-app>.onrender.com/api/health` → you should see `{"ok":true}`.
5. Copy the service URL (e.g. `https://shopeasy-api.onrender.com`) — you'll need it for Vercel.

> **Free-tier note:** Render's free web service sleeps after ~15 min of no traffic and takes ~30–60 s to wake on the first request. Also, free web services now require a credit card on file. You can pick the free plan or upgrade later.

### Step 2 — Deploy the frontend to Vercel

1. Go to https://vercel.com → **Add New** → **Project** → import the **ecommerce-store** repo.
2. Vercel auto-detects Vite (framework preset `Vite`). Build command `npm run build`, output `dist` — defaults are correct.
3. Add one **Environment Variable**: `API_URL` = your Render URL from Step 1 (e.g. `https://shopeasy-api.onrender.com`). This is what `vercel.json` uses in the rewrite.
4. Deploy. When done, open the live URL and sign in at `/login`.
5. **Verify:** in the browser dev tools → Application → Cookies, you should see the `access_token`/`refresh_token` cookies set for your Vercel domain (that proves the proxy + secure cookies work). Place a test order to confirm the API and order-confirmation email work end-to-end.

> If `${API_URL}` doesn't resolve for some reason, edit `vercel.json` to hardcode your Render URL (e.g. `"destination": "https://shopeasy-api.onrender.com/api/:path*"`) and redeploy.

### Step 3 — MongoDB Atlas (one-time)

1. Go to https://cloud.mongodb.com → your cluster → **Network Access** → **Add IP Address** → allow `0.0.0.0/0` (anywhere) so Render can connect. (Your cluster already has your 108 products + admin account.)
2. In **Database Access**, confirm your database user has read/write permission.
3. Your `MONGO_URI` (from `.env`) is the same string Render will use.
4. Because the admin already exists in Atlas, `ADMIN_PASSWORD` in Render does **not** override it — log in with the existing admin password. (On a brand-new empty cluster, Render's `ADMIN_EMAIL`/`ADMIN_PASSWORD` create the admin automatically.) To change or rotate the admin account later, use the `server/tools/create-admin.js` tool instead (see below).

### Step 4 — Optional: custom domain & live payments

- **Custom domain:** Vercel → Project → Settings → Domains (and Render → Settings → Custom Domain). Certificates are automatic.
- **Razorpay live:** switch `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` to live keys in Render's dashboard; nothing else changes.

### Alternative: Render hosts everything (simpler)

You don't have to use Vercel at all — the server already serves the built frontend in production (`npm run start`). Just deploy the repo to Render (same blueprint) and open your Render URL. Everything is on one origin; no `API_URL` needed. Vercel is only used when you want the frontend on a separate service.

### Traditional self-hosting (still supported)

```sh
npm install
npm run build     # produces dist/
NODE_ENV=production npm run start   # Express serves dist/ + API on PORT
```

- Express serves the SPA with history fallback, so `/products`, `/cart`, etc. work on refresh.
- Set `COOKIE_SECURE=true` when behind HTTPS.
- Use a process manager (PM2 / systemd / Docker) to keep the server alive.
- **MongoDB:** use MongoDB Atlas (set `MONGO_URI` accordingly).
- **Razorpay:** switch from test keys to live keys.

---

## 16. Known limitations & notes

- **Cart is dual-mode** — signed-in users get a **server-side cart** (`/api/cart`, stored on the user, enriched with live product data, survives across devices). Guests get a `localStorage` cart that is **merged into the server cart on sign-in** and cleared. A signed-out user's cart won't persist across browsers.
- **OTP email delivery** — uses the **Brevo API** when `BREVO_API_KEY` + `BREVO_FROM_EMAIL` are set (free 300/day, no domain needed); otherwise a **simulated in-memory code** logged to the server console (dev only; the code is never returned to the browser). The in-memory verification store resets on server restart. OTP users who never set a password remain passwordless.
- **Real inventory tracking** — every product has a `stock` field (backfilled automatically on boot for legacy products). Adding to cart rejects out-of-stock and over-stock quantities (client- and server-side); placing an order **atomically decrements** stock (`$inc` with a `stock: { $gte: quantity }` guard; if any line fails mid-way the earlier lines are rolled back). Set stock from the admin Products tab.
- **Order confirmation emails** — when `BREVO_API_KEY` is configured, an order receipt (items, totals, status) is emailed to the shipping email on order creation (fire-and-forget, so a failed email never blocks checkout).
- **Products seed only when the collection is empty** — to reseed after manual changes, drop the collection or disable seeding first.
- The checkout flow uses Razorpay for INR; for other currencies/regions swap the gateway in `src/utils/razorpay.js` + `server/controllers/orderController.js`.
- `react-router` has a pre-existing npm audit advisory (RSC-mode CSRF) that does not affect this app's `BrowserRouter` usage.
- Lint baseline: 4 informational `react(only-export-components)` warnings from context files exporting `useX()` hooks — intentional.

---

## 17. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Missing required env var: JWT_SECRET` | Copy `.env.example` → `.env` and set `JWT_SECRET` |
| API won't start / Mongo error | Ensure MongoDB is running on `127.0.0.1:27017` |
| Admin can't sign in | Check `ADMIN_EMAIL`/`ADMIN_PASSWORD`; the account is created only once |
| Products show default images only | Images come from Unsplash URLs — they require internet |
| Cart empty on another device | Expected for guests — the server cart is only used once signed in; guest carts live in `localStorage` |
| "Payment verification failed" | Razorpay test mode: order must be paid in the same test key context |
| 401 loops in the browser | Clear cookies, or check `COOKIE_SECURE` is not `true` on HTTP |
| Frontend can't reach API | Dev: run `npm run dev` (Vite proxies `/api`); check `:5000` is up |

---

## 18. Admin & security tools

Run these locally (they read `MONGO_URI` from your `.env`):

| Command | What it does |
| --- | --- |
| `node server/tools/list-admins.js` | Lists every admin account (email, active, created). Use it to catch accounts you don't recognise. |
| `node server/tools/create-admin.js --email <e> --password '<p>' [--name '<n>']` | Creates a new admin (or promotes an existing account to admin) with the given password. |
| `node server/tools/create-admin.js --demote <email>` | Removes admin access from an account (sets role back to `user` and invalidates its sessions). |

**Best practice after a compromise or on first launch:** pick a strong random admin email + password, run `create-admin` to make it admin, run `--demote` on the old default admin, then update `ADMIN_EMAIL`/`ADMIN_PASSWORD` in Render's dashboard and redeploy.
