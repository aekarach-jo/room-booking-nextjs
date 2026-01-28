import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  type: z.enum(['LECTURE', 'COMPUTER_LAB', 'LABORATORY', 'MEETING', 'STUDY']).default('LECTURE'),
  floor: z.number().int().optional(),
  building: z.string().optional(),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  equipment: z.array(z.string()).optional(),
  description: z.string().optional(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)').default('08:00'),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)').default('20:00'),
  isActive: z.boolean().default(true),
  maxBookingHours: z.number().int().min(1).max(12).default(3),
  advanceBookingDays: z.number().int().min(1).max(90).default(7),
  requireApproval: z.boolean().default(true),
});

export const updateRoomSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['LECTURE', 'COMPUTER_LAB', 'LABORATORY', 'MEETING', 'STUDY']).optional(),
  floor: z.number().int().optional().nullable(),
  building: z.string().optional().nullable(),
  capacity: z.number().int().min(1).optional(),
  equipment: z.array(z.string()).optional(),
  description: z.string().optional().nullable(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  isActive: z.boolean().optional(),
  maxBookingHours: z.number().int().min(1).max(12).optional(),
  advanceBookingDays: z.number().int().min(1).max(90).optional(),
  requireApproval: z.boolean().optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
