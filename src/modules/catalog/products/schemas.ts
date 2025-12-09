import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  slug: z.string().min(1, 'Requerido'),
  longDesc: z.string().optional(),
  shortDesc: z.string().optional(),
  price: z.number().int().nonnegative().default(0),
  cost: z.number().int().nonnegative().default(0),
  stock: z.number().optional(),
  minStock: z.number().optional(),
  categoryId: z.string().optional(),
  isPublished: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema.partial();

export const productMediaAttachSchema = z.object({
  mediaId: z.string(),
  orderIndex: z.number().int().nonnegative().optional(),
});

export const productMediaUpdateSchema = z.object({
  orderIndex: z.number().int().nonnegative(),
});

export const productMediaParamsSchema = z.object({
  id: z.string(),
  mediaId: z.string(),
});

export const productIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const productListQuerySchema = z.object({
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
