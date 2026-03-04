import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true }, // From Counter
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    }, // Nullable for top-ups
    invoiceType: {
        type: String,
        enum: ['ORDER_BILL', 'WALLET_TOPUP'],
        required: true
    },
    totalAmount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['UNPAID', 'PARTIAL', 'PAID'],
        default: 'UNPAID'
    }
}, { timestamps: true });

export const Invoice = mongoose.model('Invoice', invoiceSchema);