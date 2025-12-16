import type { CreatePatientRecordInput, FindManyArgs, UpdatePatientRecordInput } from './types.js';
import { prisma } from '../../../db/prisma.js';
import { buildPatientRecordWhere } from './helpers.js';

export const patientRecordsRepository = {
  async findMany(args: FindManyArgs) {
    const { customerId, updatedById, skip, take } = args;
    const where = buildPatientRecordWhere({ customerId, updatedById });

    return prisma.patientRecord.findMany({
      where,
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
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
        updatedBy: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
      },
    });
  },

  findById(id: string) {
    return prisma.patientRecord.findUnique({
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
        updatedBy: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
      },
    });
  },

  findByCustomerId(customerId: string) {
    return prisma.patientRecord.findMany({
      where: { customerId },
      orderBy: { updatedAt: 'desc' },
      include: {
        updatedBy: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
      },
    });
  },

  async create(data: CreatePatientRecordInput & { updatedById: string }) {
    return prisma.patientRecord.create({
      data: {
        customerId: data.customerId,
        generalNotes: data.generalNotes || null,
        medicalHistory: data.medicalHistory || null,
        allergies: data.allergies || null,
        medications: data.medications || null,
        updatedById: data.updatedById,
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
        updatedBy: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
      },
    });
  },

  update(id: string, data: UpdatePatientRecordInput) {
    return prisma.patientRecord.update({
      where: { id },
      data: {
        ...(data.generalNotes !== undefined && { generalNotes: data.generalNotes || null }),
        ...(data.medicalHistory !== undefined && { medicalHistory: data.medicalHistory || null }),
        ...(data.allergies !== undefined && { allergies: data.allergies || null }),
        ...(data.medications !== undefined && { medications: data.medications || null }),
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
        updatedBy: {
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
    return prisma.patientRecord.delete({ where: { id } });
  },
};
