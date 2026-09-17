//backend/src/modules/records/services/record-index.service.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

interface FieldDefinition {
    name: string;
    type: string;
}

interface IndexEntry {
    fieldName: string;
    fieldType: string;
    valueText: string | null;
    valueNumber: number | null;
    valueDate: Date | null;
    valueBool: boolean | null;
}

@Injectable()
export class RecordIndexService {
    constructor(private prisma: PrismaService) { }

    /**
     * Строит индексные записи для значений Record.data.
     * Вызывается при создании/обновлении Record.
     */
    buildIndexes(
        data: Record<string, unknown>,
        fields: FieldDefinition[],
    ): IndexEntry[] {
        const entries: IndexEntry[] = [];

        for (const field of fields) {
            const value = data[field.name];

            if (value === null || value === undefined || value === '') {
                continue;
            }

            const entry: IndexEntry = {
                fieldName: field.name,
                fieldType: field.type,
                valueText: null,
                valueNumber: null,
                valueDate: null,
                valueBool: null,
            };

            switch (field.type) {
                case 'text':
                case 'select':
                case 'user':
                    entry.valueText = String(value);
                    break;

                case 'number':
                    if (typeof value === 'number' && !Number.isNaN(value)) {
                        entry.valueNumber = value;
                    }
                    break;

                case 'date': {
                    const date = new Date(String(value));
                    if (!Number.isNaN(date.getTime())) {
                        entry.valueDate = date;
                    }
                    break;
                }

                case 'boolean':
                    if (typeof value === 'boolean') {
                        entry.valueBool = value;
                    }
                    break;

                default:
                    entry.valueText = String(value);
            }

            entries.push(entry);
        }

        return entries;
    }

    /**
     * Создаёт индексы для Record внутри транзакции.
     */
    async createIndexes(
        tx: Prisma.TransactionClient,
        recordId: string,
        entityId: string,
        projectId: string,
        entries: IndexEntry[],
    ): Promise<void> {
        if (entries.length === 0) return;

        await tx.recordIndex.createMany({
            data: entries.map((entry) => ({
                recordId,
                entityId,
                projectId,
                fieldName: entry.fieldName,
                fieldType: entry.fieldType,
                valueText: entry.valueText,
                valueNumber: entry.valueNumber,
                valueDate: entry.valueDate,
                valueBool: entry.valueBool,
            })),
        });
    }

    /**
     * Удаляет старые индексы и создаёт новые.
     * Используется при обновлении Record.
     */
    async replaceIndexes(
        tx: Prisma.TransactionClient,
        recordId: string,
        entityId: string,
        projectId: string,
        entries: IndexEntry[],
    ): Promise<void> {
        await tx.recordIndex.deleteMany({
            where: { recordId },
        });

        await this.createIndexes(tx, recordId, entityId, projectId, entries);
    }

    /**
     * Удаляет все индексы Record.
     */
    async deleteIndexes(
        tx: Prisma.TransactionClient,
        recordId: string,
    ): Promise<void> {
        await tx.recordIndex.deleteMany({
            where: { recordId },
        });
    }

    /**
     * Возвращает recordId, отсортированные по значению поля.
     * Используется для сортировки.
     */
    async findSortedRecordIds(
        entityId: string,
        fieldName: string,
        fieldType: string,
        sortDir: 'asc' | 'desc',
        skip: number,
        take: number,
    ): Promise<{ recordIds: string[]; total: number }> {
        const valueColumn = this.getValueColumn(fieldType);

        const where = {
            entityId,
            fieldName,
            [valueColumn]: { not: null },
        };

        const [indexes, total] = await Promise.all([
            this.prisma.client.recordIndex.findMany({
                where,
                orderBy: { [valueColumn]: sortDir },
                skip,
                take,
                select: { recordId: true },
            }),
            this.prisma.client.recordIndex.count({ where }),
        ]);

        return {
            recordIds: indexes.map((i) => i.recordId),
            total,
        };
    }

    /**
     * Возвращает recordId, отфильтрованные по значению поля.
     */
    async findFilteredRecordIds(
        entityId: string,
        fieldName: string,
        fieldType: string,
        value: string,
    ): Promise<string[]> {
        const valueColumn = this.getValueColumn(fieldType);

        const typedValue = this.parseFilterValue(fieldType, value);
        if (typedValue === null) return [];

        const indexes = await this.prisma.client.recordIndex.findMany({
            where: {
                entityId,
                fieldName,
                [valueColumn]: typedValue,
            },
            select: { recordId: true },
        });

        return indexes.map((i) => i.recordId);
    }

    private getValueColumn(fieldType: string): string {
        switch (fieldType) {
            case 'number':
                return 'valueNumber';
            case 'date':
                return 'valueDate';
            case 'boolean':
                return 'valueBool';
            default:
                return 'valueText';
        }
    }

    private parseFilterValue(
        fieldType: string,
        value: string,
    ): string | number | Date | boolean | null {
        switch (fieldType) {
            case 'number': {
                const num = Number(value);
                return Number.isNaN(num) ? null : num;
            }
            case 'date': {
                const date = new Date(value);
                return Number.isNaN(date.getTime()) ? null : date;
            }
            case 'boolean':
                return value === 'true';
            default:
                return value;
        }
    }
}