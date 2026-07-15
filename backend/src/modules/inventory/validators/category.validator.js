import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid Mongoose ObjectId');

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Category name is required' }).trim().min(2, 'Name must be at least 2 characters'),
    description: z.string().trim().optional(),
    parentCategory: objectIdSchema.optional().nullable().or(z.literal('')),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    description: z.string().trim().optional(),
    parentCategory: objectIdSchema.optional().nullable().or(z.literal('')),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export const queryCategorySchema = z.object({
  query: z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).optional(),
    limit: z.preprocess((val) => Number(val) || 10, z.number().min(1)).optional(),
    search: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }).catchall(z.any()),
});
