import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  slug: z.string().min(1, 'Requerido'),
  longDesc: z.string().optional(),
  shortDesc: z.string().optional(),
  price: z.number().int().nonnegative().default(0),
  cost: z.number().int().nonnegative().default(0),
  durationMinutes: z.number().int().nonnegative(),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  categoryId: z.string().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

export const serviceMediaAttachSchema = z.object({
  mediaId: z.string(),
  orderIndex: z.number().int().nonnegative().optional(),
});

export const serviceMediaUpdateSchema = z.object({
  orderIndex: z.number().int().nonnegative(),
});

export const serviceMediaParamsSchema = z.object({
  id: z.string(),
  mediaId: z.string(),
});

export const serviceIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const serviceListQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  isPublic: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      return value === 'true';
    }),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
