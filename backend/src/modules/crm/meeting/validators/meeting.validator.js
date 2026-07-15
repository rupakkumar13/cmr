import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid Mongoose ObjectId');

export const createMeetingSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Meeting title is required' }).trim().min(2, 'Meeting title must be at least 2 characters'),
    customer: objectIdSchema.optional().nullable(),
    lead: objectIdSchema.optional().nullable(),
    participants: z.array(z.string().email('Invalid participant email')).optional(),
    startTime: z.string().datetime('Invalid start time ISO format'),
    endTime: z.string().datetime('Invalid end time ISO format'),
    location: z.string().trim().optional(),
    description: z.string().trim().optional(),
    status: z.enum(['SCHEDULED', 'HELD', 'CANCELLED']).optional(),
  }),
});

export const updateMeetingSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).optional(),
    customer: objectIdSchema.optional().nullable(),
    lead: objectIdSchema.optional().nullable(),
    participants: z.array(z.string().email('Invalid participant email')).optional(),
    startTime: z.string().datetime('Invalid start time format').optional(),
    endTime: z.string().datetime('Invalid end time format').optional(),
    location: z.string().trim().optional(),
    description: z.string().trim().optional(),
    status: z.enum(['SCHEDULED', 'HELD', 'CANCELLED']).optional(),
  }),
});

export const queryMeetingSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).optional(),
    limit: z.preprocess((val) => Number(val) || 10, z.number().min(1)).optional(),
    status: z.enum(['SCHEDULED', 'HELD', 'CANCELLED']).optional(),
    customer: z.string().regex(objectIdRegex).optional(),
    lead: z.string().regex(objectIdRegex).optional(),
    host: z.string().regex(objectIdRegex).optional(),
  }).catchall(z.any()),
});
