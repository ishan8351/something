import mongoose from 'mongoose';

const customerPricingSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    customPrice: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// Prevent duplicate pricing rules for the same customer-product pair
customerPricingSchema.index({ customerId: 1, productId: 1 }, { unique: true });

export const CustomerPricing = mongoose.model('CustomerPricing', customerPricingSchema);
