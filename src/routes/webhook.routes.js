import { Router } from 'express';
import { handleLogisticsWebhook } from '../controllers/webhook.controller.js';

const router = Router();

// Notice: We do NOT put the `verifyJWT` auth middleware here!
// This route needs to be accessible to the outside world (the courier's servers).
// Our security relies on the HMAC signature check inside the controller.
router.post('/logistics', handleLogisticsWebhook);

export default router;
