-- AlterTable
ALTER TABLE "TeacherStudentLink"
  ALTER COLUMN "studentId" DROP NOT NULL,
  ADD COLUMN "inviteCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TeacherStudentLink_inviteCode_key" ON "TeacherStudentLink"("inviteCode");
