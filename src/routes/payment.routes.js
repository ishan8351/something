import { Router } from 'express';
import { verifyPaymentSignature } from '../controllers/payment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.post('/verify', verifyPaymentSignature);

export default router;
