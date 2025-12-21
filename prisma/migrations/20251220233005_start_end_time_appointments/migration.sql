/*
  Warnings:

  - You are about to drop the column `appointmentDate` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `durationMinutes` on the `appointments` table. All the data in the column will be lost.
  - Added the required column `endAt` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startAt` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "appointments_therapistId_appointmentDate_idx";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "appointmentDate",
DROP COLUMN "durationMinutes",
ADD COLUMN     "endAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "appointments_startAt_idx" ON "appointments"("startAt");

-- CreateIndex
CREATE INDEX "appointments_serviceId_startAt_idx" ON "appointments"("serviceId", "startAt");
