import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }).trim().min(2, 'Name must be at least 2 characters'),
    
    email: z.string({
      required_error: 'Email is required',
    }).trim().email('Invalid email address'),
    
    password: z.string({
      required_error: 'Password is required',
    }).min(6, 'Password must be at least 6 characters'),
    
    role: z.enum(['ADMIN', 'HR', 'SALES', 'MANAGER', 'INVENTORY_MANAGER', 'ACCOUNTANT', 'EMPLOYEE'], {
      error_message: 'Invalid role selection',
    }).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }).trim().email('Invalid email address'),
    
    password: z.string({
      required_error: 'Password is required',
    }),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }).trim().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string({
      required_error: 'Password is required',
    }).min(6, 'Password must be at least 6 characters'),
  }),
  // Token could be in query, params, or body depending on client design. We can validate if needed.
});

export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string({
      required_error: 'Verification token is required',
    }),
  }).catchall(z.any()), // Allow other query parameters
});
