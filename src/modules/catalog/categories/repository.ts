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

  createCategory(data: CreateCategoryInput) {
    return prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
      },
    });
  },

  findAll(published?: boolean, includeOptions?: { products: boolean }) {
    return prisma.category.findMany({
      include: {
        products: includeOptions?.products
          ? {
              where: {
                isPublished: true,
              },
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                shortDesc: true,
                longDesc: true,
                price: true,
                stock: true,
                minStock: true,
                isPublished: true,
                categoryId: true,
                createdAt: true,
                updatedAt: true,
                mediaFiles: {
                  include: {
                    media: true,
                  },
                },
              },
            }
          : false,
      },
      orderBy: { updatedAt: 'asc' },
    });
  },

  findById(id: string, published?: boolean, includeOptions?: { products: boolean }) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        products: includeOptions?.products
          ? published
            ? {
                where: {
                  isPublished: true,
                },
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  sku: true,
                  shortDesc: true,
                  longDesc: true,
                  price: true,
                  stock: true,
                  minStock: true,
                  isPublished: true,
                  categoryId: true,
                  createdAt: true,
                  updatedAt: true,
                  mediaFiles: {
                    include: {
                      media: true,
                    },
                  },
                },
              }
            : true
          : false,
      },
    });
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
