-- CreateEnum
CREATE TYPE "SprintStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('INCREASE', 'DECREASE', 'TARGET');

-- CreateEnum
CREATE TYPE "SprintEventType" AS ENUM ('SUCCESS', 'PARTIAL_SUCCESS', 'FAILURE', 'PIVOT', 'PAUSE', 'BREAKTHROUGH');

-- CreateTable
CREATE TABLE "sprints" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "goal" TEXT,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SprintStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sprint_metrics" (
    "id" UUID NOT NULL,
    "sprintId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "metricType" "MetricType" NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "actualValue" DOUBLE PRECISION,
    "unit" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "isAchieved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sprint_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sprint_events" (
    "id" UUID NOT NULL,
    "sprintId" UUID NOT NULL,
    "type" "SprintEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sprint_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "increments" (
    "id" UUID NOT NULL,
    "sprintId" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "increments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sprints_projectId_idx" ON "sprints"("projectId");

-- CreateIndex
CREATE INDEX "sprints_projectId_status_idx" ON "sprints"("projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "sprints_projectId_number_key" ON "sprints"("projectId", "number");

-- CreateIndex
CREATE INDEX "sprint_metrics_sprintId_idx" ON "sprint_metrics"("sprintId");

-- CreateIndex
CREATE INDEX "sprint_events_sprintId_idx" ON "sprint_events"("sprintId");

-- CreateIndex
CREATE INDEX "increments_sprintId_idx" ON "increments"("sprintId");

-- CreateIndex
CREATE INDEX "increments_projectId_idx" ON "increments"("projectId");

-- AddForeignKey
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprint_metrics" ADD CONSTRAINT "sprint_metrics_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "sprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprint_events" ADD CONSTRAINT "sprint_events_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "sprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprint_events" ADD CONSTRAINT "sprint_events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "increments" ADD CONSTRAINT "increments_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "sprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "increments" ADD CONSTRAINT "increments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "increments" ADD CONSTRAINT "increments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
