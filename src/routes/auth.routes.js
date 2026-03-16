import { Router } from 'express';
import { loginUser, logoutUser, getCurrentUser } from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Standard Auth
router.post('/login', loginUser);

// Secured Routes
router.post('/logout', verifyJWT, logoutUser);
router.get('/me', verifyJWT, getCurrentUser);

export default router;
