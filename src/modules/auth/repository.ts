import { prisma } from '../../db/prisma.js';

export const authRepository = {
  changePassword(id: string, password: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash: password },
    });
  },
};
