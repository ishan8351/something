import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
    {
        resellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // External Gateway Details (e.g., Razorpay)
        gatewayOrderId: {
            type: String,
            required: true,
            unique: true,
        },
        gatewayPaymentId: {
            type: String,
            sparse: true, // Only exists after successful payment
        },
        gatewaySignature: {
            type: String,
        },
        amount: {
            type: Number,
            required: true, // Amount in INR
        },
        currency: {
            type: String,
            default: 'INR',
        },
        paymentMethod: {
            type: String,
            enum: ['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NETBANKING', 'UNKNOWN'],
            default: 'UNKNOWN',
        },
        purpose: {
            type: String,
            enum: ['WALLET_RECHARGE', 'DIRECT_ORDER_PAYMENT'],
            default: 'WALLET_RECHARGE',
        },
        status: {
            type: String,
            enum: ['CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED'],
            default: 'CREATED',
        },
        errorMessage: {
            type: String, // Stores failure reasons from the gateway
        },
    },
    { timestamps: true }
);

paymentSchema.index({ resellerId: 1, status: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
