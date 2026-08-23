# Tomato — Food Delivery Platform

A full-stack food ordering platform built on the MERN stack, split into three apps: a customer-facing storefront, an admin/staff control panel, and a REST API backend. Customers browse a menu, order, pay via Stripe, and track orders by ID — with no account required to track. Staff fulfil orders; a super admin manages the menu, promotions, staff accounts, and revenue analytics.

## Apps

| App | Path | Default port | Who it's for |
|---|---|---|---|
| **backend** | `backend/` | `4000` | REST API, MongoDB, Stripe, email |
| **frontend** | `frontend/` | `5173` | Customers |
| **admin** | `admin/` | `5174` | Super admin + staff |

## Features

**Customer**
- Browse the menu by category, with a bestsellers rail and per-category "most ordered" / "deals" sections
- Live search, veg-only filter, discount pricing, ratings, spice level, prep time
- Cart, promo codes, Stripe Checkout
- Track any order by its tracking ID — no login required; a logged-in user sees their full order history automatically instead
- Order cancellation (while still processing, with automatic refund if paid)
- Animated UI: scroll-reveal sections, card hover effects, an animated order-status stepper

**Admin panel**
- Two roles: **Super Admin** (full access) and **Staff/Sub-admin** (orders only — can't touch the menu, promos, or revenue)
- Menu CRUD with image upload, stock toggling, discount pricing, bestseller flag, spice level, prep time, rating
- Order management with live status updates
- Promo code management
- Staff account management (create, activate/deactivate, remove)
- Dashboard with day/week/month/year revenue charts, order stats, top-selling items
- Full activity log (orders, menu changes, staff changes, logins) for the super admin

**Security**
- JWT auth (7-day expiry) with bcryptjs password hashing
- Role-based route guards on both the frontend and the API (never trust the client alone)
- Server-side price recalculation at checkout — the client can't manipulate cart totals
- Stripe webhook + session verification (payment status is never taken from the client)
- Rate limiting: strict on auth endpoints, tighter still on public lookup endpoints (order tracking, promo validation) to block enumeration
- Helmet security headers, CORS allowlist, input validation, no PII exposed on public tracking lookups

## Tech Stack

- **Frontend/Admin:** React 18, Vite, React Router, Axios, Recharts (admin dashboard charts)
- **Backend:** Node.js, Express, MongoDB + Mongoose, JWT, bcryptjs, Multer, Helmet, express-rate-limit, Nodemailer, Stripe

## Project Structure

```
Food-Delivery/
├── backend/     # Express API
│   ├── config/       # env validation, constants, DB connection
│   ├── controllers/
│   ├── middleware/   # auth, isAdmin, isStaff, rate limiters
│   ├── models/
│   ├── routes/
│   ├── services/      # email, activity logging
│   └── scripts/       # seed:admin, seed:menu
├── frontend/    # customer storefront
└── admin/       # admin/staff panel
```

## Getting Started

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

### 2. Configure environment variables

Each app has a `.env.example` — copy it to `.env` in the same folder and fill in real values.

**`backend/.env`**

| Variable | Required | Notes |
|---|---|---|
| `MONGO_URL` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Long random string |
| `SALT` | yes | bcryptjs salt rounds (e.g. `10`) |
| `STRIPE_SECRET_KEY` | yes | Stripe secret key |
| `FRONTEND_URL` | yes | Used for Stripe redirect URLs |
| `STRIPE_WEBHOOK_SECRET` | recommended | For the `/api/order/webhook` endpoint |
| `ALLOWED_ORIGINS` | recommended | Comma-separated list of allowed CORS origins |
| `PORT` | no | Defaults to `4000` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | no | Leave blank to disable outbound email (order confirmations, welcome emails) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | no | Only used by `npm run seed:admin` |

**`admin/.env`** and **`frontend/.env`**

| Variable | Notes |
|---|---|
| `VITE_BACKEND_URL` | The backend's URL, e.g. `http://localhost:4000` |

### 3. Create your first admin account

```bash
cd backend
# set ADMIN_EMAIL / ADMIN_PASSWORD in backend/.env first
npm run seed:admin
```

### 4. (Optional) Seed a starter menu

```bash
npm run seed:menu   # adds 50 sample dishes across every category
```

Safe to re-run — it matches by dish name and replaces those, so it won't duplicate entries. Images are placeholders cycled from `backend/uploads/`; swap them for real photos anytime from the admin panel's List Items page.

### 5. Run everything

From the repo root:

```bash
./run-dev.sh
```

This starts all three apps together (backend on `:4000`, frontend on `:5173`, admin on `:5174`), installing dependencies automatically if missing. Press `Ctrl+C` to stop all three.

Or run each individually:

```bash
cd backend && npm run dev     # http://localhost:4000
cd frontend && npm run dev    # http://localhost:5173
cd admin && npm run dev       # http://localhost:5174
```

## Managing Staff Accounts

Log into the admin panel as the super admin → **Staff** → create an account with a name, email, and temporary password. That account can then log into the same admin panel and will only see **Orders** — they can update order status but can't touch the menu, promos, or revenue data.

## Notes

- Guest (logged-out) carts live only in browser memory and don't survive a hard page refresh — add-to-cart state persists to the server only once you're logged in.
- True DDoS protection needs infrastructure in front of the app (a CDN/reverse proxy). The rate limiting here protects against realistic application-level abuse — brute-forcing tracking IDs or promo codes, credential stuffing — not a large-scale traffic flood.
