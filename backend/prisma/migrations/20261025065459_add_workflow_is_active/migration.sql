-- AlterTable
ALTER TABLE "workflows" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "workflows_entityId_isActive_idx" ON "workflows"("entityId", "isActive");
