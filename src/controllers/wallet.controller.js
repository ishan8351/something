import { Invoice } from '../models/Invoice.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { WithdrawalRequest } from '../models/WithdrawalRequest.js';
import { Counter } from '../models/Counter.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { razorpayInstance } from './payment.controller.js';

export const calculateWithdrawableBalance = async (resellerId) => {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const matchDefaults = { resellerId };

    const aggr = await WalletTransaction.aggregate([
        { $match: matchDefaults },
        {
            $group: {
                _id: null,
                oldCredits: {
                    $sum: {
                        $cond: [
                            { $and: [{ $eq: ['$type', 'CREDIT'] }, { $eq: ['$status', 'COMPLETED'] }, { $lte: ['$createdAt', fifteenDaysAgo] }] },
                            '$amount',
                            0,
                        ],
                    },
                },
                newCredits: {
                    $sum: {
                        $cond: [
                            { $and: [{ $eq: ['$type', 'CREDIT'] }, { $eq: ['$status', 'COMPLETED'] }, { $gt: ['$createdAt', fifteenDaysAgo] }] },
                            '$amount',
                            0,
                        ],
                    },
                },
                totalDebits: {
                    $sum: {
                        $cond: [
                            { $and: [{ $eq: ['$type', 'DEBIT'] }, { $ne: ['$status', 'FAILED'] }] },
                            '$amount',
                            0,
                        ],
                    },
                },
            },
        },
    ]);

    if (!aggr || aggr.length === 0) return 0;
    const { oldCredits, newCredits, totalDebits } = aggr[0];

    const rawWithdrawable = oldCredits + (newCredits * 0.7) - totalDebits;
    return Math.floor(Math.max(0, rawWithdrawable));
};

export const getBalance = asyncHandler(async (req, res) => {
    const balance = req.user.walletBalance || 0;
    const withdrawable = await calculateWithdrawableBalance(req.user._id);

    return res.status(200).json(new ApiResponse(200, { balance, withdrawable }, 'Wallet balance fetched'));
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

export const createWithdrawalRequest = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const resellerId = req.user._id;

    if (!amount || amount <= 0) {
        throw new ApiError(400, 'Valid amount is required to submit a withdrawal request');
    }

    const session = await User.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(resellerId).session(session);

        const withdrawableLimit = await calculateWithdrawableBalance(resellerId);

        if (!user.walletBalance || user.walletBalance < amount) {
            throw new ApiError(400, 'Insufficient wallet balance for withdrawal');
        }

        if (amount > withdrawableLimit) {
            throw new ApiError(400, `You can only withdraw up to ₹${withdrawableLimit}. (30% of recent funds are kept on hold for 15 days)`);
        }

        user.walletBalance -= amount;
        await user.save({ session });

        const walletTx = await WalletTransaction.create(
            [
                {
                    resellerId: user._id,
                    type: 'DEBIT',
                    purpose: 'BANK_WITHDRAWAL',
                    amount,
                    closingBalance: user.walletBalance,
                    referenceId: 'REQ-' + Date.now().toString(),
                    description: 'Requested manual withdrawal to bank account',
                    status: 'PENDING',
                },
            ],
            { session }
        );

        const withdrawal = await WithdrawalRequest.create(
            [
                {
                    resellerId: user._id,
                    requestedAmount: amount,
                    status: 'pending',
                },
            ],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res
            .status(201)
            .json(
                new ApiResponse(201, withdrawal[0], 'Withdrawal request submitted automatically')
            );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(500, error.message || 'Failed to submit withdrawal request');
    }
});

export const getMyWithdrawals = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const resellerId = req.user._id;

    const withdrawals = await WithdrawalRequest.find({ resellerId })
        .populate('resellerId', 'companyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await WithdrawalRequest.countDocuments({ resellerId });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                withdrawals,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            },
            'Withdrawal requests fetched successfully'
        )
    );
});

export const getAllWithdrawals = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const withdrawals = await WithdrawalRequest.find()
        .populate('resellerId', 'companyName name phoneNumber email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await WithdrawalRequest.countDocuments();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                withdrawals,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                }
            },
            'All withdrawal requests fetched successfully'
        )
    );
});

export const updateWithdrawalStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, txnId, reason, transferredAmount } = req.body;

    const session = await User.startSession();
    session.startTransaction();

    try {
        const withdrawal = await WithdrawalRequest.findById(id).session(session);
        if (!withdrawal) throw new ApiError(404, 'Withdrawal request not found');

        if (withdrawal.status !== 'pending') {
            throw new ApiError(400, `Cannot update request. Current status is ${withdrawal.status}`);
        }

        if (status === 'success') {
            withdrawal.status = 'success';
            withdrawal.txnId = txnId;
            withdrawal.transferredAmount = transferredAmount || withdrawal.requestedAmount;
            withdrawal.reason = reason || 'Processed automatically by Admin';
            
            await WalletTransaction.findOneAndUpdate(
                { referenceId: { $regex: 'REQ-' }, amount: withdrawal.requestedAmount, resellerId: withdrawal.resellerId, status: 'PENDING', purpose: 'BANK_WITHDRAWAL' },
                { status: 'COMPLETED', description: `Bank Transfer ID: ${txnId || 'N/A'}` },
                { session }
            );

        } else if (status === 'failed') {
            withdrawal.status = 'failed';
            withdrawal.reason = reason || 'Rejected by Admin';

            const user = await User.findById(withdrawal.resellerId).session(session);
            user.walletBalance += withdrawal.requestedAmount;
            await user.save({ session });

            await WalletTransaction.create(
                [
                    {
                        resellerId: withdrawal.resellerId,
                        type: 'CREDIT',
                        purpose: 'REFUND',
                        amount: withdrawal.requestedAmount,
                        closingBalance: user.walletBalance,
                        referenceId: 'REF-' + Date.now().toString(),
                        description: `Refund for rejected withdrawal: ${reason || 'Admin rejection'}`,
                        status: 'COMPLETED',
                    },
                ],
                { session }
            );

            await WalletTransaction.findOneAndUpdate(
                { amount: withdrawal.requestedAmount, resellerId: withdrawal.resellerId, status: 'PENDING', purpose: 'BANK_WITHDRAWAL' },
                { status: 'FAILED', description: 'Withdawal Request Rejected' },
                { session }
            );
        }

        await withdrawal.save({ session });
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json(new ApiResponse(200, withdrawal, `Withdrawal marked as ${status}`));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(500, error.message || 'Failed to update withdrawal status');
    }
});
