-- DropForeignKey
ALTER TABLE "session_notes" DROP CONSTRAINT "session_notes_appointmentId_fkey";

-- AddForeignKey
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
