import { Router } from 'express';
import { verifyPaymentSignature, createRazorpayOrder } from '../controllers/payment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all payment routes so only logged-in users can access them
router.use(verifyJWT);

// Create the Razorpay order before opening the widget
router.post('/create-order', createRazorpayOrder);

// Verify the payment signature after the widget closes successfully
router.post('/verify', verifyPaymentSignature);

export default router;
