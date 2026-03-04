import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
}, { _id: false });

const customerSchema = new mongoose.Schema({
    customerId: { type: String, unique: true, required: true }, // From Counter
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        sparse: true
    },
    accountType: { type: String, enum: ['B2B', 'B2C'], default: 'B2C' },
    walletBalance: { type: Number, default: 0 },
    addresses: [addressSchema]
}, { timestamps: true });

export const Customer = mongoose.model('Customer', customerSchema);