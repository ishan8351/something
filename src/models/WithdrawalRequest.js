import mongoose from 'mongoose';

const withdrawalRequestSchema = new mongoose.Schema(
    {
        resellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        requestedAmount: {
            type: Number,
            required: true,
            min: 1,
        },
        transferredAmount: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'success', 'failed'],
            default: 'pending',
        },
        reason: {
            type: String,
            default: '',
        },
        txnId: {
            type: String,
            default: '',
        },
        screenshotUrl: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

export const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
