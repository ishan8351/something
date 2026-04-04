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
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const transactions = await WalletTransaction.find({ resellerId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await WalletTransaction.countDocuments({ resellerId: req.user._id });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                transactions,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            },
            'Transaction history fetched successfully'
        )
    );
});

export const addMoney = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const resellerId = req.user._id;

    if (!amount || amount <= 0) {
        throw new ApiError(400, 'Valid amount is required to add money');
    }

    const invoiceNumSeq = await Counter.getNextSequenceValue('invoiceNumber');
    const invoiceNumStr = `INV-${invoiceNumSeq.toString().padStart(6, '0')}`;

    const invoice = await Invoice.create({
        invoiceNumber: invoiceNumStr,
        resellerId,
        invoiceType: 'WALLET_TOPUP',
        totalTaxableValue: amount,
        grandTotal: amount,
        paymentTerms: 'DUE_ON_RECEIPT',
        dueDate: new Date(),
        paymentStatus: 'UNPAID',
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
