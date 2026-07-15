import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid Mongoose ObjectId');

const poProductSchema = z.object({
  productId: objectIdSchema,
  quantity: z.number({ required_error: 'Quantity is required' }).min(1, 'Quantity must be at least 1'),
  purchasePrice: z.number({ required_error: 'Purchase price is required' }).min(0, 'Purchase price cannot be negative'),
  tax: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
});

export const createPurchaseOrderSchema = z.object({
  body: z.object({
    supplierId: objectIdSchema,
    products: z.array(poProductSchema).nonempty('At least one product is required'),
    expectedDeliveryDate: z.string().datetime().optional().or(z.literal('')),
    notes: z.string().trim().optional(),
  }),
});

export const updatePurchaseOrderStatusSchema = z.object({
  body: z.object({
    orderStatus: z.enum(['PENDING', 'RECEIVED', 'CANCELLED']),
    paymentStatus: z.enum(['UNPAID', 'PAID', 'PARTIALLY_PAID']).optional(),
  }),
});

export const queryPurchaseOrderSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).optional(),
    limit: z.preprocess((val) => Number(val) || 10, z.number().min(1)).optional(),
    supplierId: z.string().regex(objectIdRegex).optional(),
    orderStatus: z.enum(['PENDING', 'RECEIVED', 'CANCELLED']).optional(),
    paymentStatus: z.enum(['UNPAID', 'PAID', 'PARTIALLY_PAID']).optional(),
  }).catchall(z.any()),
});
