-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('WEBSITE', 'SOCIAL', 'DOCUMENT', 'DASHBOARD', 'VIDEO', 'FILE', 'OFFLINE', 'CUSTOM');

-- CreateTable
CREATE TABLE "artifacts" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "ArtifactType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utm_sources" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utm_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utm_mediums" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utm_mediums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utm_campaigns" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utm_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utm_rules" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB NOT NULL DEFAULT '[]',
    "sourceTemplate" TEXT NOT NULL,
    "mediumTemplate" TEXT NOT NULL,
    "campaignTemplate" TEXT,
    "contentTemplate" TEXT,
    "termTemplate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utm_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utm_links" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "artifactId" TEXT,
    "campaignId" TEXT,
    "source" TEXT NOT NULL,
    "medium" TEXT NOT NULL,
    "campaign" TEXT,
    "content" TEXT,
    "term" TEXT,
    "baseUrl" TEXT NOT NULL,
    "fullUrl" TEXT NOT NULL,
    "label" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "utm_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "artifacts_projectId_idx" ON "artifacts"("projectId");

-- CreateIndex
CREATE INDEX "artifacts_projectId_type_idx" ON "artifacts"("projectId", "type");

-- CreateIndex
CREATE INDEX "utm_sources_projectId_idx" ON "utm_sources"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "utm_sources_projectId_name_key" ON "utm_sources"("projectId", "name");

-- CreateIndex
CREATE INDEX "utm_mediums_projectId_idx" ON "utm_mediums"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "utm_mediums_projectId_name_key" ON "utm_mediums"("projectId", "name");

-- CreateIndex
CREATE INDEX "utm_campaigns_projectId_idx" ON "utm_campaigns"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "utm_campaigns_projectId_name_key" ON "utm_campaigns"("projectId", "name");

-- CreateIndex
CREATE INDEX "utm_rules_projectId_idx" ON "utm_rules"("projectId");

-- CreateIndex
CREATE INDEX "utm_links_projectId_idx" ON "utm_links"("projectId");

-- CreateIndex
CREATE INDEX "utm_links_projectId_campaignId_idx" ON "utm_links"("projectId", "campaignId");

-- CreateIndex
CREATE INDEX "utm_links_artifactId_idx" ON "utm_links"("artifactId");

-- AddForeignKey
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utm_sources" ADD CONSTRAINT "utm_sources_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utm_mediums" ADD CONSTRAINT "utm_mediums_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utm_campaigns" ADD CONSTRAINT "utm_campaigns_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utm_rules" ADD CONSTRAINT "utm_rules_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utm_links" ADD CONSTRAINT "utm_links_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utm_links" ADD CONSTRAINT "utm_links_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "artifacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utm_links" ADD CONSTRAINT "utm_links_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "utm_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utm_links" ADD CONSTRAINT "utm_links_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
