import type { FindManyArgs } from './types.js';
import { Prisma } from '@prisma/client';

export function buildWhere({ search, slug, tags }: FindManyArgs): Prisma.BlogPostWhereInput {
  const where: Prisma.BlogPostWhereInput = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (slug) {
    where.slug = slug;
  }

  if (tags && tags.length > 0) {
    where.tags = { hasSome: tags };
  }

  return where;
}
