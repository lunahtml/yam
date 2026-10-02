/*
  Warnings:

  - A unique constraint covering the columns `[userId,skillId,organizationId,contextId,geographyId]` on the table `user_skills` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CategoryScope" ADD VALUE 'SPHERE';
ALTER TYPE "CategoryScope" ADD VALUE 'GEOGRAPHY';

-- DropIndex
DROP INDEX "user_skills_userId_skillId_organizationId_contextId_key";

-- AlterTable
ALTER TABLE "user_skills" ADD COLUMN     "geographyId" UUID,
ADD COLUMN     "geographyType" TEXT;

-- CreateIndex
CREATE INDEX "user_skills_geographyId_idx" ON "user_skills"("geographyId");

-- CreateIndex
CREATE UNIQUE INDEX "user_skills_userId_skillId_organizationId_contextId_geograp_key" ON "user_skills"("userId", "skillId", "organizationId", "contextId", "geographyId");

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_geographyId_fkey" FOREIGN KEY ("geographyId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
