/*
  Warnings:

  - Changed the type of `entity` on the `app_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "app_logs" DROP COLUMN "entity",
ADD COLUMN     "entity" "EntityType" NOT NULL;
