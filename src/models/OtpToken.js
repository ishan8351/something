import mongoose from 'mongoose';

const otpTokenSchema = new mongoose.Schema(
    {
        // Changed from ObjectId to String so it can hold a phone number during signup
        identifier: { type: String, required: true },
        otpCode: { type: String, required: true },
        isUsed: { type: Boolean, default: false },
        expiresAt: { type: Date, required: true, expires: 0 }, // TTL Index
    },
    { timestamps: true }
);

// Prevent multiple active OTPs for the same number
otpTokenSchema.index(
    { identifier: 1 },
    { unique: true, partialFilterExpression: { isUsed: false } }
);

export const OtpToken = mongoose.model('OtpToken', otpTokenSchema);
