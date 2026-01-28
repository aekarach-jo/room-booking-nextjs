import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['STUDENT', 'TEACHER', 'STAFF', 'DEPARTMENT_HEAD']),
  studentId: z.string().optional(),
  teacherId: z.string().optional(),
  department: z.string().optional(),
  year: z.number().int().min(1).max(8).optional(),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  role: z.enum(['STUDENT', 'TEACHER', 'STAFF', 'DEPARTMENT_HEAD']).optional(),
  studentId: z.string().optional().nullable(),
  teacherId: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  year: z.number().int().min(1).max(8).optional().nullable(),
  isActive: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
  suspendedUntil: z.string().datetime().optional().nullable(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
