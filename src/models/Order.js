import mongoose from 'mongoose';

const orderItemSnapshotSchema = new mongoose.Schema({
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    qty: { type: Number, required: true, min: 1 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true }, // From Counter
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true
    }, // Mandatory Source Trace
    status: {
        type: String,
        enum: ['PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    paymentTerms: {
        type: String,
        enum: ['DUE_ON_RECEIPT', 'NET_15', 'NET_30'],
        default: 'DUE_ON_RECEIPT'
    },
    paymentMethod: {
        type: String,
        enum: ['RAZORPAY', 'WALLET', 'BANK_TRANSFER'],
        default: 'RAZORPAY'
    },
    totalAmount: { type: Number, required: true },
    items: [orderItemSnapshotSchema],
    orderDate: { type: Date, default: Date.now }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);