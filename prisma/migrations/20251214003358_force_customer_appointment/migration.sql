/*
  Warnings:

  - You are about to drop the column `guestEmail` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `guestLastName` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `guestName` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `guestPhone` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `guestEmail` on the `patient_records` table. All the data in the column will be lost.
  - You are about to drop the column `guestLastName` on the `patient_records` table. All the data in the column will be lost.
  - You are about to drop the column `guestName` on the `patient_records` table. All the data in the column will be lost.
  - You are about to drop the column `guestPhone` on the `patient_records` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rut]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customerId]` on the table `patient_records` will be added. If there are existing duplicate values, this will fail.
  - Made the column `customerId` on table `appointments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `customerId` on table `patient_records` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_customerId_fkey";

-- DropForeignKey
ALTER TABLE "patient_records" DROP CONSTRAINT "patient_records_customerId_fkey";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "guestEmail",
DROP COLUMN "guestLastName",
DROP COLUMN "guestName",
DROP COLUMN "guestPhone",
ALTER COLUMN "customerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "rut" TEXT;

-- AlterTable
ALTER TABLE "patient_records" DROP COLUMN "guestEmail",
DROP COLUMN "guestLastName",
DROP COLUMN "guestName",
DROP COLUMN "guestPhone",
ALTER COLUMN "customerId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "customers_rut_key" ON "customers"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "patient_records_customerId_key" ON "patient_records"("customerId");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_records" ADD CONSTRAINT "patient_records_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
