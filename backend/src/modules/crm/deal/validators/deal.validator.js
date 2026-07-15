import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid Mongoose ObjectId');

export const createDealSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Deal title is required' }).trim().min(2, 'Deal title must be at least 2 characters'),
    customer: objectIdSchema,
    amount: z.number({ required_error: 'Deal amount is required' }).min(0, 'Amount cannot be negative'),
    stage: z.enum(['QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
    expectedCloseDate: z.string().datetime('Invalid close date timestamp').optional().or(z.literal('')),
    assignedSalesPerson: objectIdSchema.optional().nullable(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    company: z.string().trim().optional(),
    contactPerson: z.string().trim().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().trim().optional(),
    currency: z.string().trim().optional(),
    pipeline: z.string().trim().optional(),
    leadSource: z.string().trim().optional(),
    description: z.string().trim().optional(),
    attachments: z.array(z.string()).optional(),
    status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  }),
});

export const updateDealSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).optional(),
    customer: objectIdSchema.optional(),
    amount: z.number().min(0).optional(),
    stage: z.enum(['QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
    expectedCloseDate: z.string().datetime('Invalid close date timestamp').optional().or(z.literal('')),
    assignedSalesPerson: objectIdSchema.optional().nullable(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    company: z.string().trim().optional(),
    contactPerson: z.string().trim().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().trim().optional(),
    currency: z.string().trim().optional(),
    pipeline: z.string().trim().optional(),
    leadSource: z.string().trim().optional(),
    description: z.string().trim().optional(),
    attachments: z.array(z.string()).optional(),
    status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  }),
});

export const queryDealSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).optional(),
    limit: z.preprocess((val) => Number(val) || 10, z.number().min(1)).optional(),
    search: z.string().optional(),
    stage: z.enum(['QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
    customer: z.string().regex(objectIdRegex).optional(),
    assignedSalesPerson: z.string().regex(objectIdRegex).optional(),
    sortBy: z.string().default('createdAt').optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  }).catchall(z.any()),
});
