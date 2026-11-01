// Vercel serverless entry point: every request is routed here (see vercel.json).
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB(); // cached between invocations
  } catch (err) {
    console.error('Database connection failed:', err.message);
    return res.status(500).json({ message: 'Database connection failed' });
  }
  return app(req, res);
}
