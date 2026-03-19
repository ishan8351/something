import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller.js';

// FIX: Changed 'authorize' to 'authorizeRoles' to match your middleware export
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// FIX: Applied authorizeRoles
// This protects all routes attached to this router moving forward
router.use(verifyJWT, authorizeRoles('ADMIN'));

router.get('/admin', getDashboardAnalytics);

export default router;
