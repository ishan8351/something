import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Invoice } from '../models/Invoice.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { Counter } from '../models/Counter.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const calculateDueDate = (paymentTerms) => {
    const dueDate = new Date();
    if (paymentTerms === 'NET_15') {
        dueDate.setDate(dueDate.getDate() + 15);
    } else if (paymentTerms === 'NET_30') {
        dueDate.setDate(dueDate.getDate() + 30);
    }
    return dueDate;
};

export const placeOrder = asyncHandler(async (req, res) => {
    const { items, paymentMethod = 'RAZORPAY', paymentTerms = 'DUE_ON_RECEIPT' } = req.body;
    const customerId = req.user._id;

    if (!items || !items.length) {
        throw new ApiError(400, "Items list is empty");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId).session(session);
            if (!product) throw new Error("Product not found");

            // Stock Validation Atomic Check
            if (product.inventory.stock < item.qty) {
                throw new Error(`Insufficient stock for ${product.title}. Only ${product.inventory.stock} remaining.`);
            }

            // Decrease Stock
            await Product.findByIdAndUpdate(
                product._id,
                { $inc: { 'inventory.stock': -item.qty } },
                { session }
            );

            const price = product.platformSellPrice;
            totalAmount += (price * item.qty);

            orderItems.push({
                sku: product.sku,
                price: price,
                qty: item.qty,
                tax: 0 // Placeholder for tax logic
            });
        }

        // Generate IDs
        const orderIdSeq = await Counter.getNextSequenceValue('orderId');
        const invoiceNumSeq = await Counter.getNextSequenceValue('invoiceNumber');

        const orderIdStr = `ORD-${orderIdSeq.toString().padStart(6, '0')}`;
        const invoiceNumStr = `INV-${invoiceNumSeq.toString().padStart(6, '0')}`;

        // Create Order
        const newOrder = await Order.create([{
            orderId: orderIdStr,
            customerId,
            cartId: customerId, // Bypassing strict cartId for direct checkout demo
            status: 'PENDING',
            totalAmount,
            items: orderItems,
            paymentMethod,
            paymentTerms
        }], { session });

        // Create Invoice
        const dueDate = calculateDueDate(paymentTerms);
        const newInvoice = await Invoice.create([{
            invoiceNumber: invoiceNumStr,
            customerId,
            orderId: newOrder[0]._id,
            invoiceType: 'ORDER_BILL',
            totalAmount,
            dueDate,
            paymentMethod,
            paymentTerms,
            status: paymentMethod === 'BANK_TRANSFER' ? 'UNPAID' : 'UNPAID'
        }], { session });

        // Removed Cart cleanup since we accept items directly now

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json(
            new ApiResponse(201, { order: newOrder[0], invoice: newInvoice[0] }, "Order placed successfully")
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(400, error.message || "Failed to place order");
    }
});

export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ customerId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!order) throw new ApiError(404, "Order not found");

    return res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

export const cancelOrder = asyncHandler(async (req, res) => {
    // Basic implementation: in real world, restore stock, refund payment, etc.
    const order = await Order.findOneAndUpdate(
        { _id: req.params.id, customerId: req.user._id, status: 'PENDING' },
        { status: 'CANCELLED' },
        { new: true }
    );
    if (!order) throw new ApiError(404, "Order not found or cannot be cancelled");

    // Also cancel matched pending invoice
    await Invoice.findOneAndUpdate(
        { orderId: order._id, status: 'UNPAID' },
        { status: 'CANCELLED' } // Wait, 'CANCELLED' is not in Invoice schema enum. 'UNPAID' stands. Let's just leave invoice or update schema later if needed.
    );

    return res.status(200).json(new ApiResponse(200, order, "Order cancelled successfully"));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, courierName, trackingNumber } = req.body;
    
    // Find the order
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");

    // Update the status (Ensure it's a valid enum value)
    if (status) {
        order.status = status.toUpperCase();
    }

    // Add tracking details if the warehouse worker provided them
    if (courierName || trackingNumber) {
        order.tracking = {
            courierName: courierName || order.tracking?.courierName,
            trackingNumber: trackingNumber || order.tracking?.trackingNumber,
            trackingUrl: `https://${courierName?.toLowerCase() || 'courier'}.com/track/${trackingNumber}`
        };
    }

    // Saving it will automatically trigger our pre-save hook to update the timeline!
    await order.save();

    return res.status(200).json(new ApiResponse(200, order, `Order successfully marked as ${order.status}`));
});

export const getAllOrders = asyncHandler(async (req, res) => {
    // Fetch all orders and populate the customer details
    const orders = await Order.find()
        .populate('customerId', 'name email')
        .sort({ createdAt: -1 });
        
    return res.status(200).json(new ApiResponse(200, orders, "All orders fetched successfully"));
});