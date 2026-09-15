/*
  Warnings:

  - The `role` column on the `project_members` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `workspace_members` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `RefreshToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('owner', 'admin', 'member', 'viewer');

-- CreateEnum
CREATE TYPE "ProjectRoleEnum" AS ENUM ('owner', 'admin', 'member', 'viewer');

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- AlterTable
ALTER TABLE "project_members" DROP COLUMN "role",
ADD COLUMN     "role" "ProjectRoleEnum" NOT NULL DEFAULT 'member';

-- AlterTable
ALTER TABLE "workspace_members" DROP COLUMN "role",
ADD COLUMN     "role" "WorkspaceRole" NOT NULL DEFAULT 'member';

-- DropTable
DROP TABLE "RefreshToken";

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "selector" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "device" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_dashboards" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "adBudget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marketingCosts" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "impressions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "clicks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "leads" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mql" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sql" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "meetings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "offers" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deals" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgCheck" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgGrossMargin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgLifetimeMonths" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgPurchaseFreq" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgRevenuePerClient" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activeClients" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "repeatClients" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "retention" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgProductPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "operationalCosts" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "organicVisits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVisits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bounces" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "newClients" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tam" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sam" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "som" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_selector_key" ON "refresh_tokens"("selector");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "marketing_dashboards_projectId_idx" ON "marketing_dashboards"("projectId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_dashboards" ADD CONSTRAINT "marketing_dashboards_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
