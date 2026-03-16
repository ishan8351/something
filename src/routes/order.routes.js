import { Router } from 'express';
import { verifyJWT, authorize } from '../middlewares/auth.middleware.js';
import { placeOrder, getMyOrders, getOrderById, cancelOrder, updateOrderStatus, getAllOrders } from '../controllers/order.controller.js';

const router = Router();

// Protect all routes below this line
router.use(verifyJWT);

// Customer Routes
router.post('/', placeOrder);
router.get('/', getMyOrders);

// 🚨 ADMIN ROUTES (Must go BEFORE the /:id dynamic routes!) 🚨
router.get('/admin/all', authorize('ADMIN'), getAllOrders);
router.put('/:id/status', authorize('ADMIN'), updateOrderStatus);

// Dynamic Parameter Routes
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

export default router;