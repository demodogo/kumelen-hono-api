import type { CreateAppointmentInput, UpdateAppointmentInput, FindManyArgs } from './types.js';
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
      orderBy: { appointmentDate: 'desc' },
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
    data: CreateAppointmentInput & {
      therapistId?: string;
      durationMinutes: number;
      customerId: string;
    }
  ) {
    return prisma.appointment.create({
      data: {
        customerId: data.customerId,
        therapistId: data.therapistId || null,
        serviceId: data.serviceId,
        appointmentDate: new Date(data.appointmentDate),
        durationMinutes: data.durationMinutes,
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
        ...(data.appointmentDate !== undefined && {
          appointmentDate: new Date(data.appointmentDate),
        }),
        ...(data.durationMinutes !== undefined && { durationMinutes: data.durationMinutes }),
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
};
