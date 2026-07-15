import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid Mongoose ObjectId');

const productItemSchema = z.object({
  productId: z.string().regex(objectIdRegex).optional().nullable().or(z.literal('')),
  name: z.string().trim().optional(),
  quantity: z.number({ required_error: 'Quantity is required' }).min(1, 'Quantity must be at least 1'),
  unitPrice: z.number({ required_error: 'Unit price is required' }).min(0, 'Unit price cannot be negative'),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
});

export const createInvoiceSchema = z.object({
  body: z.object({
    dealId: objectIdSchema,
    quotationId: objectIdSchema.optional().nullable(),
    customerId: objectIdSchema,
    salesPersonId: objectIdSchema,
    products: z.array(productItemSchema).nonempty('At least one product is required'),
    shippingCharge: z.number().min(0).default(0),
    dueDate: z.string().datetime('Invalid due date format').or(z.string()),
    notes: z.string().trim().optional(),
    paymentTerms: z.string().trim().optional(),
    additionalDiscount: z.number().min(0).default(0),
    invoiceStatus: z.enum(['DRAFT', 'SENT', 'CANCELLED']).optional(),
  }),
});

export const updateInvoiceSchema = z.object({
  body: z.object({
    customerId: objectIdSchema.optional(),
    salesPersonId: objectIdSchema.optional(),
    products: z.array(productItemSchema).optional(),
    shippingCharge: z.number().min(0).optional(),
    dueDate: z.string().datetime().optional(),
    notes: z.string().trim().optional(),
    invoiceStatus: z.enum(['DRAFT', 'SENT', 'CANCELLED']).optional(),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['DRAFT', 'SENT', 'CANCELLED'], {
      required_error: 'Status is required'
    }),
  }),
});

export const queryInvoiceSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).optional(),
    limit: z.preprocess((val) => Number(val) || 10, z.number().min(1)).optional(),
    search: z.string().optional(),
    status: z.enum(['DRAFT', 'SENT', 'CANCELLED']).optional(),
    paymentStatus: z.enum(['UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE']).optional(),
    customerId: z.string().regex(objectIdRegex).optional(),
    salesPersonId: z.string().regex(objectIdRegex).optional(),
  }).catchall(z.any()),
});
