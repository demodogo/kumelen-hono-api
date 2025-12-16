-- DropForeignKey
ALTER TABLE "patient_records" DROP CONSTRAINT "patient_records_updatedById_fkey";

-- AddForeignKey
ALTER TABLE "patient_records" ADD CONSTRAINT "patient_records_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
