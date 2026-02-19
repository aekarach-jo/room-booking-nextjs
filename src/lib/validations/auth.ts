import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['STUDENT', 'TEACHER']).default('STUDENT'),
  studentId: z.string().optional(),
  teacherId: z.string().optional(),
  department: z.string().optional(),
  year: z.number().int().min(1).max(8).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
