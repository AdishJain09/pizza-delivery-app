# Pizza Delivery Full-Stack Application

MERN stack pizza ordering and inventory management platform with separate User and Admin roles, a custom pizza builder, Razorpay test-mode checkout, real-time (polling) order tracking, and automated low-stock email alerts via node-cron.

## Stack
- Frontend: React (Vite) + React Router + Axios
- Backend: Node.js + Express
- Database: MongoDB (Mongoose) — MongoDB Atlas recommended over a local install
- Payments: Razorpay (test mode)
- Email: Nodemailer (Gmail SMTP + App Password)
- Scheduled jobs: node-cron
- Package manager: npm

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

## 1. Database — MongoDB Atlas (recommended)

A local `mongod` install can run into Windows-specific service/networking issues. Atlas avoids all of that:

1. Sign up free at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free **M0** cluster
3. Under **Database Access**, add a database user (username + password)
4. Under **Network Access**, add IP `0.0.0.0/0` ("Allow access from anywhere") for local dev
5. Cluster → **Connect** → **Drivers** → copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pizza-delivery?retryWrites=true&w=majority
   ```
   Replace `<username>` and `<password>` with your actual values (no angle brackets).

If you'd rather run MongoDB locally instead, install **MongoDB Community Server** (not just Compass — Compass is only the GUI viewer and needs the server running separately) from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community), choose the **Complete** setup so it installs as a Windows service, then confirm with:
```powershell
Get-Service -Name MongoDB
```

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Where to get it |
|---|---|
| `MONGO_URI` | Your Atlas connection string (or `mongodb://127.0.0.1:27017/pizza-delivery` if running locally) |
| `JWT_SECRET` | Any long random string you make up |
| `CLIENT_URL` | The exact URL your frontend runs on — see note below |
| `SMTP_HOST` | `smtp.gmail.com` (fixed value, don't change) |
| `SMTP_PORT` | `587` (fixed value, don't change) |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | A Gmail **App Password** — not your normal password. Requires 2-Step Verification enabled on the account, then generate one at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) |
| `ADMIN_ALERT_EMAIL` | Any inbox you want low-stock alerts sent to (can equal `SMTP_USER`) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | From your Razorpay dashboard, **test mode** only (Settings → API Keys) |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | Whatever you want the seeded admin login to be |

**Important — `CLIENT_URL` must match your actual frontend port.** Vite defaults to `5173`, but will auto-switch to `5174` or another port if `5173` is unavailable (this happened during local testing on Windows due to a port-permission conflict). Check the terminal output when you start the frontend (`Local: http://localhost:XXXX`) and make sure `CLIENT_URL` in `.env` matches exactly — otherwise email verification and password reset links will point to the wrong address and fail to open.

Seed the database (creates 5 bases, 5 sauces, 5 cheeses, 8 vegetables, and one admin login):
```bash
npm run seed
```
Confirm it finishes with no errors.

Start the API:
```bash
npm run dev
```
Confirm the terminal prints both `MongoDB connected` and `Server running on port 5000` before moving on. If you see `MongooseServerSelectionError` / `ECONNREFUSED`, the database isn't reachable — double check Step 1.

## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` normally, or `http://localhost:5174` if `5173` is unavailable on your machine (Vite dev server proxies `/api` calls to `http://localhost:5000` either way). Take note of whichever port it actually starts on and make sure it matches `CLIENT_URL` in the backend `.env` (see above).

**If you get `EACCES: permission denied` on any port at startup:** this is a Windows-specific issue, not an app bug — usually antivirus/firewall intercepting socket binds, or a Hyper-V/WSL2 reserved port range. Try running the terminal as Administrator, or temporarily disable real-time antivirus protection to confirm that's the cause.

## 4. Using the app

**As a user:**
1. Register → check the inbox tied to `SMTP_USER` for the verification email → click the link.
2. Log in → Dashboard shows current ingredient availability.
3. "Build a Pizza" → base → sauce → cheese → vegetables (multi-select) → Review Order.
4. Order Summary → set quantity → "Pay & Place Order" opens Razorpay's test checkout. Use test card `4111 1111 1111 1111`, any future expiry, any CVV, and click Success.
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
- MongoDB Atlas is recommended over a local install specifically because of Windows-specific service/permission issues encountered running MongoDB Community Server locally during development.

## Troubleshooting quick reference

| Symptom | Likely cause | Fix |
|---|---|---|
| `MongooseServerSelectionError: ECONNREFUSED 127.0.0.1:27017` | No local MongoDB server running | Switch to Atlas, or install MongoDB Community Server and confirm the service is running |
| `key_id or oauthToken is mandatory` (Razorpay) | `.env` not loaded / missing values | Confirm `backend/.env` exists (not `.env.example`), is in `backend/`, and has real values |
| `EACCES: permission denied` on Vite startup | Windows port/antivirus issue | Try a different port in `vite.config.js`, or run terminal as Administrator |
| Verification/reset email link doesn't open | `CLIENT_URL` doesn't match the frontend's actual port | Update `CLIENT_URL` in `backend/.env`, restart backend, generate a fresh link |
| Emails not sending | Using regular Gmail password instead of an App Password | Generate one at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (requires 2-Step Verification enabled) |