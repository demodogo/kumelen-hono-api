import type { CreateTherapistInput, UpdateTherapistInput } from './types.js';
import { prisma } from '../../../db/prisma.js';

export const therapistsRepository = {
  create(data: Omit<CreateTherapistInput, 'serviceIds'>) {
    return prisma.therapist.create({
      data: {
        userId: data.userId ?? null,
        name: data.name,
        lastName: data.lastName,
        email: data.email ?? null,
        phone: data.phone ?? null,
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            lastName: true,
          },
        },
      },
    });
  },

  findById(id: string) {
    return prisma.therapist.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        schedule: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            lastName: true,
          },
        },
      },
    });
  },

  findAll(includeInactive = false) {
    return prisma.therapist.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        schedule: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  findByServiceId(serviceId: string) {
    return prisma.therapist.findMany({
      where: { isActive: true, services: { some: { serviceId } } },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        schedule: true,
      },
    });
  },

  update(
    id: string,
    data: Omit<UpdateTherapistInput, 'serviceIds' | 'email' | 'phone'> & {
      email?: string | null;
      phone?: string | null;
    }
  ) {
    return prisma.therapist.update({
      where: { id },
      data,
      include: {
        services: {
          include: {
            service: true,
          },
        },
        schedule: true,
      },
    });
  },

  delete(id: string) {
    return prisma.therapist.delete({ where: { id } });
  },

  assignServices(therapistId: string, serviceIds: string[]) {
    return prisma.$transaction(async (tx) => {
      await tx.therapistService.deleteMany({ where: { therapistId } });

      await tx.therapistService.createMany({
        data: serviceIds.map((serviceId) => ({
          therapistId,
          serviceId,
        })),
      });

      return tx.therapist.findUnique({
        where: { id: therapistId },
        include: {
          services: {
            include: {
              service: true,
            },
          },
          schedule: true,
        },
      });
    });
  },

  findByEmail(email: string) {
    return prisma.therapist.findUnique({ where: { email } });
  },
};
