import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js"; // Required for Mongoose .populate() to work
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 12, query, categoryId } = req.query;

    const filter = { };

    if (query) {
        filter.title = { $regex: query, $options: "i" };
    }

    if (categoryId) {
        // Collect all descendant category IDs recursively to include products nested deeply
        const rootId = new mongoose.Types.ObjectId(categoryId);
        const categoryIds = [rootId];
        let currentLevelIds = [rootId];

        while (currentLevelIds.length > 0) {
            const children = await Category.find({ parentCategoryId: { $in: currentLevelIds } }, '_id').lean();
            if (children.length > 0) {
                currentLevelIds = children.map(c => c._id);
                categoryIds.push(...currentLevelIds);
            } else {
                currentLevelIds = [];
            }
        }

        filter.categoryId = { $in: categoryIds };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
        .populate("categoryId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            products,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
            }
        }, "Products fetched successfully")
    );
});

const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid product ID");
    }

    const product = await Product.findById(productId).populate("categoryId", "name");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponse(200, product, "Product fetched successfully")
    );
});

/**
 * GET /api/v1/products/deals
 * Returns the top deals ranked by discount percentage.
 * A "deal" is any active product where compareAtPrice > platformSellPrice.
 */
const getBestDeals = asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 6, 20);

    const deals = await Product.aggregate([
        // Only active products with a real discount
        {
            $match: {
                status: "active",
                compareAtPrice: { $exists: true, $gt: 0 },
                $expr: { $gt: ["$compareAtPrice", "$platformSellPrice"] }
            }
        },
        // Compute discount percentage
        {
            $addFields: {
                discountPercent: {
                    $round: [
                        {
                            $multiply: [
                                {
                                    $divide: [
                                        { $subtract: ["$compareAtPrice", "$platformSellPrice"] },
                                        "$compareAtPrice"
                                    ]
                                },
                                100
                            ]
                        },
                        0
                    ]
                }
            }
        },
        // Best discounts first
        { $sort: { discountPercent: -1 } },
        { $limit: limit },
        // Populate category name
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "categoryId"
            }
        },
        { $unwind: { path: "$categoryId", preserveNullAndEmptyArrays: true } },
        // Shape output
        {
            $project: {
                _id: 1,
                sku: 1,
                title: 1,
                images: 1,
                platformSellPrice: 1,
                compareAtPrice: 1,
                discountPercent: 1,
                "categoryId.name": 1,
                inventory: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, deals, "Best deals fetched successfully")
    );
});

// Add this to the bottom of product.controller.js (above the export line)
const getAdminProducts = asyncHandler(async (req, res) => {
    // Fetching the latest 50 products so your demo doesn't lag from rendering 800 rows at once!
    const products = await Product.find().sort({ createdAt: -1 }).limit(50);
    return res.status(200).json(new ApiResponse(200, products, "Admin products fetched"));
});

const updateAdminProduct = asyncHandler(async (req, res) => {
    const { platformSellPrice, stock, status } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) throw new ApiError(404, "Product not found");

    if (platformSellPrice !== undefined) product.platformSellPrice = platformSellPrice;
    if (stock !== undefined) product.inventory.stock = stock;
    if (status !== undefined) product.status = status;

    await product.save();
    return res.status(200).json(new ApiResponse(200, product, "Product updated successfully"));
});

export { getProducts, getProductById, getBestDeals, getAdminProducts, updateAdminProduct };
