import { z } from 'zod';

export const createBlogPostSchema = z.object({
  title: z.string().min(1, 'Requerido'),
  slug: z.string().min(1, 'Requerido'),
  content: z.object({
    raw: z.string(),
    html: z.string(),
  }),
  excerpt: z.string().optional(),
  tags: z.string().array().optional(),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export const blogPostMediaAttachSchema = z.object({
  mediaId: z.string(),
  orderIndex: z.number().int().nonnegative().optional(),
});

export const blogPostMediaUpdateSchema = z.object({
  orderIndex: z.number().int().nonnegative(),
});

export const blogPostMediaParamsSchema = z.object({
  id: z.string(),
  mediaId: z.string(),
});

export const blogPostParamSchema = z.object({
  id: z.string(),
});

export const blogPostListQuerySchema = z.object({
  search: z.string().optional(),
  slug: z.string().optional(),
  tags: z.string().array().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
