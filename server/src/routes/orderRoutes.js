import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { adminOnly, protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.post('/', createOrder);
router.get('/mine', getMyOrders); // must come before "/:id"
router.get('/', adminOnly, getAllOrders);
router.get('/:id', getOrder);
router.put('/:id/status', adminOnly, updateOrderStatus);
export default router;
