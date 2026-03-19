import { User } from '../models/User.js';
import { OtpToken } from '../models/OtpToken.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
};

const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const sendSignupOtp = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) throw new ApiError(400, 'Phone number is required');

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) throw new ApiError(409, 'Phone number already registered');

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    await OtpToken.updateMany({ identifier: phoneNumber, isUsed: false }, { isUsed: true });
    await OtpToken.create({
        identifier: phoneNumber,
        otpCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    console.log(`\n📱 SMS SENT TO ${phoneNumber}: Your Sovely SIGNUP OTP is ${otpCode}\n`);
    return res.status(200).json(new ApiResponse(200, null, 'OTP sent successfully'));
});

export const sendLoginOtp = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) throw new ApiError(400, 'Phone number is required');

    const existingUser = await User.findOne({ phoneNumber });
    if (!existingUser) throw new ApiError(404, 'Phone number not registered. Please sign up.');

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    await OtpToken.updateMany({ identifier: phoneNumber, isUsed: false }, { isUsed: true });
    await OtpToken.create({
        identifier: phoneNumber,
        otpCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    console.log(`\n📱 SMS SENT TO ${phoneNumber}: Your Sovely LOGIN OTP is ${otpCode}\n`);
    return res.status(200).json(new ApiResponse(200, null, 'Login OTP sent successfully'));
});

export const loginWithOtp = asyncHandler(async (req, res) => {
    const { phoneNumber, otpCode } = req.body;
    if (!phoneNumber || !otpCode) throw new ApiError(400, 'Phone and OTP required');

    // FIX: Ensure user isn't banned
    const user = await User.findOne({ phoneNumber, isActive: true, deletedAt: null });
    if (!user) throw new ApiError(404, 'User not found or account suspended');

    const validOtp = await OtpToken.findOneAndUpdate(
        {
            identifier: phoneNumber,
            otpCode,
            isUsed: false,
            expiresAt: { $gt: new Date() },
        },
        { isUsed: true },
        { new: true }
    );

    if (!validOtp) throw new ApiError(400, 'Invalid or expired OTP');

    // FIX: Generate both Access and Refresh Tokens to match auth.controller.js
    const accessToken = user.generateAccessToken();
    const refreshToken = jwt.sign(
        { _id: user._id },
        process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret',
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const loggedInUser = await User.findById(user._id).select('-passwordHash -refreshToken');

    return res
        .status(200)
        .cookie('accessToken', accessToken, cookieOptions)
        .cookie('refreshToken', refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                'Logged in successfully'
            )
        );
});

// ==========================================
// ADMIN USER MANAGEMENT
// ==========================================

export const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const role = req.query.role || 'ALL';
    const kycStatus = req.query.kycStatus || 'ALL'; // FIX: Replaced b2bStatus
    const isActive = req.query.isActive || 'ALL'; // NEW: Filter by banned users

    // FIX: Hide soft-deleted users from the main table
    const query = { deletedAt: null };

    if (search) {
        const safeSearch = escapeRegex(search);
        query['$or'] = [
            { name: { $regex: safeSearch, $options: 'i' } },
            { email: { $regex: safeSearch, $options: 'i' } },
            { phoneNumber: { $regex: safeSearch, $options: 'i' } },
            { companyName: { $regex: safeSearch, $options: 'i' } },
            { gstin: { $regex: safeSearch, $options: 'i' } },
        ];
    }

    if (role !== 'ALL') query.role = role;
    if (kycStatus !== 'ALL') query.kycStatus = kycStatus;
    if (isActive !== 'ALL') query.isActive = isActive === 'true';

    const total = await User.countDocuments(query);
    const users = await User.find(query)
        .select('-passwordHash -refreshToken') // Protect tokens
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                data: users,
                pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
            },
            'Users fetched successfully'
        )
    );
});

export const updateKycStatus = asyncHandler(async (req, res) => {
    const { kycStatus } = req.body; // Expects: 'PENDING', 'APPROVED', 'REJECTED'

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(kycStatus)) {
        throw new ApiError(400, 'Invalid KYC Status. Must be PENDING, APPROVED, or REJECTED.');
    }

    const user = await User.findByIdAndUpdate(req.params.id, { kycStatus }, { new: true }).select(
        '-passwordHash -refreshToken'
    );

    if (!user) throw new ApiError(404, 'User not found');

    return res
        .status(200)
        .json(new ApiResponse(200, user, `User KYC status updated to ${kycStatus}`));
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            isActive,
            // If banning, destroy their refresh token so they are immediately kicked out
            ...(isActive === false ? { refreshToken: null } : {}),
        },
        { new: true }
    ).select('-passwordHash -refreshToken');

    if (!user) throw new ApiError(404, 'User not found');

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                `User account has been ${isActive ? 'activated' : 'suspended'}`
            )
        );
});

// ==========================================
// RESELLER PROFILE MANAGEMENT
// ==========================================

export const updateMyProfile = asyncHandler(async (req, res) => {
    const { companyName, bankDetails, billingAddress } = req.body;

    // We only allow updating business info here, not critical auth data like email/phone
    const updateData = {};
    if (companyName) updateData.companyName = companyName;
    if (bankDetails) updateData.bankDetails = bankDetails;
    if (billingAddress) updateData.billingAddress = billingAddress;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).select('-passwordHash -refreshToken');

    return res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
});
