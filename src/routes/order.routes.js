import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { placeOrder, getMyOrders, getOrderById, cancelOrder, updateOrderStatus, getAllOrders } from '../controllers/order.controller.js';

const router = Router();

router.use(verifyJWT);


router.post('/', placeOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
// Admin route to fetch all orders across the store
router.get('/admin/all', getAllOrders);
// Admin/Warehouse route to update status and add tracking
router.put('/:id/status', updateOrderStatus);
export default router;
