import { z } from 'zod';

export const createSupplierSchema = z.object({
  body: z.object({
    companyName: z.string({ required_error: 'Supplier company name is required' }).trim().min(1, 'Company name cannot be empty'),
    contactPerson: z.string().trim().optional(),
    email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().trim().optional(),
    gstNumber: z.string().trim().optional(),
    website: z.string().trim().url('Invalid website URL').optional().or(z.literal('')),
    billingAddress: z.string().trim().optional(),
    shippingAddress: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    country: z.string().trim().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
    notes: z.string().trim().optional(),
  }),
});

export const updateSupplierSchema = z.object({
  body: z.object({
    companyName: z.string().trim().min(1).optional(),
    contactPerson: z.string().trim().optional(),
    email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().trim().optional(),
    gstNumber: z.string().trim().optional(),
    website: z.string().trim().url('Invalid website URL').optional().or(z.literal('')),
    billingAddress: z.string().trim().optional(),
    shippingAddress: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    country: z.string().trim().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    notes: z.string().trim().optional(),
  }),
});

export const querySupplierSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).optional(),
    limit: z.preprocess((val) => Number(val) || 10, z.number().min(1)).optional(),
    search: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }).catchall(z.any()),
});
