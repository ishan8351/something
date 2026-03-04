import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    stock: { type: Number, required: true, default: 0 },
    alertThreshold: { type: Number, default: 10 }
}, { _id: false });

const productSchema = new mongoose.Schema({
    sku: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    platformSellPrice: { type: Number, required: true },
    moq: { type: Number, default: 1 },
    inventory: inventorySchema
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);