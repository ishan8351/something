import { Router } from 'express';
import {
    getInvoice,
    listMyInvoices,
    markAsPaidManual,
    generateInvoicePDF,
    getAllInvoices,
} from '../controllers/invoice.controller.js';

import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply JWT verification to all invoice routes
router.use(verifyJWT);

// ==========================================
// ADMIN ROUTES (Must go BEFORE /:id routes)
// ==========================================
router.get('/admin/all', authorizeRoles('ADMIN'), getAllInvoices);

// ==========================================
// GENERAL USER ROUTES
// ==========================================
router.get('/', listMyInvoices);

// ==========================================
// DYNAMIC ID ROUTES (Must go LAST)
// ==========================================
router.get('/:id', getInvoice);
router.get('/:id/pdf', generateInvoicePDF);

router.put('/:id/manual-payment', authorizeRoles('ADMIN'), markAsPaidManual);

router.get('/order/:orderId/pdf', generateInvoicePDF);

export default router;
