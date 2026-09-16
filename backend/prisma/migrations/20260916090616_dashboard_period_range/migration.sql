/*
  Warnings:

  - You are about to drop the column `period` on the `marketing_dashboards` table. All the data in the column will be lost.
  - Added the required column `periodFrom` to the `marketing_dashboards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodTo` to the `marketing_dashboards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "marketing_dashboards" DROP COLUMN "period",
ADD COLUMN     "periodFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "periodTo" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "marketing_dashboards_projectId_periodFrom_idx" ON "marketing_dashboards"("projectId", "periodFrom");
