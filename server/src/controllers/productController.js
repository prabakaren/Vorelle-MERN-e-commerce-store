import Product from '../models/Product.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=&featured=
export const getProducts = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, sort, featured } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);

  const filter = {};
  if (search) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ name: rx }, { description: rx }, { category: rx }];
  }
  if (category && category !== 'all') filter.category = category;
  if (featured === 'true') filter.featured = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sorts = {
    newest: { createdAt: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    rating: { rating: -1 },
  };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sorts[sort] || sorts.newest)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ products, page, pages: Math.ceil(total / limit) || 1, total });
});

// GET /api/products/categories
export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Product.distinct('category');
  res.json({ categories: categories.sort() });
});

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found');
  res.json({ product });
});

// Only these fields can be set from the request body.
const pick = (body) => {
  const fields = [
    'name',
    'description',
    'price',
    'category',
    'image',
    'tint',
    'stock',
    'featured',
    'rating',
  ];
  return Object.fromEntries(
    fields.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]),
  );
};

// POST /api/products  (admin)
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(pick(req.body));
  res.status(201).json({ product });
});

// PUT /api/products/:id  (admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found');
  Object.assign(product, pick(req.body));
  await product.save();
  res.json({ product });
});

// DELETE /api/products/:id  (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found');
  res.json({ message: 'Product deleted' });
});
