import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        required: true
    }, // Mandatory Target
    // Update your paymentMethod line to this:
    paymentMethod: { type: String, enum: ['WALLET', 'BANK', 'CARD', 'RAZORPAY'], required: true },    status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], required: true },
    referenceId: { type: String, required: true, unique: true } // Idempotency
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);