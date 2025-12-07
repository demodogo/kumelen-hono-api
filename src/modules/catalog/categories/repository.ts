import { prisma } from '../../../db/prisma.js';
import type { CreateCategoryInput, UpdateCategoryInput } from './types.js';

export const categoriesRepository = {
  findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } });
  },

  findByName(name: string) {
    return prisma.category.findUnique({ where: { name } });
  },

  findBySlugOrName(name: string, slug: string) {
    return prisma.category.findFirst({
      where: {
        OR: [{ slug }, { name }],
      },
    });
  },

  createCategory(authedId: string, data: CreateCategoryInput) {
    return prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        createdById: authedId,
      },
    });
  },

  findAll(includeCatalog: boolean) {
    const include = includeCatalog
      ? {
          products: true,
          services: true,
        }
      : {};
    return prisma.category.findMany({
      include,
      orderBy: { name: 'asc' },
    });
  },

  findById(id: string, includeCatalog: boolean = false) {
    const include = includeCatalog ? { products: true, services: true } : {};
    return prisma.category.findUnique({ where: { id }, include });
  },

  update(id: string, data: UpdateCategoryInput) {
    return prisma.category.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.category.delete({ where: { id } });
  },
};
