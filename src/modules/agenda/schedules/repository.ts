import type { ScheduleItem, UpdateScheduleInput } from './types.js';
import { prisma } from '../../../db/prisma.js';

export const schedulesRepository = {
  createMany(therapistId: string, schedules: ScheduleItem[]) {
    return prisma.$transaction(async (tx) => {
      await tx.therapistSchedule.deleteMany({
        where: { therapistId },
      });

      return await Promise.all(
        schedules.map((schedule) =>
          tx.therapistSchedule.create({
            data: {
              therapistId,
              dayOfWeek: schedule.dayOfWeek,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
            },
            include: {
              therapist: {
                select: {
                  id: true,
                  name: true,
                  lastName: true,
                },
              },
            },
          })
        )
      );
    });
  },

  findById(id: string) {
    return prisma.therapistSchedule.findUnique({
      where: { id },
      include: {
        therapist: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
      },
    });
  },

  findAll(includeInactive = false) {
    return prisma.therapistSchedule.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        therapist: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ therapistId: 'asc' }, { dayOfWeek: 'asc' }],
    });
  },

  findByTherapistId(therapistId: string, includeInactive = false) {
    return prisma.therapistSchedule.findMany({
      where: {
        therapistId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { dayOfWeek: 'asc' },
    });
  },

  updateMany(therapistId: string, schedules: ScheduleItem[]) {
    return prisma.$transaction(async (tx) => {
      await tx.therapistSchedule.deleteMany({
        where: { therapistId },
      });

      const created = await Promise.all(
        schedules.map((schedule) =>
          tx.therapistSchedule.create({
            data: {
              therapistId,
              dayOfWeek: schedule.dayOfWeek,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
            },
            include: {
              therapist: {
                select: {
                  id: true,
                  name: true,
                  lastName: true,
                },
              },
            },
          })
        )
      );

      return created;
    });
  },

  update(id: string, data: UpdateScheduleInput) {
    return prisma.therapistSchedule.update({
      where: { id },
      data,
      include: {
        therapist: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
      },
    });
  },

  delete(id: string) {
    return prisma.therapistSchedule.delete({ where: { id } });
  },

  findByTherapistAndDay(therapistId: string, dayOfWeek: any) {
    return prisma.therapistSchedule.findUnique({
      where: {
        therapistId_dayOfWeek: {
          therapistId,
          dayOfWeek,
        },
      },
    });
  },
};
