import { Category } from "../models/Category.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCategories = asyncHandler(async (req, res) => {
    // Fetch only top-level categories (roots) for a cleaner UI, excluding 'Uncategorized'
    const categories = await Category.find({
        parentCategoryId: null,
        name: { $ne: "Uncategorized" }
    }).lean();

    return res.status(200).json(
        new ApiResponse(200, categories, "Categories fetched successfully")
    );
});
