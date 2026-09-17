-- CreateEnum
CREATE TYPE "ViewType" AS ENUM ('TABLE', 'KANBAN', 'CALENDAR', 'LIST');

-- CreateTable
CREATE TABLE "views" (
    "id" UUID NOT NULL,
    "entityId" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ViewType" NOT NULL DEFAULT 'KANBAN',
    "config" JSONB NOT NULL DEFAULT '{}',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "views_entityId_idx" ON "views"("entityId");

-- CreateIndex
CREATE INDEX "views_projectId_idx" ON "views"("projectId");

-- AddForeignKey
ALTER TABLE "views" ADD CONSTRAINT "views_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "views" ADD CONSTRAINT "views_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
