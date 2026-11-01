import User from '../models/User.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { signToken } from '../utils/token.js';

// Shape of the user object sent to the client (never includes the password).
const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role });

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    throw new HttpError(400, 'Name, email and password are required');
  if (String(password).length < 6)
    throw new HttpError(400, 'Password must be at least 6 characters');

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) throw new HttpError(409, 'That email is already registered');

  // role is never taken from the request body, so nobody can register as admin
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new HttpError(400, 'Email and password are required');

  const user = await User.findOne({ email: String(email).toLowerCase() }).select(
    '+password',
  );
  if (!user || !(await user.matchPassword(password))) {
    throw new HttpError(401, 'Incorrect email or password');
  }
  res.json({ token: signToken(user._id), user: publicUser(user) });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// PUT /api/auth/me  (update own name / email / password)
export const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const { name, email, password, currentPassword } = req.body;

  if (name) user.name = name;
  if (email && email.toLowerCase() !== user.email) {
    const taken = await User.findOne({ email: email.toLowerCase() });
    if (taken) throw new HttpError(409, 'That email is already registered');
    user.email = email;
  }
  if (password) {
    if (!currentPassword || !(await user.matchPassword(currentPassword))) {
      throw new HttpError(400, 'Current password is incorrect');
    }
    if (password.length < 6)
      throw new HttpError(400, 'New password must be at least 6 characters');
    user.password = password;
  }
  await user.save();
  res.json({ token: signToken(user._id), user: publicUser(user) });
});
