import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid Mongoose ObjectId');

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Department name is required' }).trim().min(2, 'Name must be at least 2 characters'),
    manager: z.string().optional().nullable(),
    description: z.string().trim().optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    manager: z.string().optional().nullable(),
    description: z.string().trim().optional(),
  }),
});

export const createEmployeeSchema = z.object({
  body: z.object({
    user: objectIdSchema,
    employeeId: z.string({ required_error: 'Employee ID is required' }).trim().min(2, 'Employee ID must be at least 2 characters'),
    department: objectIdSchema.optional().nullable(),
    designation: z.string({ required_error: 'Designation is required' }).trim().min(2, 'Designation is required'),
    dateOfJoining: z.string({ required_error: 'Date of joining is required' }).datetime({ message: 'Invalid ISO DateTime string' }),
    personalInfo: z.object({
      dob: z.string().datetime().optional().nullable(),
      gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
      phoneNumber: z.string().optional(),
      address: z.string().optional(),
      emergencyContact: z.object({
        name: z.string().optional(),
        relationship: z.string().optional(),
        phone: z.string().optional(),
      }).optional()
    }).optional()
  }),
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    department: objectIdSchema.optional().nullable(),
    designation: z.string().trim().min(2).optional(),
    dateOfJoining: z.string().datetime().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED']).optional(),
    personalInfo: z.object({
      dob: z.string().datetime().optional().nullable(),
      gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
      phoneNumber: z.string().optional(),
      address: z.string().optional(),
      emergencyContact: z.object({
        name: z.string().optional(),
        relationship: z.string().optional(),
        phone: z.string().optional(),
      }).optional()
    }).optional()
  }),
});

export const applyLeaveSchema = z.object({
  body: z.object({
    leaveType: z.enum(['SICK', 'CASUAL', 'MATERNITY', 'PATERNITY', 'UNPAID'], {
      required_error: 'Leave type is required'
    }),
    startDate: z.string({ required_error: 'Start date is required' }).datetime({ message: 'Invalid ISO DateTime' }),
    endDate: z.string({ required_error: 'End date is required' }).datetime({ message: 'Invalid ISO DateTime' }),
    reason: z.string({ required_error: 'Reason is required' }).trim().min(5, 'Reason must be at least 5 characters'),
  }),
});

export const updateLeaveStatusSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED'], {
      required_error: 'Status must be APPROVED or REJECTED'
    }),
    comments: z.string().trim().optional(),
  }),
});

export const createPayrollSchema = z.object({
  body: z.object({
    employee: objectIdSchema,
    month: z.number({ required_error: 'Month is required' }).min(1).max(12),
    year: z.number({ required_error: 'Year is required' }),
    basicSalary: z.number({ required_error: 'Basic salary is required' }).nonnegative(),
    allowances: z.number().nonnegative().optional(),
    deductions: z.number().nonnegative().optional(),
  }),
});
