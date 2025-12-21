import type { CreateAppointmentInput, FindManyArgs, UpdateAppointmentInput } from './types.js';
import { prisma } from '../../../db/prisma.js';
import { buildAppointmentWhere } from './helpers.js';

export const appointmentsRepository = {
  async findMany(args: FindManyArgs) {
    const { therapistId, customerId, status, startDate, endDate, skip, take } = args;
    const where = buildAppointmentWhere({ therapistId, customerId, status, startDate, endDate });

    return prisma.appointment.findMany({
      where,
      skip,
      take,
      orderBy: { startAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        therapist: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            code: true,
            price: true,
            durationMinutes: true,
          },
        },
      },
    });
  },

  findById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        therapist: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            code: true,
            price: true,
            durationMinutes: true,
          },
        },
      },
    });
  },

  async create(
    data: Omit<CreateAppointmentInput, 'startAt' | 'endAt' | 'customerId'> & {
      therapistId?: string;
      customerId: string;
      startAt: string;
      endAt: string;
    }
  ) {
    return prisma.appointment.create({
      data: {
        customerId: data.customerId,
        therapistId: data.therapistId || null,
        serviceId: data.serviceId,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
        status: data.status || 'PENDING',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        therapist: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            code: true,
            price: true,
            durationMinutes: true,
          },
        },
      },
    });
  },

  update(id: string, data: UpdateAppointmentInput) {
    return prisma.appointment.update({
      where: { id },
      data: {
        ...(data.customerId !== undefined && { customerId: data.customerId }),
        ...(data.therapistId !== undefined && { therapistId: data.therapistId || null }),
        ...(data.serviceId !== undefined && { serviceId: data.serviceId }),
        ...(data.startAt !== undefined && {
          startAt: new Date(data.startAt),
        }),
        ...(data.endAt !== undefined && { endAt: new Date(data.endAt) }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.reminderSent !== undefined && { reminderSent: data.reminderSent }),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        therapist: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            code: true,
            price: true,
            durationMinutes: true,
          },
        },
      },
    });
  },

  delete(id: string) {
    return prisma.appointment.delete({ where: { id } });
  },

  findByServiceId(serviceId: string) {
    return prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        durationMinutes: true,
      },
    });
  },

  findOverlappingRange(args: { startAtLt: Date; endAtGt: Date; therapistId?: string }) {
    const { startAtLt, endAtGt, therapistId } = args;

    return prisma.appointment.findMany({
      where: {
        ...(therapistId ? { therapistId } : {}),
        startAt: { lt: startAtLt },
        endAt: { gt: endAtGt },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      select: {
        id: true,
        therapistId: true,
        startAt: true,
        endAt: true,
        status: true,
      },
      orderBy: { startAt: 'asc' },
    });
  },
};
