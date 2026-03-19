import mongoose from 'mongoose';
import crypto from 'crypto';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @desc    Handle incoming logistics status updates
 * @route   POST /api/webhooks/logistics
 */
export const handleLogisticsWebhook = asyncHandler(async (req, res) => {
    // 1. --- SECURITY: Verify the Webhook Signature ---
    // (Example using a standard HMAC SHA256 signature from headers)
    const signature = req.headers['x-logistics-signature'];
    const webhookSecret = process.env.LOGISTICS_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        throw new ApiError(401, 'Missing webhook signature or secret');
    }

    // Verify the payload hasn't been tampered with
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (signature !== expectedSignature) {
        throw new ApiError(401, 'Invalid webhook signature');
    }
    // ------------------------------------------------

    // 2. Extract Data (Assuming a standard Shiprocket-style payload)
    const { order_id: orderId, awb, current_status, remarks } = req.body;

    // Map external courier statuses to your internal Order Schema enums
    const statusMap = {
        PICKED_UP: 'SHIPPED',
        IN_TRANSIT: 'SHIPPED',
        DELIVERED: 'DELIVERED',
        UNDELIVERED: 'NDR',
        RTO_DELIVERED: 'RTO',
        CANCELLED: 'CANCELLED',
    };

    const newInternalStatus = statusMap[current_status?.toUpperCase()];

    // If it's a micro-status we don't track (like "Reached Hub"), just return 200 to acknowledge
    if (!newInternalStatus) {
        return res.status(200).json({ received: true, message: 'Status ignored' });
    }

    // 3. Find the Order
    const order = await Order.findOne({ orderId });
    if (!order) {
        // Return 200 so the courier stops retrying, even if we don't have the order
        return res.status(200).json({ received: true, message: 'Order not found in our system' });
    }

    // 4. --- IDEMPOTENCY CHECK ---
    // If the order is already at this status (or a final state), do nothing.
    // This prevents double profit payouts if the courier fires 'DELIVERED' twice.
    if (
        order.status === newInternalStatus ||
        ['PROFIT_CREDITED', 'CANCELLED', 'RTO'].includes(order.status)
    ) {
        return res
            .status(200)
            .json({ received: true, message: 'Status already updated previously' });
    }

    // 5. Update Status History
    order.statusHistory.push({
        status: newInternalStatus,
        comment: remarks || `Automated update from courier: ${current_status}`,
    });

    // 6. Handle Specific Business Logic based on Status
    if (newInternalStatus === 'NDR') {
        order.ndrDetails = {
            attemptCount: (order.ndrDetails?.attemptCount || 0) + 1,
            reason: remarks || 'Customer Unavailable (Automated)',
            resellerAction: 'PENDING',
        };
        order.status = 'NDR';
        await order.save();
        return res.status(200).json({ received: true });
    }

    // 7. --- PROFIT PAYOUT LOGIC (ACID Transaction) ---
    // If it's DELIVERED, COD, and there's a profit margin to pay out
    if (newInternalStatus === 'DELIVERED') {
        order.status = 'DELIVERED';

        if (order.resellerProfitMargin > 0 && order.paymentMethod === 'COD') {
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // Safely increment wallet
                const updatedReseller = await User.findByIdAndUpdate(
                    order.resellerId,
                    { $inc: { walletBalance: order.resellerProfitMargin } },
                    { new: true, session }
                );

                // Create ledger entry
                await WalletTransaction.create(
                    [
                        {
                            resellerId: order.resellerId,
                            type: 'CREDIT',
                            purpose: 'PROFIT_CREDIT',
                            amount: order.resellerProfitMargin,
                            closingBalance: updatedReseller.walletBalance,
                            referenceId: order.orderId,
                            description: `Profit margin credited for automated COD delivery of ${order.orderId}`,
                            status: 'COMPLETED',
                        },
                    ],
                    { session }
                );

                // Mark as credited
                order.statusHistory.push({
                    status: 'PROFIT_CREDITED',
                    comment: `₹${order.resellerProfitMargin} auto-credited to wallet on delivery`,
                });
                order.status = 'PROFIT_CREDITED'; // Overwrite DELIVERED with final state

                await order.save({ session });
                await session.commitTransaction();
                session.endSession();
            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                console.error(`Failed to process auto-payout for ${orderId}:`, error);
                throw new ApiError(500, 'Webhook processed but payout failed');
            }
        } else {
            // Prepaid or Wholesale orders with no profit payout
            await order.save();
        }
    } else {
        // Just a standard status update (e.g., SHIPPED)
        order.status = newInternalStatus;
        await order.save();
    }

    return res.status(200).json({ received: true, status: newInternalStatus });
});
