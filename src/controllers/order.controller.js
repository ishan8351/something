import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Invoice } from '../models/Invoice.js';
import { Product } from '../models/Product.js';
import { Counter } from '../models/Counter.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';
import { Payment } from '../models/Payment.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { UserPricing } from '../models/UserPricing.js';

const calculateDueDate = (paymentTerms) => {
    const dueDate = new Date();
    if (paymentTerms === 'NET_15') dueDate.setDate(dueDate.getDate() + 15);
    else if (paymentTerms === 'NET_30') dueDate.setDate(dueDate.getDate() + 30);
    return dueDate;
};

const calculateTaxBreakdown = (inclusivePrice, taxPercentage) => {
    const basePrice = inclusivePrice / (1 + taxPercentage / 100);
    const taxAmount = inclusivePrice - basePrice;

    return {
        basePrice: parseFloat(basePrice.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
    };
};

export const placeOrder = asyncHandler(async (req, res) => {
    const {
        items,
        paymentMethod = 'RAZORPAY',
        paymentTerms = 'DUE_ON_RECEIPT',
        billingDetails = {},
    } = req.body;
    const userId = req.user._id;

    if (!items || !items.length) throw new ApiError(400, 'Items list is empty');

    const buyer = await User.findById(userId);
    if (!buyer) throw new ApiError(404, 'User not found');

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let globalSubTotal = 0;
        let globalTaxTotal = 0;
        let globalGrandTotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findOneAndUpdate(
                { _id: item.productId, 'inventory.stock': { $gte: item.qty } },
                { $inc: { 'inventory.stock': -item.qty } },
                { session, new: true }
            );

            if (!product) {
                const missingProduct = await Product.findById(item.productId).select('title');
                const title = missingProduct ? missingProduct.title : `ID: ${item.productId}`;
                throw new Error(`Insufficient stock for ${title}.`);
            }

            let inclusivePrice = product.platformSellPrice;

            const customPricing = await UserPricing.findOne({
                userId,
                productId: product._id,
            }).session(session);

            if (customPricing && customPricing.customPrice) {
                inclusivePrice = customPricing.customPrice;
            } else if (product.tiers && Array.isArray(product.tiers) && product.tiers.length > 0) {
                let tierPrice = inclusivePrice;
                for (const tier of product.tiers) {
                    if (item.qty >= tier.min) {
                        tierPrice = tier.price;
                    }
                }
                inclusivePrice = tierPrice;
            }

            const taxSlab = product.taxSlab !== undefined ? product.taxSlab : 18;
            const hsnCode = product.hsnCode || '0000';

            const { basePrice, taxAmount } = calculateTaxBreakdown(inclusivePrice, taxSlab);

            const itemTotalBase = basePrice * item.qty;
            const itemTotalTax = taxAmount * item.qty;
            const itemGrandTotal = inclusivePrice * item.qty;

            globalSubTotal += itemTotalBase;
            globalTaxTotal += itemTotalTax;
            globalGrandTotal += itemGrandTotal;

            orderItems.push({
                productId: product._id,
                sku: product.sku,
                title: product.title,
                image: product.images?.[0]?.url || '',
                hsnCode,
                taxSlab,
                basePrice,
                taxAmountPerUnit: taxAmount,
                qty: item.qty,
                totalItemPrice: itemGrandTotal,
            });
        }

        globalSubTotal = parseFloat(globalSubTotal.toFixed(2));
        globalTaxTotal = parseFloat(globalTaxTotal.toFixed(2));
        globalGrandTotal = parseFloat(globalGrandTotal.toFixed(2));

        const orderIdSeq = await Counter.getNextSequenceValue('orderId');
        const invoiceNumSeq = await Counter.getNextSequenceValue('invoiceNumber');

        const orderIdStr = `ORD-${orderIdSeq.toString().padStart(6, '0')}`;
        const invoiceNumStr = `INV-${invoiceNumSeq.toString().padStart(6, '0')}`;

        const newOrder = new Order({
            orderId: orderIdStr,
            userId,
            status: 'PENDING',
            paymentMethod,
            paymentTerms,
            subTotal: globalSubTotal,
            taxTotal: globalTaxTotal,
            totalAmount: globalGrandTotal,
            grandTotal: globalGrandTotal,
            items: orderItems,
        });
        await newOrder.save({ session });

        const dueDate = calculateDueDate(paymentTerms);

        const defaultAddress = buyer.addresses?.find((a) => a.isDefault) || {};
        const finalCompanyName = billingDetails.companyName || buyer.companyName || buyer.name;
        const finalGstin = billingDetails.gstin || buyer.gstin || 'UNREGISTERED';
        const finalBillingAddress =
            billingDetails.billingAddress || defaultAddress.street || 'No Address Provided';
        const finalState = billingDetails.state || defaultAddress.state || 'UNKNOWN';

        const originState = (process.env.COMPANY_STATE || 'Karnataka').trim().toLowerCase();
        const buyerState = finalState.trim().toLowerCase();
        const isIntraState = originState === buyerState;

        let cgstTotal = 0;
        let sgstTotal = 0;
        let igstTotal = 0;

        if (isIntraState) {
            cgstTotal = Math.round((globalTaxTotal / 2 + Number.EPSILON) * 100) / 100;
            sgstTotal = Math.round((globalTaxTotal - cgstTotal + Number.EPSILON) * 100) / 100;
        } else {
            igstTotal = globalTaxTotal;
        }

        const taxBreakdown = {
            cgstTotal,
            sgstTotal,
            igstTotal,
        };

        const newInvoice = new Invoice({
            invoiceNumber: invoiceNumStr,
            userId,
            orderId: newOrder._id,
            invoiceType: 'ORDER_BILL',
            buyerDetails: {
                companyName: finalCompanyName,
                gstin: finalGstin,
                billingAddress: finalBillingAddress,
                state: finalState,
            },
            subTotal: globalSubTotal,
            taxBreakdown,
            totalAmount: globalGrandTotal,
            grandTotal: globalGrandTotal,
            dueDate,
            paymentMethod,
            paymentTerms,
            status: 'UNPAID',
        });
        await newInvoice.save({ session });

        if (paymentMethod === 'WALLET') {
            const updatedUser = await User.findOneAndUpdate(
                { _id: userId, walletBalance: { $gte: globalGrandTotal } },
                { $inc: { walletBalance: -globalGrandTotal } },
                { session, returnDocument: 'after' }
            );

            if (!updatedUser) {
                throw new Error('Insufficient wallet balance for this purchase.');
            }

            const walletPayment = new Payment({
                userId,
                invoiceId: newInvoice._id,
                paymentMethod: 'WALLET',
                status: 'SUCCESS',
                referenceId: `WALL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            });
            await walletPayment.save({ session });

            await WalletTransaction.create(
                [
                    {
                        userId,
                        paymentId: walletPayment._id,
                        amount: globalGrandTotal,
                        transactionType: 'DEBIT',
                        description: `Order Payment for ${orderIdStr}`,
                    },
                ],
                { session }
            );

            newOrder.status = 'PROCESSING';
            await newOrder.save({ session });

            newInvoice.status = 'PAID';
            await newInvoice.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    { order: newOrder, invoice: newInvoice },
                    'Order placed successfully'
                )
            );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(400, error.message || 'Failed to place order');
    }
});

export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, orders, 'Orders fetched successfully'));
});

export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) throw new ApiError(404, 'Order not found');
    return res.status(200).json(new ApiResponse(200, order, 'Order fetched successfully'));
});

export const cancelOrder = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.user._id,
            status: 'PENDING',
        }).session(session);
        if (!order) throw new ApiError(404, 'Order not found or cannot be cancelled');

        order.status = 'CANCELLED';
        await order.save({ session });

        await Invoice.findOneAndUpdate(
            { orderId: order._id, status: 'UNPAID' },
            { status: 'CANCELLED' },
            { session }
        );

        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { 'inventory.stock': item.qty } },
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        return res
            .status(200)
            .json(new ApiResponse(200, order, 'Order cancelled and stock restored successfully'));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(500, error.message || 'Failed to cancel order');
    }
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, courierName, trackingNumber } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findById(req.params.id).session(session);
        if (!order) throw new ApiError(404, 'Order not found');

        const isNewlyCancelled =
            status && status.toUpperCase() === 'CANCELLED' && order.status !== 'CANCELLED';

        if (status) order.status = status.toUpperCase();

        if (courierName || trackingNumber) {
            order.tracking = {
                ...order.tracking,
                courierName: courierName || order.tracking?.courierName,
                trackingNumber: trackingNumber || order.tracking?.trackingNumber,
                trackingUrl: `https://${(courierName || order.tracking?.courierName || 'courier').toLowerCase()}.com/track/${trackingNumber || order.tracking?.trackingNumber}`,
            };
        }

        await order.save({ session });

        if (isNewlyCancelled) {
            await Invoice.findOneAndUpdate(
                { orderId: order._id, status: 'UNPAID' },
                { status: 'CANCELLED' },
                { session }
            );

            for (const item of order.items) {
                await Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { 'inventory.stock': item.qty } },
                    { session }
                );
            }
        }

        await session.commitTransaction();
        session.endSession();

        return res
            .status(200)
            .json(new ApiResponse(200, order, `Order successfully marked as ${order.status}`));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(500, error.message || 'Failed to update order status');
    }
});

export const getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const status = req.query.status || 'ALL';

    const query = {};

    if (status !== 'ALL') {
        query.status = status;
    }

    if (search) {
        const matchingUsers = await User.find({
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ],
        }).select('_id');

        const userIds = matchingUsers.map((u) => u._id);

        query['$or'] = [
            { orderId: { $regex: search, $options: 'i' } },
            { userId: { $in: userIds } },
        ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                data: orders,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            },
            'All orders fetched successfully'
        )
    );
});
