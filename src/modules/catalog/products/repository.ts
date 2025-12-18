import type { CreateProductInput, FindManyArgs, UpdateProductInput } from './types.js';
import type { ProductMedia } from '@prisma/client';
import { buildWhere } from './helpers.js';
import { prisma } from '../../../db/prisma.js';
import { categoriesRepository } from '../categories/repository.js';
import { ConflictError } from '../../../shared/errors/app-errors.js';

export const productsRepository = {
  async findMany(args: FindManyArgs & { includePrivateFields?: boolean }) {
    const { search, categoryId, isPublic, skip, take, includePrivateFields = true } = args;
    const where = buildWhere({ search, categoryId, isPublic });

    const items = await prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        shortDesc: true,
        longDesc: true,
        price: true,
        cost: includePrivateFields,
        stock: true,
        minStock: true,
        isPublished: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        mediaFiles: {
          include: {
            media: {
              select: {
                id: true,
                url: true,
                alt: true,
              },
            },
          },
        },
      },
    });

    return items.map((item) => ({
      ...item,
      mediaFiles: item.mediaFiles.sort((a, b) => b.orderIndex - a.orderIndex),
    }));
  },

  findById(published: boolean = false, id: string, includePrivateFields: boolean = true) {
    const where = {
      id,
      ...(published && { isPublished: true }),
    };

    return prisma.product.findUnique({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        shortDesc: true,
        longDesc: true,
        price: true,
        cost: includePrivateFields,
        stock: true,
        minStock: true,
        isPublished: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        category: published
          ? {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            }
          : false,
        mediaFiles: published
          ? {
              include: {
                media: true,
              },
            }
          : false,
      },
    });
  },

  async create(data: CreateProductInput) {
    let category;
    if (data.categoryId) {
      category = await categoriesRepository.findById(data.categoryId, false);
    } else {
      category = await categoriesRepository.findBySlug('default');
    }
    if (!category) {
      throw new ConflictError('Conflict with Category FK');
    }
    const withCategoryData = { ...data, categoryId: category.id };
    return prisma.product.create({
      data: withCategoryData,
    });
  },

  findBySlug(slug: string) {
    return prisma.product.findUnique({ where: { slug } });
  },

  findByName(name: string) {
    return prisma.product.findUnique({ where: { name } });
  },

  update(id: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.shortDesc !== undefined && { shortDesc: data.shortDesc }),
        ...(data.longDesc !== undefined && { longDesc: data.longDesc }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.cost !== undefined && { cost: data.cost }),
        ...(data.minStock !== undefined && { minStock: data.minStock }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      },
    });
  },

  delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },

  async findMediaByProductId(productId: string) {
    return prisma.productMedia.findMany({
      where: { productId },
      include: { media: true },
    });
  },

  async attachMediaToProduct(args: { productId: string; mediaId: string; orderIndex?: number }) {
    const { productId, mediaId, orderIndex } = args;
    let finalIndex = orderIndex;
    if (finalIndex === undefined) {
      const last = await prisma.productMedia.findFirst({
        where: { productId },
        orderBy: { orderIndex: 'desc' },
      });
      finalIndex = last ? last.orderIndex + 1 : 0;
    }
    const item = await prisma.productMedia.create({
      data: {
        productId,
        mediaId,
        orderIndex: finalIndex,
      },
      include: { media: true },
    });

    return item as unknown as ProductMedia;
  },

  async updateProductMediaOrder(args: { productId: string; mediaId: string; orderIndex: number }) {
    const { productId, mediaId, orderIndex } = args;

    const item = await prisma.productMedia.update({
      where: {
        productId_mediaId: {
          productId,
          mediaId,
        },
      },
      data: { orderIndex },
      include: { media: true },
    });

    return item as unknown as ProductMedia;
  },

  async detachProductMedia(args: { productId: string; mediaId: string }) {
    const { productId, mediaId } = args;
    await prisma.productMedia.delete({
      where: {
        productId_mediaId: {
          productId,
          mediaId,
        },
      },
    });
  },
};
