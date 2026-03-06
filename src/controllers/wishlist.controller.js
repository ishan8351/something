import { Wishlist } from "../models/Wishlist.js";
import { Customer } from "../models/Customer.js";
import { Product } from "../models/Product.js";
import { Counter } from "../models/Counter.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper to get or create wishlist
const getOrCreateWishlist = async (userId) => {
    let customer = await Customer.findOne({ userId });

    // Auto-create customer profile for legacy testing accounts
    if (!customer) {
        const sequenceDoc = await Counter.findOneAndUpdate(
            { _id: 'customerId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        let seq = sequenceDoc.seq.toString().padStart(5, '0');
        customer = await Customer.create({
            userId,
            customerId: `CUST${seq}`
        });
    }

    let wishlist = await Wishlist.findOne({ customerId: customer._id }).populate("items.productId", "title images platformSellPrice compareAtPrice sku");
    if (!wishlist) {
        wishlist = await Wishlist.create({ customerId: customer._id, items: [] });
    }
    return { wishlist, customer };
};

export const getWishlist = asyncHandler(async (req, res) => {
    const { wishlist } = await getOrCreateWishlist(req.user._id);
    return res.status(200).json(new ApiResponse(200, wishlist, "Wishlist retrieved successfully"));
});

export const toggleWishlistItem = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    const { wishlist } = await getOrCreateWishlist(req.user._id);

    // Check if item exists in wishlist
    const itemIndex = wishlist.items.findIndex(item => {
        const id = item.productId._id ? item.productId._id.toString() : item.productId.toString();
        return id === productId;
    });

    let isAdded = false;
    if (itemIndex > -1) {
        // Remove item
        wishlist.items.splice(itemIndex, 1);
    } else {
        // Add item
        const productExists = await Product.findById(productId);
        if (!productExists) throw new ApiError(404, "Product not found");
        wishlist.items.push({ productId });
        isAdded = true;
    }

    await wishlist.save();

    // Populate before returning
    await wishlist.populate("items.productId", "title images platformSellPrice compareAtPrice sku");

    return res.status(200).json(new ApiResponse(200, { wishlist, isAdded }, "Wishlist updated successfully"));
});
