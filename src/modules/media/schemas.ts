import { z } from 'zod';

export const mediaCreateSchema = z.object({
  url: z.string().url(),
  alt: z.string().max(255).optional().nullable(),
});

export const presignMediaSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  folder: z.enum(['products', 'services', 'blog']),
});
export const mediaUpdateSchema = mediaCreateSchema.partial();
