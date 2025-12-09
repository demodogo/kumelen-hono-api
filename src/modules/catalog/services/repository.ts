import type { CreateServiceInput, FindManyArgs, UpdateServiceInput } from './types.js';
import type { Service, ServiceMedia } from '@prisma/client';
import { buildWhere } from './helpers.js';
import { prisma } from '../../../db/prisma.js';
import { categoriesRepository } from '../categories/repository.js';
import { ConflictError } from '../../../shared/errors/app-errors.js';

export const servicesRepository = {
  async findManyWithCount(args: FindManyArgs): Promise<[Service[], number]> {
    const { search, categoryId, isPublic, skip, take } = args;
    const where = buildWhere({ search, categoryId, isPublic });
    const [items, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
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
      }),
      prisma.service.count({ where }),
    ]);
    const itemsWithSortedMedia = items.map((item) => ({
      ...item,
      mediaFiles: item.mediaFiles.sort((a, b) => b.orderIndex - a.orderIndex),
    }));
    return [itemsWithSortedMedia as Service[], total];
  },

  findById(id: string) {
    return prisma.service.findUnique({ where: { id } });
  },

  async create(data: CreateServiceInput) {
    let category;
    if (data.categoryId) {
      category = await categoriesRepository.findById(data.categoryId);
    } else {
      category = await categoriesRepository.findBySlug('default');
    }
    if (!category) {
      throw new ConflictError('Conflict with Category FK');
    }
    const withCategoryData = { ...data, categoryId: category.id };
    return prisma.service.create({
      data: withCategoryData,
    });
  },

  update(id: string, data: UpdateServiceInput) {
    return prisma.service.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.shortDesc !== undefined && { short_desc: data.shortDesc }),
        ...(data.longDesc !== undefined && { long_desc: data.longDesc }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.cost !== undefined && { cost: data.cost }),
        ...(data.durationMinutes !== undefined && { durationMinutes: data.durationMinutes }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      },
    });
  },

  delete(id: string) {
    return prisma.service.delete({ where: { id } });
  },

  findByName(name: string) {
    return prisma.service.findUnique({ where: { name } });
  },

  findBySlug(slug: string) {
    return prisma.service.findUnique({ where: { slug } });
  },

  async findMediaByServiceId(serviceId: string) {
    const items = await prisma.serviceMedia.findMany({
      where: { serviceId },
    });
    return items as unknown as ServiceMedia[];
  },

  async attachMediaToService(args: { serviceId: string; mediaId: string; orderIndex?: number }) {
    const { serviceId, mediaId, orderIndex } = args;
    let finalIndex = orderIndex;
    if (finalIndex === undefined) {
      const last = await prisma.serviceMedia.findFirst({
          where: { serviceId },
          orderBy: { orderIndex: 'desc' },
        }),
        finalIndex = last ? last.orderIndex + 1 : 0;
    }
    const item = await prisma.serviceMedia.create({
      data: {
        serviceId,
        mediaId,
        orderIndex: finalIndex,
      },
      include: { media: true },
    });

    return item as unknown as ServiceMedia;
  },

  async updateServiceMediaOrder(args: { serviceId: string; mediaId: string; orderIndex: number }) {
    const { serviceId, mediaId, orderIndex } = args;
    const item = await prisma.serviceMedia.update({
      where: { serviceId_mediaId: { serviceId, mediaId } },
      data: { orderIndex },
      include: { media: true },
    });
    return item as unknown as ServiceMedia;
  },

  async detachServiceMedia(args: { serviceId: string; mediaId: string }) {
    const { serviceId, mediaId } = args;
    await prisma.serviceMedia.delete({
      where: { serviceId_mediaId: { serviceId, mediaId } },
    });
  },
};
