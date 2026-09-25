-- AlterTable
ALTER TABLE "records" ADD COLUMN     "sprintId" UUID;

-- AlterTable
ALTER TABLE "sprints" ADD COLUMN     "epicId" UUID;

-- CreateIndex
CREATE INDEX "records_sprintId_idx" ON "records"("sprintId");

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "sprints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_epicId_fkey" FOREIGN KEY ("epicId") REFERENCES "epics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
