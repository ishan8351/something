import { Router } from 'express';
import {
    createOrder,
    getMyOrders,
    updateOrderStatus,
    resellerActionOnNDR,
    getOrderById,
    getAllAdminOrders,
    exportAdminOrdersToCsv,
    exportCourierOrdersToCsv,
    createBulkDropshipOrders,
} from '../controllers/order.controller.js';
import { verifyJWT, authorizeRoles, requireKycApproved } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { orderValidation } from '../validations/order.validation.js';

const router = Router();

router.use(verifyJWT);

router.get('/all', authorizeRoles('ADMIN'), getAllAdminOrders);
router.get('/export', authorizeRoles('ADMIN'), exportAdminOrdersToCsv);
router.get('/export-courier', authorizeRoles('ADMIN'), exportCourierOrdersToCsv);
router.route('/bulk-dropship').post(verifyJWT, createBulkDropshipOrders);
router.put('/:id/status', authorizeRoles('ADMIN'), updateOrderStatus);

router.post('/', requireKycApproved, createOrder);

router.get('/', validate(orderValidation.getMyOrders), getMyOrders);

router.post('/:id/ndr-action', resellerActionOnNDR);

router.get('/:id', getOrderById);

export default router;
