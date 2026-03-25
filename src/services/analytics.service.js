import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

export const syncProductRtoRates = async () => {
    try {
        console.log('Starting nightly RTO rate calculation...');

        // 1. Crunch the numbers in MongoDB
        const rtoStats = await Order.aggregate([
            // Deconstruct the items array so we can group by individual products
            { $unwind: '$items' },

            // Group by Product ID and calculate total orders vs RTO orders
            {
                $group: {
                    _id: '$items.productId',
                    totalTimesOrdered: { $sum: 1 },
                    rtoTimes: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'RTO'] }, 1, 0],
                        },
                    },
                },
            },

            // Calculate the percentage
            {
                $project: {
                    rtoRate: {
                        $round: [
                            { $multiply: [{ $divide: ['$rtoTimes', '$totalTimesOrdered'] }, 100] },
                            2, // Round to 2 decimal places
                        ],
                    },
                },
            },
        ]);

        if (rtoStats.length === 0) {
            console.log('No order data to process for RTO rates.');
            return;
        }

        // 2. Prepare bulk update operations for blazing fast execution
        const bulkOps = rtoStats.map((stat) => ({
            updateOne: {
                filter: { _id: stat._id },
                update: { $set: { historicalRtoRate: stat.rtoRate } },
            },
        }));

        // 3. Execute all updates at once
        const result = await Product.bulkWrite(bulkOps);

        console.log(`RTO Sync Complete. Updated ${result.modifiedCount} products.`);
    } catch (error) {
        console.error('Failed to sync RTO rates:', error);
    }
};
