import type { CreateServiceInput, FindManyArgs, UpdateServiceInput } from './types.js';
import type { ServiceMedia } from '@prisma/client';
import { buildWhere } from './helpers.js';
import { prisma } from '../../../db/prisma.js';

export const servicesRepository = {
  async findMany(args: FindManyArgs) {
    const { search, isPublic, skip, take } = args;
    const where = buildWhere({ search, isPublic });
    const items = await prisma.service.findMany({
      where: { ...where, isActive: true },
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
    });

    return items.map((item) => ({
      ...item,
      mediaFiles: item.mediaFiles.sort((a, b) => b.orderIndex - a.orderIndex),
    }));
  },

  findById(id: string) {
    return prisma.service.findUnique({
      where: { id },
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
    });
  },

  async create(data: CreateServiceInput) {
    return prisma.service.create({
      data,
    });
  },

  update(id: string, data: UpdateServiceInput) {
    return prisma.service.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.shortDesc !== undefined && { shortDesc: data.shortDesc }),
        ...(data.longDesc !== undefined && { longDesc: data.longDesc }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.cost !== undefined && { cost: data.cost }),
        ...(data.durationMinutes !== undefined && { durationMinutes: data.durationMinutes }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      },
    });
  },

  async delete(id: string) {
    await prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
    await prisma.serviceMedia.deleteMany({
      where: { serviceId: id },
    });
  },

  findByName(name: string) {
    return prisma.service.findUnique({ where: { name } });
  },

  findBySlug(slug: string) {
    return prisma.service.findUnique({ where: { slug } });
  },

  async findMediaByServiceId(serviceId: string) {
    return prisma.serviceMedia.findMany({
      where: { serviceId },
      include: { media: true },
    });
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

  async validateUniqueFields(
    fields: {
      slug?: string;
      name?: string;
    },
    currentData?: {
      slug?: string;
      name?: string;
    },
    excludeId?: string
  ) {
    const checks = [
      { field: 'name', value: fields.name, method: servicesRepository.findByName },
      { field: 'slug', value: fields.slug, method: servicesRepository.findBySlug },
    ];

    for (const { field, value, method } of checks) {
      if (!value) continue;

      if (currentData && currentData[field as keyof typeof currentData] === value) continue;

      const existing = await method(value);

      if (existing && existing.id !== excludeId) {
        if (!existing.isActive) {
          await servicesRepository.reactivateService(existing.id);
          return existing.id;
        }
        throw new Error(`Ya existe un cliente con este ${field}`);
      }
    }
    return null;
  },

  reactivateService(id: string) {
    return prisma.service.update({
      where: { id },
      data: { isActive: true },
    });
  },
};
