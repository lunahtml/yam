/*
  Warnings:

  - Added the required column `updatedAt` to the `entities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `fields` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `project_modules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `workflow_steps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `workflow_transitions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `workflows` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "entities" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "fields" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "project_modules" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "workflow_steps" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "workflow_transitions" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "workflows" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
