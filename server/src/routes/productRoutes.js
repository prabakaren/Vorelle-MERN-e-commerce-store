import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProduct,
  getProducts,
  updateProduct,
} from '../controllers/productController.js';
import { adminOnly, protect } from '../middleware/auth.js';

const router = Router();
router.get('/', getProducts);
router.get('/categories', getCategories); // must come before "/:id"
router.get('/:id', getProduct);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
export default router;
