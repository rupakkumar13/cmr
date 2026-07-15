import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid Mongoose ObjectId');

const flexibleObjectIdSchema = z.string().transform((val) => {
  if (objectIdRegex.test(val)) {
    return val;
  }
  return '507f1f77bcf86cd799439011';
});

const productItemSchema = z.object({
  productId: z.string().regex(objectIdRegex).optional().nullable().or(z.literal('')),
  name: z.string().trim().optional(),
  quantity: z.number({ required_error: 'Quantity is required' }).min(1, 'Quantity must be at least 1'),
  unitPrice: z.number({ required_error: 'Unit price is required' }).min(0, 'Unit price cannot be negative'),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
});

export const createQuotationSchema = z.object({
  body: z.object({
    customerId: objectIdSchema,
    companyId: objectIdSchema,
    dealId: objectIdSchema,
    salesPersonId: flexibleObjectIdSchema.optional(),
    salespersonId: flexibleObjectIdSchema.optional(),
    products: z.array(productItemSchema).nonempty('At least one product is required'),
    expiryDate: z.string().datetime('Invalid expiry date format'),
    notes: z.string().trim().optional(),
    shippingCharge: z.number().min(0).optional(),
    termsAndConditions: z.string().trim().optional(),
    quotationStatus: z.enum(['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
  }),
});

export const updateQuotationSchema = z.object({
  body: z.object({
    customerId: objectIdSchema.optional(),
    companyId: objectIdSchema.optional(),
    dealId: objectIdSchema.optional(),
    salesPersonId: flexibleObjectIdSchema.optional(),
    salespersonId: flexibleObjectIdSchema.optional(),
    products: z.array(productItemSchema).optional(),
    expiryDate: z.string().datetime().optional(),
    notes: z.string().trim().optional(),
    shippingCharge: z.number().min(0).optional(),
    termsAndConditions: z.string().trim().optional(),
    quotationStatus: z.enum(['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED'], {
      required_error: 'Status is required'
    }),
  }),
});

export const queryQuotationSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).optional(),
    limit: z.preprocess((val) => Number(val) || 10, z.number().min(1)).optional(),
    search: z.string().optional(),
    status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
    customerId: z.string().regex(objectIdRegex).optional(),
    dealId: z.string().regex(objectIdRegex).optional(),
    salesPersonId: z.string().regex(objectIdRegex).optional(),
    salespersonId: z.string().regex(objectIdRegex).optional(),
  }).catchall(z.any()),
});
