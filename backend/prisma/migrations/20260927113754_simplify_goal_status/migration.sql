/*
  Warnings:

  - The values [PARTIAL,FAILED] on the enum `GoalStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GoalStatus_new" AS ENUM ('PENDING', 'ACHIEVED', 'CARRIED_OVER', 'MOVED_BACKLOG', 'CANCELLED');
ALTER TABLE "public"."sprint_goals" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "sprint_goals" ALTER COLUMN "status" TYPE "GoalStatus_new" USING ("status"::text::"GoalStatus_new");
ALTER TYPE "GoalStatus" RENAME TO "GoalStatus_old";
ALTER TYPE "GoalStatus_new" RENAME TO "GoalStatus";
DROP TYPE "public"."GoalStatus_old";
ALTER TABLE "sprint_goals" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
