import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid Mongoose ObjectId');

const addressValidator = z.object({
  street: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
}).optional();

export const createCustomerSchema = z.object({
  body: z.object({
    companyName: z.string({ required_error: 'Company name is required' }).trim().min(2, 'Company name must be at least 2 characters'),
    customerName: z.string({ required_error: 'Customer name is required' }).trim().min(2, 'Customer name must be at least 2 characters'),
    email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().trim().optional(),
    website: z.string().trim().url('Invalid website URL').optional().or(z.literal('')),
    industry: z.string().trim().optional(),
    gstNumber: z.string().trim().optional(),
    billingAddress: addressValidator,
    shippingAddress: addressValidator,
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    assignedSalesPerson: objectIdSchema.optional().nullable(),
    status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).optional(),
    notes: z.string().trim().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    companyName: z.string().trim().min(2).optional(),
    customerName: z.string().trim().min(2).optional(),
    email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().trim().optional(),
    website: z.string().trim().url('Invalid website URL').optional().or(z.literal('')),
    industry: z.string().trim().optional(),
    gstNumber: z.string().trim().optional(),
    billingAddress: addressValidator,
    shippingAddress: addressValidator,
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    assignedSalesPerson: objectIdSchema.optional().nullable(),
    status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).optional(),
    notes: z.string().trim().optional(),
  }),
});

export const queryCustomerSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).optional(),
    limit: z.preprocess((val) => Number(val) || 10, z.number().min(1)).optional(),
    search: z.string().optional(),
    status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).optional(),
    industry: z.string().optional(),
    assignedSalesPerson: z.string().regex(objectIdRegex).optional(),
    sortBy: z.string().default('createdAt').optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  }).catchall(z.any()),
});
