import { z } from 'zod';

// Accepts both ISO datetime (2026-01-29T12:30:00.000Z) and datetime-local format (2026-01-29T12:30)
const dateTimeString = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Invalid date format' }
);

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['INFO', 'WARNING', 'URGENT']).default('INFO'),
  isPinned: z.boolean().default(false),
  publishDate: dateTimeString.optional(),
  expiryDate: dateTimeString.optional(),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  type: z.enum(['INFO', 'WARNING', 'URGENT']).optional(),
  isPinned: z.boolean().optional(),
  publishDate: dateTimeString.optional(),
  expiryDate: dateTimeString.optional().nullable(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
