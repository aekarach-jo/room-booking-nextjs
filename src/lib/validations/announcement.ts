import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['INFO', 'WARNING', 'URGENT']).default('INFO'),
  isPinned: z.boolean().default(false),
  publishDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  type: z.enum(['INFO', 'WARNING', 'URGENT']).optional(),
  isPinned: z.boolean().optional(),
  publishDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional().nullable(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
