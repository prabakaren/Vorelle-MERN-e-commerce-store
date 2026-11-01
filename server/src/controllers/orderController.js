import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { calculateTotals } from '../utils/pricing.js';

const ADDRESS_FIELDS = ['fullName', 'phone', 'address', 'city', 'postalCode', 'country'];

// POST /api/orders  { shippingAddress, paymentMethod, cardLast4 }
// The order is built from the SERVER-SIDE cart, so prices can never be tampered with.
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress = {}, paymentMethod, cardLast4 } = req.body;

  for (const f of ADDRESS_FIELDS) {
    if (!String(shippingAddress[f] || '').trim())
      throw new HttpError(400, `Shipping ${f} is required`);
  }
  if (!['card', 'cod'].includes(paymentMethod))
    throw new HttpError(400, 'Choose a payment method');
  if (paymentMethod === 'card' && !/^\d{4}$/.test(String(cardLast4 || ''))) {
    throw new HttpError(400, 'Card details are incomplete');
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  const lines = (cart?.items || []).filter((i) => i.product);
  if (lines.length === 0) throw new HttpError(400, 'Your cart is empty');

  // Reserve stock atomically. If any line fails, put back what we already took.
  const reserved = [];
  try {
    for (const line of lines) {
      const updated = await Product.findOneAndUpdate(
        { _id: line.product._id, stock: { $gte: line.quantity } },
        { $inc: { stock: -line.quantity } },
      );
      if (!updated)
        throw new HttpError(400, `"${line.product.name}" does not have enough stock`);
      reserved.push(line);
    }
  } catch (err) {
    await Promise.all(
      reserved.map((l) =>
        Product.updateOne({ _id: l.product._id }, { $inc: { stock: l.quantity } }),
      ),
    );
    throw err;
  }

  const items = lines.map((l) => ({
    product: l.product._id,
    name: l.product.name,
    image: l.product.image,
    tint: l.product.tint,
    price: l.product.price,
    quantity: l.quantity,
  }));
  const totals = calculateTotals(items.reduce((s, i) => s + i.price * i.quantity, 0));

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress: Object.fromEntries(
      ADDRESS_FIELDS.map((f) => [f, String(shippingAddress[f]).trim()]),
    ),
    paymentMethod,
    cardLast4: paymentMethod === 'card' ? cardLast4 : undefined,
    // Demo payment: a card order is marked paid. Swap in Stripe/PayPal here for real payments.
    paymentStatus: paymentMethod === 'card' ? 'paid' : 'pending',
    ...totals,
  });

  cart.items = [];
  await cart.save();
  res.status(201).json({ order });
});

// GET /api/orders/mine
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

// GET /api/orders/:id  (the owner or an admin)
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw new HttpError(404, 'Order not found');
  const ownerId = order.user._id.toString();
  if (ownerId !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new HttpError(403, 'You cannot view this order');
  }
  res.json({ order });
});

// GET /api/orders  (admin)
export const getAllOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email');
  res.json({ orders });
});

// PUT /api/orders/:id/status  (admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
    throw new HttpError(400, 'Invalid status');
  }
  const order = await Order.findById(req.params.id);
  if (!order) throw new HttpError(404, 'Order not found');

  // Cancelling returns the items to stock (only once).
  if (status === 'Cancelled' && order.status !== 'Cancelled') {
    await Promise.all(
      order.items.map((i) =>
        Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } }),
      ),
    );
  }
  if (status === 'Delivered' && order.paymentMethod === 'cod')
    order.paymentStatus = 'paid';
  order.status = status;
  await order.save();
  res.json({ order });
});
