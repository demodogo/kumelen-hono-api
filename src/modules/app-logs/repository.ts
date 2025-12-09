import { prisma } from '../../db/prisma.js';
import type { CreateLogInput } from './types.js';

export const appLogsRepository = {
  findLogByUser(id: string) {
    return prisma.appLogs.findMany({
      where: { userId: id },
      include: { user: true },
    });
  },

  createLog(data: CreateLogInput) {
    return prisma.appLogs.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details ?? null,
      },
    });
  },

  findAll() {
    return prisma.appLogs.findMany({
      include: { user: true },
    });
  },
};
