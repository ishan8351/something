import { Router } from 'express';
import {
    createOrder,
    getMyOrders,
    updateOrderStatus,
    resellerActionOnNDR,
    getOrderById,
} from '../controllers/order.controller.js';
import { verifyJWT, authorizeRoles, requireKycApproved } from '../middlewares/auth.middleware.js';

const router = Router();

// All order routes require authentication
router.use(verifyJWT);

// Reseller placing an order (Requires Approved KYC)
router.post('/', requireKycApproved, createOrder);

// Reseller viewing their order history
router.get('/', getMyOrders);

// Reseller taking action on an NDR (Non-Delivery Report)
router.post('/:id/ndr-action', resellerActionOnNDR);

router.route('/:id').get(verifyJWT, getOrderById);

// Admin updating tracking, NDRs, and triggering Profit Payouts
router.put('/:id/status', authorizeRoles('ADMIN'), updateOrderStatus);

export default router;
