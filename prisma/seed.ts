import { PrismaClient } from '@prisma/client';
// @ts-ignore
import { seedAdminUser } from './seed/admin-user.js';
// @ts-ignore
import { seedDefaultCategory } from './seed/default-category';

const prisma = new PrismaClient();
async function main() {
  console.log('🚀 Starting Master Seed...');

  await seedAdminUser(prisma);
  await seedDefaultCategory(prisma);
  console.log('🏁 All seeds executed successfully.');
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
