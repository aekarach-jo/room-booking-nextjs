import { z } from 'zod';

export const createSpecialDateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.string().datetime({ message: 'Invalid date format' }),
  type: z.enum(['HOLIDAY', 'EXAM', 'EVENT']),
  description: z.string().optional(),
  semesterId: z.string().optional(),
});

export const updateSpecialDateSchema = z.object({
  name: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  type: z.enum(['HOLIDAY', 'EXAM', 'EVENT']).optional(),
  description: z.string().optional().nullable(),
  semesterId: z.string().optional().nullable(),
});

export type CreateSpecialDateInput = z.infer<typeof createSpecialDateSchema>;
export type UpdateSpecialDateInput = z.infer<typeof updateSpecialDateSchema>;
