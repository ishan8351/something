import { Router } from 'express';
import { sendOtp, loginWithOtp } from '../controllers/auth.controller.js';
import {
    getAllUsers,
    updateKycStatus,
    toggleUserStatus,
    updateMyProfile,
    updatePassword,
    updateKycDetails,
    updateUserRole,
    updateAvatar,
} from '../controllers/user.controller.js';
import { uploadImages } from '../middlewares/multer.middleware.js';

import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Forward signup OTP request to auth controller
router.post('/send-otp', (req, res, next) => {
    req.body.isLogin = false;
    return sendOtp(req, res, next);
});

// Forward login OTP request to auth controller
router.post('/send-login-otp', (req, res, next) => {
    req.body.isLogin = true;
    return sendOtp(req, res, next);
});

// Forward login verification to auth controller
router.post('/login-otp', loginWithOtp);

router.get('/admin/all', verifyJWT, authorizeRoles('ADMIN'), getAllUsers);
router.put('/admin/:id/kyc-status', verifyJWT, authorizeRoles('ADMIN'), updateKycStatus);
router.put('/admin/:id/toggle-status', verifyJWT, authorizeRoles('ADMIN'), toggleUserStatus);
router.put('/admin/:id/role', verifyJWT, authorizeRoles('ADMIN'), updateUserRole);

router.post('/avatar', verifyJWT, uploadImages.single('avatar'), updateAvatar);
router.put('/profile', verifyJWT, updateMyProfile);
router.put('/security/password', verifyJWT, updatePassword);
router.put('/kyc-update', verifyJWT, updateKycDetails);

export default router;
