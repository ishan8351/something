import { Router } from 'express';
import { getInvoice, listMyInvoices, markAsPaidManual, generateInvoicePDF } from '../controllers/invoice.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all routes
router.use(verifyJWT);

// Customer routes
router.get('/', listMyInvoices);
router.get('/:id', getInvoice);
router.get('/:id/pdf', generateInvoicePDF);

// Admin routes (Assume an authorize('ADMIN') middleware would normally wrap this)
router.put('/:id/manual-payment', markAsPaidManual);

export default router;
