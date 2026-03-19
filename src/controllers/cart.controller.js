import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Helper Function: Recalculates the entire cart's math.
 * Applies B2B tiered pricing and Indian GST dynamically.
 */
const recalculateCart = async (cart) => {
    let subTotal = 0;
    let totalTax = 0;
    let totalExpectedProfit = 0;

    for (let item of cart.items) {
        const product = await Product.findById(item.productId);

        // FIX: Handle deleted/archived "Ghost Products"
        if (!product || product.status !== 'active') {
            item.toBeRemoved = true;
            continue;
        }

        // 1. Determine Base Price based on Order Intent
        let unitCost = product.dropshipBasePrice;

        if (
            item.orderType === 'WHOLESALE' &&
            product.tieredPricing &&
            product.tieredPricing.length > 0
        ) {
            // FIX: Prevent array mutation by spreading into a new array before sorting
            const applicableTier = [...product.tieredPricing]
                .sort((a, b) => b.minQty - a.minQty)
                .find((tier) => item.qty >= tier.minQty);

            if (applicableTier) {
                unitCost = applicableTier.pricePerUnit;
            }
        }

        item.platformUnitCost = unitCost;
        item.gstSlab = product.gstSlab;

        // 2. Calculate Taxes (GST)
        item.taxAmountPerUnit = Number(((unitCost * product.gstSlab) / 100).toFixed(2));

        // 3. Calculate Item Totals
        item.totalItemPlatformCost = Number(
            ((unitCost + item.taxAmountPerUnit) * item.qty).toFixed(2)
        );

        // 4. Calculate Dropship Profit
        if (item.orderType === 'DROPSHIP') {
            // FIX: Negative Profit Floor validation
            const minimumSellingPrice = unitCost + item.taxAmountPerUnit;
            if (item.resellerSellingPrice < minimumSellingPrice) {
                item.resellerSellingPrice = minimumSellingPrice; // Auto-correct to prevent negative margins
            }

            const profitPerUnit = item.resellerSellingPrice - minimumSellingPrice;
            item.expectedProfit = Number((profitPerUnit * item.qty).toFixed(2));
        } else {
            item.expectedProfit = 0;
            item.resellerSellingPrice = 0;
        }

        // Add to Cart Grand Totals
        subTotal += unitCost * item.qty;
        totalTax += item.taxAmountPerUnit * item.qty;
        totalExpectedProfit += item.expectedProfit;
    }

    // FIX: Physically remove the ghost items outside the loop
    cart.items = cart.items.filter((item) => !item.toBeRemoved);

    cart.subTotalPlatformCost = Number(subTotal.toFixed(2));
    cart.totalTax = Number(totalTax.toFixed(2));
    cart.grandTotalPlatformCost = Number((subTotal + totalTax).toFixed(2));
    cart.totalExpectedProfit = Number(totalExpectedProfit.toFixed(2));

    return cart;
};

/**
 * @desc    Get the current user's cart
 * @route   GET /api/cart
 */
export const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ resellerId: req.user._id }).populate(
        'items.productId',
        'title images sku inventory moq'
    );

    if (!cart) {
        cart = await Cart.create({ resellerId: req.user._id, items: [] });
    }

    return res.status(200).json(new ApiResponse(200, cart, 'Cart fetched successfully'));
});

/**
 * @desc    Add an item to the cart (Handles both Dropship & Wholesale logic)
 * @route   POST /api/cart
 */
export const addToCart = asyncHandler(async (req, res) => {
    const { productId, qty, orderType, resellerSellingPrice } = req.body;

    if (!productId || !qty || !orderType) {
        throw new ApiError(400, 'Product ID, Quantity, and Order Type are required');
    }

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, 'Product not found');

    if (product.inventory.stock < qty) {
        throw new ApiError(400, `Only ${product.inventory.stock} units available in stock`);
    }

    // FIX: Wholesale MOQ validation
    if (orderType === 'WHOLESALE' && qty < product.moq) {
        throw new ApiError(
            400,
            `Minimum Order Quantity (MOQ) for this wholesale product is ${product.moq} units.`
        );
    }

    let cart = await Cart.findOne({ resellerId: req.user._id });
    if (!cart) {
        cart = new Cart({ resellerId: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId && item.orderType === orderType
    );

    if (existingItemIndex > -1) {
        cart.items[existingItemIndex].qty += qty;
        if (orderType === 'DROPSHIP' && resellerSellingPrice) {
            cart.items[existingItemIndex].resellerSellingPrice = resellerSellingPrice;
        }
    } else {
        cart.items.push({
            productId,
            qty,
            orderType,
            resellerSellingPrice:
                orderType === 'DROPSHIP' ? resellerSellingPrice || product.suggestedRetailPrice : 0,
        });
    }

    cart = await recalculateCart(cart);
    await cart.save();

    // FIX: Populate the payload before returning to the frontend
    const populatedCart = await Cart.findById(cart._id).populate(
        'items.productId',
        'title images sku inventory moq'
    );

    return res.status(200).json(new ApiResponse(200, populatedCart, 'Item added to cart'));
});

/**
 * @desc    Update item quantity or selling price in cart
 * @route   PUT /api/cart/:productId
 */
export const updateCartItem = asyncHandler(async (req, res) => {
    const { qty, resellerSellingPrice } = req.body;
    const { productId } = req.params;

    let cart = await Cart.findOne({ resellerId: req.user._id });
    if (!cart) throw new ApiError(404, 'Cart not found');

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex === -1) throw new ApiError(404, 'Item not found in cart');

    const product = await Product.findById(productId);
    if (qty > product.inventory.stock) {
        throw new ApiError(400, `Cannot exceed available stock (${product.inventory.stock} units)`);
    }

    // FIX: Prevent updating quantity below Wholesale MOQ
    if (cart.items[itemIndex].orderType === 'WHOLESALE' && qty < product.moq) {
        throw new ApiError(400, `Quantity cannot be less than the MOQ of ${product.moq} units.`);
    }

    if (qty > 0) cart.items[itemIndex].qty = qty;
    if (resellerSellingPrice && cart.items[itemIndex].orderType === 'DROPSHIP') {
        cart.items[itemIndex].resellerSellingPrice = resellerSellingPrice;
    }

    cart = await recalculateCart(cart);
    await cart.save();

    // FIX: Populate the payload before returning
    const populatedCart = await Cart.findById(cart._id).populate(
        'items.productId',
        'title images sku inventory moq'
    );

    return res.status(200).json(new ApiResponse(200, populatedCart, 'Cart updated'));
});

/**
 * @desc    Remove an item from the cart
 * @route   DELETE /api/cart/:productId
 */
export const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    let cart = await Cart.findOne({ resellerId: req.user._id });
    if (!cart) throw new ApiError(404, 'Cart not found');

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

    cart = await recalculateCart(cart);
    await cart.save();

    // FIX: Populate the payload before returning
    const populatedCart = await Cart.findById(cart._id).populate(
        'items.productId',
        'title images sku inventory moq'
    );

    return res.status(200).json(new ApiResponse(200, populatedCart, 'Item removed from cart'));
});
