import { z } from 'zod';

export const createRecurringBookingSchema = z.object({
  roomId: z.string().min(1, 'Room is required'),
  semesterId: z.string().min(1, 'Semester is required').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  pattern: z.enum(['DAILY', 'WEEKLY', 'CUSTOM']).optional().default('CUSTOM'),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(), // 0=Sunday, 6=Saturday
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
  purpose: z.string().optional(),
});

export type CreateRecurringBookingInput = z.infer<typeof createRecurringBookingSchema>;
