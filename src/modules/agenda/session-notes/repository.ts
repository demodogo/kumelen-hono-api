import type { CreateSessionNoteInput, UpdateSessionNoteInput } from './types.js';
import { prisma } from '../../../db/prisma.js';

export const sessionNotesRepository = {
  findById(id: string) {
    return prisma.sessionNote.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                lastName: true,
              },
            },
            therapist: {
              select: {
                id: true,
                name: true,
                lastName: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  },

  findByAppointmentId(appointmentId: string) {
    return prisma.sessionNote.findMany({
      where: { appointmentId },
      orderBy: { createdAt: 'desc' },
      include: {
        appointment: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                lastName: true,
              },
            },
            therapist: {
              select: {
                id: true,
                name: true,
                lastName: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  },

  findByCustomerId(customerId: string) {
    return prisma.sessionNote.findMany({
      where: {
        appointment: {
          customerId: customerId,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        appointment: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                lastName: true,
              },
            },
            therapist: {
              select: {
                id: true,
                name: true,
                lastName: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  },

  async create(data: CreateSessionNoteInput) {
    return prisma.sessionNote.create({
      data: {
        appointmentId: data.appointmentId,
        notes: data.notes,
        observations: data.observations || null,
        nextSteps: data.nextSteps || null,
      },
      include: {
        appointment: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                lastName: true,
              },
            },
            therapist: {
              select: {
                id: true,
                name: true,
                lastName: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  },

  update(id: string, data: UpdateSessionNoteInput) {
    return prisma.sessionNote.update({
      where: { id },
      data: {
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.observations !== undefined && { observations: data.observations || null }),
        ...(data.nextSteps !== undefined && { nextSteps: data.nextSteps || null }),
      },
      include: {
        appointment: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                lastName: true,
              },
            },
            therapist: {
              select: {
                id: true,
                name: true,
                lastName: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  },

  delete(id: string) {
    return prisma.sessionNote.delete({ where: { id } });
  },
};
