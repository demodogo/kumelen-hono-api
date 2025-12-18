import type { PrismaClient } from '@prisma/client';

export async function seedDefaultCategory(prisma: PrismaClient) {
  const existingDefault = await prisma.category.findUnique({ where: { slug: 'default' } });

  if (!existingDefault) {
    await prisma.category.create({
      data: {
        slug: 'default',
        name: 'SIN CATEGORÍA',
      },
    });
  }
}
