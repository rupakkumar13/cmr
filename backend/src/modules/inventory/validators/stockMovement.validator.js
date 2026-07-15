import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid Mongoose ObjectId');

export const createStockMovementSchema = z.object({
  body: z.object({
    productId: objectIdSchema,
    movementType: z.enum(['IN', 'OUT', 'RETURN', 'TRANSFER', 'ADJUSTMENT']),
    quantity: z.number({ required_error: 'Quantity is required' }).min(1, 'Quantity must be at least 1'),
    reason: z.string().trim().optional(),
    reference: z.string().trim().optional(),
  }),
});

export const queryStockMovementSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).optional(),
    limit: z.preprocess((val) => Number(val) || 10, z.number().min(1)).optional(),
    productId: z.string().regex(objectIdRegex).optional(),
    movementType: z.enum(['IN', 'OUT', 'RETURN', 'TRANSFER', 'ADJUSTMENT']).optional(),
  }).catchall(z.any()),
});
