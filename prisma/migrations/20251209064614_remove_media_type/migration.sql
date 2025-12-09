/*
  Warnings:

  - You are about to drop the column `type` on the `media` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "media" DROP COLUMN "type";

-- DropEnum
DROP TYPE "MediaType";
