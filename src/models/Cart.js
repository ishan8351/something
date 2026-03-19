import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        qty: {
            type: Number,
            required: true,
            min: 1,
        },

        // --- B2B Order Intent ---
        orderType: {
            type: String,
            enum: ['DROPSHIP', 'WHOLESALE'],
            required: true,
            default: 'DROPSHIP',
        },

        // --- Pricing Snapshots (Calculated dynamically in the controller) ---
        // What the platform charges the reseller per unit (after checking tiered pricing for WHOLESALE)
        platformUnitCost: { type: Number, required: true },

        // What the reseller is selling it to the end-customer for (Only applies to DROPSHIP)
        resellerSellingPrice: { type: Number, default: 0 },

        // Tax details (GST)
        gstSlab: { type: Number, default: 0 },
        taxAmountPerUnit: { type: Number, default: 0 },

        // Totals for this specific item line
        totalItemPlatformCost: { type: Number, required: true }, // (platformUnitCost + taxAmountPerUnit) * qty
        expectedProfit: { type: Number, default: 0 }, // (resellerSellingPrice - platformUnitCost - tax) * qty (Dropship only)
    },
    { _id: false }
);

const cartSchema = new mongoose.Schema(
    {
        resellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // One active cart per reseller
        },
        items: [cartItemSchema],

        // --- Cart Level Totals ---
        subTotalPlatformCost: { type: Number, default: 0 }, // Total cost of items before tax
        totalTax: { type: Number, default: 0 }, // Total GST
        grandTotalPlatformCost: { type: Number, default: 0 }, // What the reseller owes us to dispatch the order

        totalExpectedProfit: { type: Number, default: 0 }, // Total estimated profit for the reseller (for dashboard display)
    },
    { timestamps: true }
);

export const Cart = mongoose.model('Cart', cartSchema);
