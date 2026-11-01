import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

// GET /api/admin/stats
export const getStats = asyncHandler(async (_req, res) => {
  const [users, products, orders, revenueAgg, lowStock] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Product.find({ stock: { $lte: 5 } })
      .select('name stock')
      .sort({ stock: 1 })
      .limit(5),
  ]);
  res.json({ users, products, orders, revenue: revenueAgg[0]?.total || 0, lowStock });
});

// GET /api/admin/users
export const getUsers = asyncHandler(async (_req, res) => {
  res.json({ users: await User.find().sort({ createdAt: -1 }) });
});

// PUT /api/admin/users/:id/role  { role }
export const setUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['customer', 'admin'].includes(role)) throw new HttpError(400, 'Invalid role');
  if (req.params.id === req.user._id.toString())
    throw new HttpError(400, 'You cannot change your own role');
  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, 'User not found');
  user.role = role;
  await user.save();
  res.json({ user });
});

// DELETE /api/admin/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString())
    throw new HttpError(400, 'You cannot delete your own account');
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ message: 'User deleted' });
});
