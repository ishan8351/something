import { Invoice } from '../models/Invoice.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { Counter } from '../models/Counter.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { razorpayInstance } from './payment.controller.js';

export const getBalance = asyncHandler(async (req, res) => {
    const balance = req.user.walletBalance || 0;
    return res.status(200).json(new ApiResponse(200, { balance }, 'Wallet balance fetched'));
});

export const getTransactionHistory = asyncHandler(async (req, res) => {
    // FIX: Changed userId to resellerId to match the schema
    const transactions = await WalletTransaction.find({ resellerId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);
    return res.status(200).json(new ApiResponse(200, transactions, 'Transaction history fetched'));
});

export const addMoney = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const resellerId = req.user._id;

    if (!amount || amount <= 0) {
        throw new ApiError(400, 'Valid amount is required to add money');
    }

    const invoiceNumSeq = await Counter.getNextSequenceValue('invoiceNumber');
    const invoiceNumStr = `INV-${invoiceNumSeq.toString().padStart(6, '0')}`;

    // FIX: Aligned with the updated Invoice schema (removed subTotal, added proper B2B fields)
    const invoice = await Invoice.create({
        invoiceNumber: invoiceNumStr,
        resellerId, // FIX: Changed from userId to resellerId
        invoiceType: 'WALLET_TOPUP',
        totalTaxableValue: amount,
        grandTotal: amount,
        paymentTerms: 'DUE_ON_RECEIPT',
        dueDate: new Date(),
        paymentStatus: 'UNPAID', // FIX: Changed from status: 'UNPAID' to paymentStatus
    });

    const options = {
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: invoiceNumStr,
        payment_capture: 1,
    };

    try {
        const order = await razorpayInstance.orders.create(options);

        invoice.razorpayOrderId = order.id;
        await invoice.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    invoiceId: invoice._id,
                    razorpayOrderId: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
                },
                'Razorpay order created for wallet topup'
            )
        );
    } catch (error) {
        await Invoice.findByIdAndDelete(invoice._id);
        throw new ApiError(500, error.message || 'Failed to initialize Razorpay payment');
    }
});
