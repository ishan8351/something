import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return next(new ApiError(401, 'Unauthorized request: No token provided'));
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select('-passwordHash -refreshToken');

        if (!user) {
            return next(new ApiError(401, 'Invalid Access Token: User not found'));
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new ApiError(401, 'Token expired'));
        }
        return next(new ApiError(401, error?.message || 'Invalid access token'));
    }
});

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, 'Authentication required before checking roles'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, 'You are not authorized to access this route'));
        }
        next();
    };
};
