import type { CreateMediaInput } from './types.js';
import { prisma } from '../../db/prisma.js';

export const mediaRepository = {
  createMedia(data: CreateMediaInput) {
    return prisma.media.create({ data });
  },

  deleteMedia(id: string) {
    return prisma.media.delete({ where: { id } });
  },

  findById(id: string) {
    return prisma.media.findUnique({ where: { id } });
  },

  findAll() {
    return prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
  },

  remove(id: string) {
    return prisma.media.delete({ where: { id } });
  },
};
