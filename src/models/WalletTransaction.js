import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
    {
        resellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['CREDIT', 'DEBIT'],
            required: true,
        },
        purpose: {
            type: String,
            enum: [
                'WALLET_RECHARGE', // Reseller added funds via gateway
                'ORDER_DEDUCTION', // Platform deducted base cost for an order
                'PROFIT_CREDIT', // Platform credited COD profit to reseller
                'RTO_PENALTY', // Deduction for Return-to-Origin shipping costs
                'REFUND', // Order cancelled, funds returned to wallet
                'BANK_WITHDRAWAL', // Reseller cashed out to their bank
            ],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 1,
        },
        // Captures the wallet balance immediately after this transaction for audit trails
        closingBalance: {
            type: Number,
            required: true,
        },
        referenceId: {
            type: String, // Can be OrderId, PaymentId, or WithdrawalRequestId
            required: true,
        },
        description: {
            type: String, // e.g., "Profit credited for Order #10045"
        },
        status: {
            type: String,
            enum: ['PENDING', 'COMPLETED', 'FAILED'],
            default: 'COMPLETED',
        },
    },
    { timestamps: true }
);

export const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
