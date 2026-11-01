import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

// Requires a valid "Authorization: Bearer <token>" header.
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Please log in to continue');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, 'Your session has expired. Please log in again');
  }

  const user = await User.findById(payload.id);
  if (!user) throw new HttpError(401, 'This account no longer exists');
  req.user = user;
  next();
});

// Only lets admins through (use after `protect`).
export const adminOnly = (req, _res, next) => {
  if (req.user?.role !== 'admin') return next(new HttpError(403, 'Admins only'));
  next();
};
