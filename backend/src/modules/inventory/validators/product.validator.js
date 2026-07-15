import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid Mongoose ObjectId');

export const createProductSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Product name is required' }).trim().min(1, 'Name cannot be empty'),
    sku: z.string({ required_error: 'SKU code is required' }).trim().min(1, 'SKU cannot be empty'),
    barcode: z.string().trim().optional(),
    categoryId: objectIdSchema,
    description: z.string().trim().optional(),
    brand: z.string().trim().optional(),
    unit: z.string().trim().default('units'),
    purchasePrice: z.number({ required_error: 'Purchase price is required' }).min(0, 'Purchase price cannot be negative'),
    sellingPrice: z.number({ required_error: 'Selling price is required' }).min(0, 'Selling price cannot be negative'),
    tax: z.number().min(0).default(0),
    discount: z.number().min(0).default(0),
    minimumStock: z.number().min(0).default(5),
    currentStock: z.number().min(0).default(0),
    warehouseLocation: z.string().trim().optional(),
    supplierId: objectIdSchema.optional(),
    images: z.array(z.string()).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).optional(),
    sku: z.string().trim().min(1).optional(),
    barcode: z.string().trim().optional(),
    categoryId: objectIdSchema.optional(),
    description: z.string().trim().optional(),
    brand: z.string().trim().optional(),
    unit: z.string().trim().optional(),
    purchasePrice: z.number().min(0).optional(),
    sellingPrice: z.number().min(0).optional(),
    tax: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
    minimumStock: z.number().min(0).optional(),
    currentStock: z.number().min(0).optional(),
    warehouseLocation: z.string().trim().optional(),
    supplierId: objectIdSchema.optional(),
    images: z.array(z.string()).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export const queryProductSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).optional(),
    limit: z.preprocess((val) => Number(val) || 10, z.number().min(1)).optional(),
    search: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    categoryId: z.string().regex(objectIdRegex).optional(),
    supplierId: z.string().regex(objectIdRegex).optional(),
  }).catchall(z.any()),
});
