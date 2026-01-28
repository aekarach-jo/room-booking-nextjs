import { z } from 'zod';

export const createBookingSchema = z.object({
  roomId: z.string().min(1, 'Room is required'),
  date: z.string().datetime({ message: 'Invalid date format' }),
  startTime: z.string().datetime({ message: 'Invalid start time format' }),
  endTime: z.string().datetime({ message: 'Invalid end time format' }),
  purpose: z.string().min(1, 'Purpose is required'),
  attendees: z.number().int().min(1, 'At least 1 attendee required'),
}).refine(data => new Date(data.endTime) > new Date(data.startTime), {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
  adminNote: z.string().optional().nullable(),
  purpose: z.string().min(1).optional(),
  attendees: z.number().int().min(1).optional(),
});

export const approveRejectSchema = z.object({
  adminNote: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type ApproveRejectInput = z.infer<typeof approveRejectSchema>;
