import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Requerido'),
  slug: z.string().min(1, 'Requerido').max(30, 'Máximo 30 caracteres'),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const getCategoriesQuerySchema = z.object({
  'include-catalog': z.coerce.boolean().default(false).optional(),
});
