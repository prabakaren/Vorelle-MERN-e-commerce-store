import { Router } from 'express';
import {
  deleteUser,
  getStats,
  getUsers,
  setUserRole,
} from '../controllers/adminController.js';
import { adminOnly, protect } from '../middleware/auth.js';

const router = Router();
router.use(protect, adminOnly);
router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/role', setUserRole);
router.delete('/users/:id', deleteUser);
export default router;
