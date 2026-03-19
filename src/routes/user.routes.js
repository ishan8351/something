import { Router } from 'express';
import {
    sendSignupOtp,
    sendLoginOtp,
    loginWithOtp,
    getAllUsers,
    updateKycStatus,
    toggleUserStatus,
    updateMyProfile,
    // registerUser,  <-- You still need to build this in user.controller.js
    // updateUserRole <-- You still need to build this in user.controller.js
} from '../controllers/user.controller.js';

import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// ==========================================
// PUBLIC AUTHENTICATION ROUTES
// ==========================================
router.post('/send-otp', sendSignupOtp);
router.post('/send-login-otp', sendLoginOtp);
router.post('/login-otp', loginWithOtp);

// router.post('/register', registerUser); // Uncomment when you build registerUser

// ==========================================
// ADMIN ROUTES
// ==========================================
router.get('/admin/all', verifyJWT, authorizeRoles('ADMIN'), getAllUsers);

// router.put('/admin/:id/role', verifyJWT, authorizeRoles('ADMIN'), updateUserRole); // Uncomment when built

router.put('/admin/:id/kyc-status', verifyJWT, authorizeRoles('ADMIN'), updateKycStatus);

router.put('/admin/:id/toggle-status', verifyJWT, authorizeRoles('ADMIN'), toggleUserStatus);

// ==========================================
// LOGGED-IN USER (RESELLER) ROUTES
// ==========================================
router.put('/profile', verifyJWT, updateMyProfile);

export default router;
