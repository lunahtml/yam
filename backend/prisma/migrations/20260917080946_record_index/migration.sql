-- CreateTable
CREATE TABLE "record_indexes" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL,
    "valueText" TEXT,
    "valueNumber" DOUBLE PRECISION,
    "valueDate" TIMESTAMP(3),
    "valueBool" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "record_indexes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "record_indexes_entityId_fieldName_valueText_idx" ON "record_indexes"("entityId", "fieldName", "valueText");

-- CreateIndex
CREATE INDEX "record_indexes_entityId_fieldName_valueNumber_idx" ON "record_indexes"("entityId", "fieldName", "valueNumber");

-- CreateIndex
CREATE INDEX "record_indexes_entityId_fieldName_valueDate_idx" ON "record_indexes"("entityId", "fieldName", "valueDate");

-- CreateIndex
CREATE INDEX "record_indexes_entityId_fieldName_valueBool_idx" ON "record_indexes"("entityId", "fieldName", "valueBool");

-- CreateIndex
CREATE INDEX "record_indexes_recordId_idx" ON "record_indexes"("recordId");

-- AddForeignKey
ALTER TABLE "record_indexes" ADD CONSTRAINT "record_indexes_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
