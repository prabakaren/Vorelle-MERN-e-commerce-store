import { Router } from 'express';
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect); // every cart route needs a logged-in user
router.get('/', getCart);
router.post('/', addToCart);
router.delete('/', clearCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeCartItem);
export default router;
