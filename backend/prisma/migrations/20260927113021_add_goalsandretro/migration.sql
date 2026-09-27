-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('PENDING', 'ACHIEVED', 'PARTIAL', 'FAILED', 'CARRIED_OVER', 'MOVED_BACKLOG', 'CANCELLED');

-- CreateTable
CREATE TABLE "sprint_goals" (
    "id" UUID NOT NULL,
    "sprintId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "description" TEXT,
    "status" "GoalStatus" NOT NULL DEFAULT 'PENDING',
    "order" INTEGER NOT NULL DEFAULT 0,
    "carriedFromId" UUID,
    "movedToBacklog" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sprint_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sprint_retros" (
    "id" UUID NOT NULL,
    "sprintId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "goalAchievement" DOUBLE PRECISION,
    "teamwork" DOUBLE PRECISION,
    "process" DOUBLE PRECISION,
    "quality" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "overall" DOUBLE PRECISION,
    "wellDone" TEXT,
    "improvements" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sprint_retros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sprint_goals_sprintId_idx" ON "sprint_goals"("sprintId");

-- CreateIndex
CREATE INDEX "sprint_retros_sprintId_idx" ON "sprint_retros"("sprintId");

-- CreateIndex
CREATE UNIQUE INDEX "sprint_retros_sprintId_userId_key" ON "sprint_retros"("sprintId", "userId");

-- AddForeignKey
ALTER TABLE "sprint_goals" ADD CONSTRAINT "sprint_goals_carriedFromId_fkey" FOREIGN KEY ("carriedFromId") REFERENCES "sprint_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprint_goals" ADD CONSTRAINT "sprint_goals_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "sprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprint_retros" ADD CONSTRAINT "sprint_retros_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "sprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprint_retros" ADD CONSTRAINT "sprint_retros_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
