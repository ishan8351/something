import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const productValidation = {
    getProducts: z.object({
        query: z.object({
            page: z.string().regex(/^\d+$/).optional(),
            limit: z.string().regex(/^\d+$/).optional(),
            query: z.string().optional(),
            categoryId: z.union([objectId, z.literal('All')]).optional(),
            minPrice: z
                .string()
                .regex(/^\d+(\.\d{1,2})?$/)
                .optional(),
            maxPrice: z
                .string()
                .regex(/^\d+(\.\d{1,2})?$/)
                .optional(),
            saleOnly: z.enum(['true', 'false']).optional(),
            shipping: z.string().optional(),
            minRating: z
                .string()
                .regex(/^[1-5]$/)
                .optional(),
            sort: z.enum(['price-asc', 'price-desc', 'rating', 'reviews', 'newest']).optional(),
        }),
    }),

    getProductById: z.object({
        params: z.object({
            productId: objectId,
        }),
    }),

    createProduct: z.object({
        body: z.object({
            title: z.string().min(3),
            sku: z.string(),
            categoryId: objectId,
            platformSellPrice: z.number().positive(),
            hsnCode: z.string().min(4, 'HSN Code must be at least 4 digits'),
            taxSlab: z.union([
                z.literal(0),
                z.literal(5),
                z.literal(12),
                z.literal(18),
                z.literal(28),
            ]),
            stock: z.number().int().nonnegative().optional(),
            status: z.enum(['active', 'draft', 'archived']).optional(),
        }),
    }),

    updateProduct: z.object({
        params: z.object({
            id: objectId,
        }),
        body: z
            .object({
                platformSellPrice: z.number().positive().optional(),
                hsnCode: z.string().min(4).optional(),
                taxSlab: z
                    .union([
                        z.literal(0),
                        z.literal(5),
                        z.literal(12),
                        z.literal(18),
                        z.literal(28),
                    ])
                    .optional(),
                stock: z.number().int().nonnegative().optional(),
                status: z.enum(['active', 'draft', 'archived']).optional(),
            })
            .strict(),
    }),
};
