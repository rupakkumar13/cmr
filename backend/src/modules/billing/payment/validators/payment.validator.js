import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid Mongoose ObjectId');

export const createPaymentSchema = z.object({
  body: z.object({
    invoiceId: objectIdSchema,
    customerId: objectIdSchema,
    amount: z.number({ required_error: 'Payment amount is required' }).min(0.01, 'Amount must be greater than zero'),
    paymentMethod: z.enum(['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cheque', 'Wallet']),
    transactionId: z.string().trim().optional(),
    referenceNumber: z.string().trim().optional(),
    paymentStatus: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).default('COMPLETED'),
    paymentDate: z.string().datetime().optional().or(z.literal('')),
    notes: z.string().trim().optional(),
  }),
});

export const queryPaymentSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).optional(),
    limit: z.preprocess((val) => Number(val) || 10, z.number().min(1)).optional(),
    customerId: z.string().regex(objectIdRegex).optional(),
    invoiceId: z.string().regex(objectIdRegex).optional(),
    paymentStatus: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  }).catchall(z.any()),
});
