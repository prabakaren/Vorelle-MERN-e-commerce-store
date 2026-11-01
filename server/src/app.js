import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();

// Vercel (and most hosts) sit behind a proxy; needed for correct client IPs in rate limiting.
app.set('trust proxy', 1);

// --- Security & utility middleware ---
app.use(helmet());
const allowed = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''));
app.use(
  cors({
    origin: (origin, cb) =>
      !origin || allowed.includes(origin) ? cb(null, true) : cb(null, false),
  }),
);
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Slow down password guessing on login/register.
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// --- Routes ---
app.get('/', (_req, res) => res.json({ name: 'Vorelle API', status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// --- Errors ---
app.use(notFound);
app.use(errorHandler);

export default app;
