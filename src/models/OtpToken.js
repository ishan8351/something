import mongoose from 'mongoose';

const otpTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    otpCode: { type: String, required: true },
    isUsed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, expires: 0 } // TTL Index
}, { timestamps: true });

// The Reviewer's Partial Index Constraint
otpTokenSchema.index(
    { userId: 1 },
    { unique: true, partialFilterExpression: { isUsed: false } }
);

export const OtpToken = mongoose.model('OtpToken', otpTokenSchema);