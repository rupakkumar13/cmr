import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid Mongoose ObjectId');

export const createFollowUpSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Follow up title is required' }).trim().min(2),
    customer: objectIdSchema.optional().nullable(),
    lead: objectIdSchema.optional().nullable(),
    dueDate: z.string().datetime('Invalid due date ISO format'),
    status: z.enum(['PENDING', 'COMPLETED', 'OVERDUE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    assignedTo: objectIdSchema,
    notes: z.string().trim().optional(),
  }),
});

export const updateFollowUpSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).optional(),
    customer: objectIdSchema.optional().nullable(),
    lead: objectIdSchema.optional().nullable(),
    dueDate: z.string().datetime().optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'OVERDUE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    assignedTo: objectIdSchema.optional(),
    notes: z.string().trim().optional(),
  }),
});

export const queryFollowUpSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).optional(),
    limit: z.preprocess((val) => Number(val) || 10, z.number().min(1)).optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'OVERDUE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    customer: z.string().regex(objectIdRegex).optional(),
    lead: z.string().regex(objectIdRegex).optional(),
    assignedTo: z.string().regex(objectIdRegex).optional(),
  }).catchall(z.any()),
});
