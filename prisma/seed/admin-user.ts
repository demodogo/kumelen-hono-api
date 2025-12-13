import type { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../src/lib/auth.js';


export async function seedAdminUser(prisma: PrismaClient) {
  const existingAdmin = await prisma.user.findUnique({ where: { username: process.env.ADMIN_USERNAME } });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD!);

    const adminUser = await prisma.user.create({
      data: {
        username: process.env.ADMIN_USERNAME!,
        name: process.env.ADMIN_NAME!,
        lastName: process.env.ADMIN_LAST_NAME!,
        passwordHash: hashedPassword,
        role: 'admin',
      },
    });

  }
}