/*
  Warnings:

  - Added the required column `endsAt` to the `ExamSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExamSubmission" ADD COLUMN     "endsAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "idx_exam_submissions_expiry" ON "ExamSubmission"("status", "endsAt");
