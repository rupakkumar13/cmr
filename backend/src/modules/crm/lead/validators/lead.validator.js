import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid Mongoose ObjectId');

export const createLeadSchema = z.object({
  body: z.object({
    companyName: z.string().trim().optional(),
    leadName: z.string({ required_error: 'Lead name is required' }).trim().min(2, 'Lead name must be at least 2 characters'),
    email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().trim().optional(),
    website: z.string().trim().url('Invalid website URL').optional().or(z.literal('')),
    source: z.string().trim().optional(),
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'LOST']).optional(),
    assignedSalesPerson: objectIdSchema.optional().nullable(),
    notes: z.string().trim().optional(),
  }),
});

export const updateLeadSchema = z.object({
  body: z.object({
    companyName: z.string().trim().optional(),
    leadName: z.string().trim().min(2).optional(),
    email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().trim().optional(),
    website: z.string().trim().url('Invalid website URL').optional().or(z.literal('')),
    source: z.string().trim().optional(),
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'LOST']).optional(),
    assignedSalesPerson: objectIdSchema.optional().nullable(),
    notes: z.string().trim().optional(),
  }),
});

export const queryLeadSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).optional(),
    limit: z.preprocess((val) => Number(val) || 10, z.number().min(1)).optional(),
    search: z.string().optional(),
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'LOST']).optional(),
    source: z.string().optional(),
    assignedSalesPerson: z.string().regex(objectIdRegex).optional(),
    sortBy: z.string().default('createdAt').optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  }).catchall(z.any()),
});
