/*
  Warnings:

  - You are about to drop the column `notes` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `appointmentId` on the `patient_records` table. All the data in the column will be lost.
  - You are about to drop the column `patientRecordId` on the `session_notes` table. All the data in the column will be lost.
  - You are about to drop the column `sessionDate` on the `session_notes` table. All the data in the column will be lost.
  - Added the required column `appointmentId` to the `session_notes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "patient_records" DROP CONSTRAINT "patient_records_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "session_notes" DROP CONSTRAINT "session_notes_patientRecordId_fkey";

-- DropIndex
DROP INDEX "patient_records_appointmentId_key";

-- DropIndex
DROP INDEX "session_notes_patientRecordId_idx";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "notes";

-- AlterTable
ALTER TABLE "patient_records" DROP COLUMN "appointmentId";

-- AlterTable
ALTER TABLE "session_notes" DROP COLUMN "patientRecordId",
DROP COLUMN "sessionDate",
ADD COLUMN     "appointmentId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "session_notes_appointmentId_idx" ON "session_notes"("appointmentId");

-- AddForeignKey
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
