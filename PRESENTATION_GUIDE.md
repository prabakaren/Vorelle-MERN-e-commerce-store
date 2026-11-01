# Presentation guide for Vorelle

## 1. One-minute pitch
"Vorelle is a full MERN stack online store. Shoppers can search and filter products, keep a
cart saved in the database, check out with card or cash on delivery, and see their order
history. An admin dashboard lets the store owner manage products, orders and users. The
React frontend and the Express API are both deployed on Vercel and use MongoDB Atlas."

## 2. Suggested demo order (5 to 7 minutes)
1. **Home page**: hero, featured products, category chips.
2. **Shop**: type in the search box, pick a category, sort by price, set a price range. Point out the URL changes (filters live in the URL, so links can be shared).
3. **Product page** > Add to cart. Click Cart in the navbar: change quantity, see totals and free-shipping message.
4. **Register** a new account (or log in as customer). Mention the JWT token.
5. **Checkout**: fill the address, choose card (4242 4242 4242 4242) and place the order. Show the confirmation page and **Account > Order history**.
6. Log out, log in as **admin** (`admin@vorelle.shop`). Show Overview, add a product, change an order to Shipped, show Users.
7. Show the stock dropping after the order and the low-stock list on the overview.
8. Resize the browser (or open on a phone) to show it is responsive.
9. Open GitHub: README, folders, commits. Open the Vercel dashboard.

## 3. How it works (explain with this diagram)

```
Browser (React on Vercel)
   │  fetch + "Authorization: Bearer <JWT>"
   ▼
Express API (Vercel serverless function)
   │  routes → middleware (auth) → controllers
   ▼
Mongoose models → MongoDB Atlas (Users, Products, Carts, Orders)
```

**Frontend**
- *React Router* gives each page its own URL. `RequireAuth` protects cart, checkout, account and admin pages.
- *Context API* holds global state: `AuthContext` (user + token), `CartContext` (cart from the server), `ToastContext` (messages). No extra state library was needed.
- `api.js` is one small fetch wrapper that adds the base URL and token to every request.
- `ProductImage` draws a coloured tile with initials when a product has no photo, so the layout never breaks. Admins can paste a real image URL.

**Backend**
- `routes/` map URLs to `controllers/`; `middleware/auth.js` has `protect` (valid JWT) and `adminOnly` (role check).
- `errorHandler` turns every error into a clean JSON message.
- `db.js` caches the MongoDB connection so serverless invocations reuse it.

**Database collections**
- **User**: name, email, hashed password, role (customer or admin)
- **Product**: name, description, price, category, image, stock, featured, rating
- **Cart**: one per user, list of `{product, quantity}`
- **Order**: user, item snapshot (name and price at purchase time), address, payment, totals, status

## 4. Points that show you understand the project
- **Authentication**: on login the server compares the password with bcrypt and returns a JWT. The browser stores it and sends it in the `Authorization` header. The server verifies it on every protected route.
- **Authorization**: customers can only see their own orders; `adminOnly` blocks everything under `/api/admin` and product editing for non-admins. Role can't be set during registration.
- **Why the cart is on the server**: it follows the user across devices, and checkout can trust it.
- **Why orders are built on the server**: the browser only sends the address and payment method. The server reads the cart and current prices from MongoDB, so nobody can edit a price in dev tools.
- **Order items are copied** (name, price) into the order, so old orders stay correct even if the product price changes later.
- **Stock safety**: `findOneAndUpdate({stock: {$gte: qty}}, {$inc: {stock: -qty}})` is atomic. If any item fails, earlier reservations are rolled back. Cancelling an order puts stock back.
- **Payment**: this is a demo flow. Card details are validated (Luhn check) in the browser; only the last 4 digits are stored. For real payments you would plug Stripe into `createOrder`.
- **Deployment**: two Vercel projects (client root `client`, server root `server`), environment variables for secrets, and `CLIENT_URL` for CORS.

## 5. Likely questions and short answers
**Why MERN?** One language (JavaScript) across the whole stack, JSON everywhere, and MongoDB's flexible documents suit products and orders.

**Why JWT instead of sessions?** The API is stateless, which fits serverless hosting on Vercel, and the same API could serve a mobile app.

**Where are passwords stored?** Only as bcrypt hashes in MongoDB; the field is excluded from queries by default (`select: false`).

**How do you stop a normal user opening /admin?** Two layers: the React route redirects non-admins, and the API rejects admin endpoints with 403. The API check is the one that really protects the data.

**What would you add next?** Real Stripe payments, product image uploads, reviews, email order confirmations, automated tests.

**What was hardest?** (Pick your own: for example CORS between two Vercel projects, or making stock updates safe when two people buy at once.)

## 6. Before presenting: checklist
- [ ] Both Vercel links open and `CLIENT_URL` / `VITE_API_URL` are set
- [ ] Live database is seeded (`npm run seed` with the Atlas string)
- [ ] You tried register, add to cart, checkout and admin on the **live** site
- [ ] README has your live links; repository is **public**
- [ ] Atlas Network Access allows `0.0.0.0/0`
- [ ] The first request after idle time can be slow (serverless cold start): open the site a minute before you present
