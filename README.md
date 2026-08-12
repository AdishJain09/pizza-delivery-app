# Pizza Delivery Full-Stack Application

MERN stack pizza ordering and inventory management platform with separate User and Admin roles, a custom pizza builder, Razorpay test-mode checkout, real-time (polling) order tracking, and automated low-stock email alerts via node-cron.

## Stack
- Frontend: React (Vite) + React Router + Axios
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Payments: Razorpay (test mode)
- Email: Nodemailer
- Scheduled jobs: node-cron

## Project structure
```
pizza-delivery-app/
  backend/
    config/db.js
    models/            User, Admin, Inventory, Order
    middleware/auth.js protectUser / protectAdmin (JWT)
    controllers/        auth, admin auth, inventory, orders
    routes/
    jobs/stockCheckCron.js   low-stock email alert, every 30 min
    seed/seedInventory.js    seeds ingredients + one admin account
    server.js
  frontend/
    src/pages/           Register, Login, ForgotPassword, ResetPassword,
                          Dashboard, PizzaBuilder, OrderSummary, OrderTracking,
                          AdminLogin, AdminDashboard, OrderManagement
    src/context/AuthContext.jsx
    src/services/api.js
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
- `MONGO_URI` — your local or Atlas MongoDB connection string
- `JWT_SECRET` — any long random string
- `SMTP_USER` / `SMTP_PASS` — an email account for Nodemailer (for Gmail, use an App Password)
- `ADMIN_ALERT_EMAIL` — where low-stock alerts should be sent
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from your Razorpay **test mode** dashboard
- `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` — credentials for the seeded admin account

Seed the database (creates 5 bases, 5 sauces, 5 cheeses, 8 vegetables, and one admin login):

```bash
npm run seed
```

Start the API:

```bash
npm run dev
```

Runs on `http://localhost:5000`.

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` (Vite dev server proxies `/api` to `http://localhost:5000`).

## 3. Using the app

**As a user:**
1. Register → check the inbox tied to `SMTP_USER`/the sandbox for the verification email → click the link.
2. Log in → Dashboard shows current ingredient availability.
3. "Build a Pizza" → base → sauce → cheese → vegetables (multi-select) → Review Order.
4. Order Summary → set quantity → "Pay & Place Order" opens Razorpay's test checkout. Use any Razorpay test card (e.g. `4111 1111 1111 1111`, any future expiry, any CVV) or UPI test flow, and click Success.
5. On success the order is verified server-side (HMAC signature check), stock is decremented, and the order appears on "My Orders" with a live status tracker that polls every 5 seconds.

**As an admin:**
1. Go to `/admin/login`, use the seeded `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` (this route is separate from user registration/login, per the spec).
2. Inventory dashboard: view stock per base/sauce/cheese/vegetable, edit the number, Save to update.
3. Order Management: see every order with customer info, and change its status through Order Received → In Kitchen → Sent to Delivery → Delivered. The user's tracker reflects this within 5 seconds via polling.
4. Every 30 minutes, `jobs/stockCheckCron.js` checks all inventory items against their configurable `lowStockThreshold` (default 20, editable per item) and emails `ADMIN_ALERT_EMAIL` once per breach (resets when restocked above threshold).

## Notes on implementation choices
- **Real-time updates** use polling (5s for users, 8s for admin) rather than WebSockets — simpler to run locally with no extra infrastructure, and satisfies the spec which allows either.
- **Payment verification** is done server-side using Razorpay's HMAC signature check against `razorpay_order_id` + `razorpay_payment_id`, so a client can't fake a successful payment.
- **Stock decrement** happens atomically per item inside `verifyAndPlaceOrder`, after checking every required ingredient has enough stock; if any ingredient is out, the whole order is rejected before payment is finalized in the DB.
- Admin accounts are a separate Mongo collection (`Admin`) with their own JWT role claim (`role: "admin"`), so there's no shared login surface with users.
