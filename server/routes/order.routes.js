import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createOrder,
  listMyOrders,
  getOrder,
  listAllOrders,
  updateOrderStatus,
  verifyOrderPayment,
  cancelOrder
} from '../controllers/orderController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many orders placed. Try again later.' }
});
const globalOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: () => 'global',
  message: { error: 'Store is busy right now. Try again later.' }
});

router.post('/', globalOrderLimiter, orderLimiter, requireAuth, createOrder);
router.post('/:id/verify-payment', requireAuth, verifyOrderPayment);
router.get('/mine', requireAuth, listMyOrders);
router.get('/all', requireAuth, requireAdmin, listAllOrders);
router.get('/:id', requireAuth, getOrder);
router.post('/:id/cancel', requireAuth, cancelOrder);
router.patch('/:id/status', requireAuth, requireAdmin, updateOrderStatus);

export default router;
