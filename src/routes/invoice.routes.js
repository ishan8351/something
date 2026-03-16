import { Router } from 'express';
import { getInvoice, listMyInvoices, markAsPaidManual, generateInvoicePDF } from '../controllers/invoice.controller.js';
import { verifyJWT, authorize } from '../middlewares/auth.middleware.js'; // Imported authorize!

const router = Router();

// Protect all routes
router.use(verifyJWT);

// Customer routes
router.get('/', listMyInvoices);
router.get('/:id', getInvoice);
router.get('/:id/pdf', generateInvoicePDF);

// Admin routes (Properly secured!)
router.put('/:id/manual-payment', authorize('ADMIN'), markAsPaidManual);

export default router;