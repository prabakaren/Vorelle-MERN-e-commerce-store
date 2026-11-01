# Vorelle: MERN Stack E-Commerce Store

Vorelle is a full-stack online store for small-batch homeware, carry goods and everyday tech.
It is built with **MongoDB, Express.js, React and Node.js** and covers the whole shopping
journey: browsing, searching, cart, checkout, order history and an admin dashboard.

- **Live site:** `https://YOUR-CLIENT.vercel.app` (add your link after deploying)
- **API:** `https://YOUR-API.vercel.app`

## Features

**Shoppers**
- Home page with featured products and category shortcuts
- Product list with search, category filter, price range, sorting and pagination
- Product detail page with quantity picker and "Add to cart" / "Buy now"
- Cart saved in the database: change quantities, remove items, live totals
- Checkout with shipping form, card or cash-on-delivery, order summary and confirmation
- Register, log in, update name/email/password, view order history

**Admins** (`/admin`)
- Overview: revenue, orders, products, customers, low-stock alerts
- Products: add, edit, delete
- Orders: see every order and change its status (Processing, Shipped, Delivered, Cancelled)
- Users: change roles or delete accounts

## Tech stack

| Layer    | Tools |
|----------|-------|
| Frontend | React 18, React Router 6, Vite, plain CSS (no UI library) |
| Backend  | Node.js, Express 4, JWT, bcryptjs, Helmet, CORS, express-rate-limit |
| Database | MongoDB with Mongoose models |
| Quality  | ESLint + Prettier in both folders |
| Hosting  | Vercel (frontend and backend) + MongoDB Atlas |

## Project structure

```
vorelle/
├── client/                 React app (Vite)
│   └── src/
│       ├── api.js          fetch wrapper (base URL + token)
│       ├── context/        Auth, Cart and Toast state
│       ├── components/     Navbar, Footer, ProductCard, ProductImage, ...
│       └── pages/          Home, Products, Cart, Checkout, Account, admin/
└── server/                 Express API
    ├── api/index.js        Vercel serverless entry
    ├── server.js           local entry (npm run dev)
    └── src/
        ├── models/         User, Product, Cart, Order
        ├── controllers/    business logic
        ├── routes/         URL -> controller mapping
        ├── middleware/     auth (JWT + admin), error handling
        └── seed.js         sample data + admin account
```

## Run it on your computer

You need Node.js 18+ and a MongoDB database (free MongoDB Atlas cluster or local MongoDB).

```bash
# 1. Backend
cd server
npm install
cp .env.example .env        # then edit .env (see below)
npm run seed                # creates sample products + demo accounts
npm run dev                 # API on http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000
npm run dev                 # site on http://localhost:5173
```

`server/.env`:

| Variable | Meaning |
|----------|---------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | long random text used to sign login tokens |
| `JWT_EXPIRES_IN` | token lifetime, default `7d` |
| `CLIENT_URL` | allowed frontend URL(s), comma separated |

**Demo accounts** (created by `npm run seed`)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@vorelle.shop` | `Admin@123` |
| Customer | `customer@vorelle.shop` | `Customer@123` |

> Change or delete these accounts before sharing the live site widely.

Test card for the demo checkout: `4242 4242 4242 4242`, any future expiry, any 3-digit code.
No money moves; only the last 4 digits are stored.

## Deploy: GitHub then Vercel

### 1. MongoDB Atlas
1. Create a free cluster and a database user.
2. Network Access: add `0.0.0.0/0` (Vercel uses changing IPs).
3. Copy the connection string and add `/vorelle` as the database name.
4. Seed the live database once from your computer: put the Atlas string in `server/.env`, run `npm run seed`.

### 2. Push to GitHub
```bash
cd vorelle
git init
git add .
git commit -m "Vorelle MERN e-commerce store"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/vorelle.git
git push -u origin main
```
(Create an empty public repository named `vorelle` on github.com first. `.env` files are ignored, so no secrets are uploaded.)

### 3. Deploy the backend on Vercel
1. Vercel dashboard > **Add New > Project** > import the repo.
2. **Root Directory:** `server`. Framework preset: *Other*.
3. Environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (temporary value is fine, e.g. `http://localhost:5173`).
4. Deploy. Open the URL: you should see `{"name":"Vorelle API","status":"ok"}`. Also try `/api/products`.

### 4. Deploy the frontend on Vercel
1. Add another project from the same repo. **Root Directory:** `client`. Preset: *Vite*.
2. Environment variable: `VITE_API_URL` = your backend URL (no trailing slash).
3. Deploy.

### 5. Connect them
In the backend project set `CLIENT_URL` to your frontend URL (for example `https://vorelle.vercel.app`) and **redeploy**. Without this the browser blocks requests (CORS).

## API overview

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| POST | `/api/auth/register` | public | create account |
| POST | `/api/auth/login` | public | log in, receive JWT |
| GET / PUT | `/api/auth/me` | user | read / update own details |
| GET | `/api/products` | public | list (search, category, minPrice, maxPrice, sort, page, featured) |
| GET | `/api/products/categories` | public | category names |
| GET | `/api/products/:id` | public | one product |
| POST / PUT / DELETE | `/api/products[/:id]` | admin | manage products |
| GET / POST / DELETE | `/api/cart` | user | view, add, empty cart |
| PUT / DELETE | `/api/cart/:productId` | user | change quantity / remove item |
| POST | `/api/orders` | user | place order from the server-side cart |
| GET | `/api/orders/mine` | user | order history |
| GET | `/api/orders/:id` | owner or admin | order detail |
| GET | `/api/orders` | admin | all orders |
| PUT | `/api/orders/:id/status` | admin | update status |
| GET | `/api/admin/stats` | admin | dashboard numbers |
| GET / PUT / DELETE | `/api/admin/users[/:id[/role]]` | admin | manage users |

## Security notes
- Passwords are hashed with bcrypt; they are never returned by the API.
- Login uses JWT; protected routes check the token, admin routes also check the role.
- Order prices come from the database cart, not from the browser, so they cannot be tampered with.
- Stock is reserved atomically at checkout, so two buyers cannot take the last item.
- Helmet headers, a CORS allow-list, request size limit and login rate limiting are enabled.
- Full card numbers are validated in the browser and never sent or stored.

## Scripts

| Folder | Command | What it does |
|--------|---------|--------------|
| server | `npm run dev` / `npm start` | run API with / without auto-reload |
| server | `npm run seed` / `seed:destroy` | reset sample data / wipe data |
| both | `npm run lint` | ESLint |
| both | `npm run format` | Prettier |
| client | `npm run build` | production build |
