import { prisma } from '../../db/prisma.js';
import type { CreateUserInput, UpdateUserInput } from './schemas.js';

export const usersRepository = {
  findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },

  createUser(data: CreateUserInput) {
    return prisma.user.create({
      data: {
        username: data.username,
        passwordHash: data.password,
        name: data.name,
        lastName: data.lastName ?? null,
        role: data.role,
      },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findAll() {
    return prisma.user.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  },

  update(id: string, data: UpdateUserInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },
};
