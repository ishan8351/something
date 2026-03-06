import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    stock: { type: Number, required: true, default: 0 },
    alertThreshold: { type: Number, default: 10 }
}, { _id: false });

const productSchema = new mongoose.Schema({
    sku: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    descriptionHTML: { type: String },
    vendor: { type: String },
    productType: { type: String },
    tags: [{ type: String }],
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    images: [{
        url: { type: String, required: true },
        position: { type: Number },
        altText: { type: String }
    }],
    platformSellPrice: { type: Number, required: true },
    compareAtPrice: { type: Number },
    weightGrams: { type: Number },
    seoTitle: { type: String },
    seoDescription: { type: String },
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
    moq: { type: Number, default: 1 },
    inventory: inventorySchema
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);