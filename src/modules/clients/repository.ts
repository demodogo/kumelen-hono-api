import type { CreateCustomerInput, FindManyArgs, UpdateCustomerInput } from './types.js';
import { prisma } from '../../db/prisma.js';
import { buildCustomerWhere } from './helpers.js';

export const customersRepository = {
  async findMany(args: FindManyArgs) {
    const { search, skip, take } = args;
    const where = buildCustomerWhere(search);

    return prisma.customer.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        appointments: {
          include: {
            _count: {
              select: {
                sessionNotes: true,
              },
            },
          },
        },
        _count: {
          select: {
            sales: true,
            appointments: true,
          },
        },
      },
    });
  },

  findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            receiptNumber: true,
            total: true,
            createdAt: true,
          },
        },
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take: 10,
          select: {
            id: true,
            appointmentDate: true,
            status: true,
            service: {
              select: {
                id: true,
                name: true,
              },
            },
            therapist: {
              select: {
                id: true,
                name: true,
                lastName: true,
              },
            },
          },
        },
        records: {
          orderBy: { updatedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            generalNotes: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            sales: true,
            appointments: true,
            records: true,
          },
        },
      },
    });
  },

  findByEmail(email: string) {
    return prisma.customer.findUnique({
      where: { email },
    });
  },

  findByPhone(phone: string) {
    return prisma.customer.findUnique({
      where: { phone },
    });
  },

  findByRut(rut: string) {
    return prisma.customer.findUnique({
      where: { rut },
    });
  },

  async create(data: CreateCustomerInput) {
    return prisma.customer.create({
      data: {
        name: data.name,
        lastName: data.lastName || null,
        email: data.email || null,
        phone: data.phone || null,
        rut: data.rut || null,
        notes: data.notes || null,
      },
    });
  },

  update(id: string, data: UpdateCustomerInput) {
    return prisma.customer.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.lastName !== undefined && { lastName: data.lastName || null }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.rut !== undefined && { rut: data.rut || null }),
        ...(data.points !== undefined && { points: data.points }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
      },
    });
  },

  delete(id: string) {
    return prisma.customer.update({ where: { id }, data: { isActive: false } });
  },

  async addPoints(id: string, points: number) {
    return prisma.customer.update({
      where: { id },
      data: {
        points: {
          increment: points,
        },
      },
    });
  },

  async subtractPoints(id: string, points: number) {
    return prisma.customer.update({
      where: { id },
      data: {
        points: {
          decrement: points,
        },
      },
    });
  },

  async validateUniqueFields(
    fields: {
      email?: string;
      phone?: string;
      rut?: string;
    },
    currentData?: {
      email?: string | null;
      phone?: string | null;
      rut?: string | null;
    },
    excludeId?: string
  ) {
    const checks = [
      { field: 'email', value: fields.email, method: customersRepository.findByEmail },
      { field: 'phone', value: fields.phone, method: customersRepository.findByPhone },
      { field: 'rut', value: fields.rut, method: this.findByRut },
    ];

    for (const { field, value, method } of checks) {
      if (!value) continue;

      if (currentData && currentData[field as keyof typeof currentData] === value) continue;

      const existing = await method(value);

      if (existing && existing.id !== excludeId) {
        if (!existing.isActive) {
          await customersRepository.reactivateClient(existing.id);
          return existing.id;
        }
        throw new Error(`Ya existe un cliente con este ${field}`);
      }
    }
    return null;
  },
  reactivateClient(id: string) {
    return prisma.customer.update({
      where: { id },
      data: {
        isActive: true,
      },
    });
  },
};
