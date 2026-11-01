import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

// Loads the user's cart (creating an empty one if needed) with product details.
async function loadCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  await cart.populate('items.product');
  // Clean out lines whose product was deleted by an admin.
  const valid = cart.items.filter((i) => i.product);
  if (valid.length !== cart.items.length) {
    await Cart.updateOne(
      { _id: cart._id },
      { items: valid.map((i) => ({ product: i.product._id, quantity: i.quantity })) },
    );
  }
  return { items: valid };
}

// Converts a cart document into the JSON the frontend needs.
function format(cart) {
  const items = cart.items.map((i) => ({
    product: i.product,
    quantity: i.quantity,
    lineTotal: i.product.price * i.quantity,
  }));
  return {
    items,
    itemsCount: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: items.reduce((sum, i) => sum + i.lineTotal, 0),
  };
}

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  res.json(format(await loadCart(req.user._id)));
});

// POST /api/cart  { productId, quantity }
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const qty = Math.max(parseInt(quantity, 10) || 1, 1);

  const product = await Product.findById(productId);
  if (!product) throw new HttpError(404, 'Product not found');

  const cart =
    (await Cart.findOne({ user: req.user._id })) ||
    (await Cart.create({ user: req.user._id, items: [] }));
  const line = cart.items.find((i) => i.product.toString() === productId);
  const newQty = (line ? line.quantity : 0) + qty;
  if (newQty > product.stock)
    throw new HttpError(400, `Only ${product.stock} left in stock`);

  if (line) line.quantity = newQty;
  else cart.items.push({ product: productId, quantity: qty });
  await cart.save();

  res.status(201).json(format(await loadCart(req.user._id)));
});

// PUT /api/cart/:productId  { quantity }
export const updateCartItem = asyncHandler(async (req, res) => {
  const qty = parseInt(req.body.quantity, 10);
  if (!qty || qty < 1) throw new HttpError(400, 'Quantity must be at least 1');

  const product = await Product.findById(req.params.productId);
  if (!product) throw new HttpError(404, 'Product not found');
  if (qty > product.stock)
    throw new HttpError(400, `Only ${product.stock} left in stock`);

  const cart = await Cart.findOne({ user: req.user._id });
  const line = cart?.items.find((i) => i.product.toString() === req.params.productId);
  if (!line) throw new HttpError(404, 'That item is not in your cart');

  line.quantity = qty;
  await cart.save();
  res.json(format(await loadCart(req.user._id)));
});

// DELETE /api/cart/:productId
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
  }
  res.json(format(await loadCart(req.user._id)));
});

// DELETE /api/cart  (empty the cart)
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ items: [], itemsCount: 0, subtotal: 0 });
});
