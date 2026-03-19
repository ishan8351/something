import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @desc    Verify JWT Token and attach user to request
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Grab token from cookies or the Authorization header (Mobile apps/Postman)
        const token =
            req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new ApiError(401, 'Unauthorized request. No token provided.');
        }

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET || 'fallback_secret'
        );

        // FIX: Added strict check to instantly block banned or soft-deleted users
        const user = await User.findOne({
            _id: decodedToken._id,
            isActive: true,
            deletedAt: null,
        }).select('-passwordHash -refreshToken');

        if (!user) {
            throw new ApiError(401, 'Invalid Access Token or Account Suspended');
        }

        // Attach the user object to the request for the next controller to use
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || 'Invalid access token');
    }
});

/**
 * @desc    Role-Based Access Control (RBAC)
 * @example router.post('/products', verifyJWT, authorizeRoles('ADMIN'), createProduct)
 */
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            throw new ApiError(
                403,
                `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`
            );
        }
        next();
    };
};

/**
 * @desc    Strict B2B Check: Ensure Reseller has completed KYC
 * @usage   Use this on routes like placing wholesale orders or withdrawing wallet funds
 */
export const requireKycApproved = asyncHandler(async (req, res, next) => {
    if (req.user.role === 'ADMIN') {
        return next(); // Admins bypass KYC checks
    }

    if (req.user.kycStatus !== 'APPROVED') {
        throw new ApiError(
            403,
            'Your KYC is still pending or rejected. Please contact support or update your GSTIN to unlock this feature.'
        );
    }

    next();
});
