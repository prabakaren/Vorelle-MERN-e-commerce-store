import mongoose from 'mongoose';

// Cache the connection so serverless functions (Vercel) reuse it between calls.
let cached = global.__vorelleMongo;
if (!cached) cached = global.__vorelleMongo = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set');
  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose.connect(process.env.MONGO_URI, { bufferCommands: false });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
