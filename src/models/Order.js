import mongoose from 'mongoose';

const orderItemSnapshotSchema = new mongoose.Schema({
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    qty: { type: Number, required: true, min: 1 }
}, { _id: false });

// New: Keep track of every time the order status changes for the timeline
const statusHistorySchema = new mongoose.Schema({
    status: { type: String, required: true },
    comment: { type: String },
    date: { type: Date, default: Date.now }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true }, 
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true
    }, 
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING'
    },
    statusHistory: [statusHistorySchema], // New array for the timeline
    tracking: {                           // New object for Courier Info
        courierName: { type: String },    // e.g., 'Delhivery', 'BlueDart'
        trackingNumber: { type: String }, // e.g., 'AWB123456789'
        trackingUrl: { type: String }     // e.g., 'https://delhivery.com/track/...'
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

// Pre-save hook: Automatically log the first status when an order is created
orderSchema.pre('save', function(next) {
    if (this.isNew) {
        this.statusHistory.push({ status: this.status, comment: 'Order placed successfully' });
    }
    // Also log if status is modified later
    if (!this.isNew && this.isModified('status')) {
        this.statusHistory.push({ status: this.status, comment: `Order marked as ${this.status}` });
    }
    next();
});

export const Order = mongoose.model('Order', orderSchema);